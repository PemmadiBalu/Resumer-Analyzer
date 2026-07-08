

import os
import re
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
import spacy
from collections import Counter

# ---------------- App Setup ----------------
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
DB_FILE = "resume_analyzer.db"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "docx"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ---------------- Database ----------------
def db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------- NLP ----------------
nlp = spacy.load("en_core_web_sm")

# Section stopping pattern
stop_pattern = re.compile(r"^(experience|education|projects?|internships?|certifications?|skills|achievements|contact|references)$", re.I)

# ---------------- File Text Extraction ----------------
def extract_text(path):
    if path.endswith(".pdf"):
        return extract_pdf(path)
    elif path.endswith(".docx"):
        return extract_docx(path)
    return ""

def extract_pdf(path):
    text = ""
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def extract_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs).strip()
# ---------------- Education ----------------
def extract_education(text):
    education = []

    start_pattern = re.compile(r"^(education|academic qualifications?)$", re.I)

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    capture = False
    edu_lines = []

    for line in lines:
        if start_pattern.match(line):
            capture = True
            continue

        if capture and stop_pattern.match(line):
            break

        if capture:
            edu_lines.append(line)

    if edu_lines:
        education.append({
            "level": edu_lines[0] if len(edu_lines) > 0 else "",
            "institution": edu_lines[1] if len(edu_lines) > 1 else "",
            "year": "",
            "score": ""
        })

    return education

#-----------------------Basic inform----------------
def extract_name(text):
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # Check the first 10 lines for a likely name
    for line in lines[:10]:

        # Skip lines containing email, phone, or URLs
        if (
            "@" in line
            or "linkedin" in line.lower()
            or "github" in line.lower()
            or "http" in line.lower()
            or re.search(r"\d", line)
        ):
            continue

        # Skip common resume headings
        if line.lower() in [
            "resume",
            "professional summary",
            "summary",
            "objective",
            "skills",
            "education",
            "projects",
            "experience",
            "internship",
            "technical skills"
        ]:
            continue

        words = line.split()

        # A name usually has 2–4 words
        if 2 <= len(words) <= 4:
            return line

    # Fallback to spaCy
    doc = nlp(text)

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text

    return "Not Found"


# ---------------- Contacts & Links ----------------
def extract_email(text):
    match = re.search(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", text)
    return match.group() if match else None

def extract_phone(text):
    match = re.search(r"\b\d{10}\b", text)
    return match.group() if match else None

def extract_links(text):
    links = {"linkedin": None, "github": None, "portfolio": None}
    for url in re.findall(r"https?://\S+|www\.\S+", text):
        if "linkedin" in url.lower():
            links["linkedin"] = url
        elif "github" in url.lower():
            links["github"] = url
        elif not links["portfolio"]:
            links["portfolio"] = url
    return links

def extract_name(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return "Not Found"

# ---------------- Professional Summary ----------------
def extract_professional_summary(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    start = re.compile(r"^(professional summary|summary|profile)$", re.I)
    capture = False
    summary = []

    for line in lines:
        if start.match(line):
            capture = True
            continue
        if capture and stop_pattern.match(line):
            break
        if capture:
            summary.append(line)

    return " ".join(summary) if summary else "Not Found"

# ---------------- Technical Skills ----------------
def extract_technical_skills(text):
    skills = []
    start = re.compile(r"^(technical skills|skills)$", re.I)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    capture = False

    for line in lines:
        if start.match(line):
            capture = True
            continue
        if capture and stop_pattern.match(line):
            break
        if capture:
            for s in re.split(r"[•,|-]", line):
                if s.strip():
                    skills.append(s.strip())
    return skills

# ---------------- Projects ----------------
def extract_projects(text):
    projects = []

    start_pattern = re.compile(r"^projects?$", re.I)

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    capture = False
    current_project = None

    for line in lines:

        if start_pattern.match(line):
            capture = True
            continue

        if capture and stop_pattern.match(line):
            break

        if capture:
            # Project title (short line)
            if len(line) < 80 and not line.endswith("."):
                if current_project:
                    projects.append(current_project)

                current_project = {
                    "project_name": line,
                    "description": ""
                }

            elif current_project:
                current_project["description"] += (
                    " " if current_project["description"] else ""
                ) + line

    if current_project:
        projects.append(current_project)

    return projects

# ---------------- Internships ----------------
def extract_internships(text):
    internships = []

    start_pattern = re.compile(
        r"^(internship experience|internships?|experience)$",
        re.I
    )

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    capture = False
    current = None

    for line in lines:

        if start_pattern.match(line):
            capture = True
            continue

        if capture and stop_pattern.match(line):
            break

        # Detect a new internship (contains "Internship")
        if capture and "internship" in line.lower():
            if current:
                internships.append(current)

            current = {
                "role": line,
                "details": ""
            }

        elif capture and current:
            current["details"] += (
                " " if current["details"] else ""
            ) + line

    if current:
        internships.append(current)

    return internships

# ---------------- Certifications ----------------
def extract_certifications(text):
    certifications = []

    start_pattern = re.compile(
        r"^(certificates?|certifications?|licenses?)$",
        re.I
    )

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    capture = False

    for line in lines:
        if start_pattern.match(line):
            capture = True
            continue

        if capture and stop_pattern.match(line):
            break

        clean = re.sub(r"^[•\-–*]\s*", "", line)

        if capture and clean:
            certifications.append(clean)

    return certifications
# ---------------- Achievements ----------------
def extract_achievements(text):
    achievements = []

    start_pattern = re.compile(r"^(achievements?|awards?)$", re.I)

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    capture = False

    for line in lines:
        if start_pattern.match(line):
            capture = True
            continue

        if capture and stop_pattern.match(line):
            break

        if capture:
            clean = re.sub(r"^[•\-–*]\s*", "", line)
            if clean:
                achievements.append(clean)

    return achievements

# ---------------- ATS & Roles ----------------
def predict_role(text):
    roles = {
        "Data Scientist": ["machine learning", "pandas", "numpy"],
        "Web Developer": ["html", "css", "javascript", "react"],
        "Backend Developer": ["flask", "django", "sql"]
    }
    text = text.lower()
    for role, keys in roles.items():
        if any(k in text for k in keys):
            return role
    return "General IT Role"

def calculate_ats_score(text, skills):
    score = min(len(skills) * 10, 50)
    score += 20 if extract_email(text) and extract_phone(text) else 10
    score += 10 if 300 <= len(text.split()) <= 800 else 5
    return score

def keyword_density(text):
    words = re.findall(r"\b[a-z]+\b", text.lower())
    return dict(Counter(words).most_common(10))

# ---------------- Routes ----------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Server running",
        "message": "Resume Analyzer API is working"
    })

@app.route("/upload", methods=["POST"])
def upload_resume():
    try:
        file = request.files.get("file")

        if not file or not allowed_file(file.filename):
            return jsonify({"error": "Invalid file"}), 400

        path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            secure_filename(file.filename)
        )

        file.save(path)

        text = extract_text(path)

        if not text:
            return jsonify({"error": "Text extraction failed"}), 400

        skills = extract_technical_skills(text)

        result = {
            "status": "Success",
            "name": extract_name(text),
            "email": extract_email(text),
            "phone": extract_phone(text),
            "links": extract_links(text),
            "professional_summary": extract_professional_summary(text),
            "education": extract_education(text),
            "technical_skills": skills,
            "projects": extract_projects(text),
            "internships": extract_internships(text),
            "certifications": extract_certifications(text),
            "achievements": extract_achievements(text),
            "word_count": len(text.split()),
            "predicted_role": predict_role(text),
            "ats_score": calculate_ats_score(text, skills),
            "keyword_density": keyword_density(text)
        }

        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------------- Auth APIs ----------------
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()

    conn = db_connection()

    try:
        conn.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (
                data["username"],
                data["email"],
                generate_password_hash(data["password"])
            )
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Signup successful"
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({
            "success": False,
            "message": "Username or Email already exists"
        }), 409

    finally:
        conn.close()

# ---------------- LOGIN ----------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    conn = db_connection()

    user = conn.execute(
        "SELECT * FROM users WHERE email=? OR username=?",
        (data["email"], data["email"])
    ).fetchone()

    conn.close()

    if user and check_password_hash(user["password"], data["password"]):
        return jsonify({
            "success": True,
            "message": "Login successful",
            "username": user["username"]
        }), 200

    return jsonify({
        "success": False,
        "message": "Invalid email or password"
    }), 401

# ---------------- Run ----------------
if __name__ == "__main__":
    app.run(debug=True)
