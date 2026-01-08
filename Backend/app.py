
import os
import sqlite3
import re
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

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    cur.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            filename TEXT,
            extracted_text TEXT,
            ats_score REAL,
            skills TEXT,
            job_fit TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------- NLP Setup ----------------
nlp = spacy.load("en_core_web_sm")

# ---------------- Extractors ----------------
def extract_text(path):
    if path.lower().endswith(".pdf"):
        return extract_pdf(path)
    elif path.lower().endswith(".docx"):
        return extract_docx(path)
    return ""

def extract_pdf(path):
    text = ""
    try:
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print("PDF Extraction Error:", e)
    return text.strip()

def extract_docx(path):
    text = ""
    try:
        doc = Document(path)
        for p in doc.paragraphs:
            text += p.text + "\n"
    except Exception as e:
        print("DOCX Extraction Error:", e)
    return text.strip()

# ---------------- Contact & Links ----------------
def extract_email(text):
    match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None

def extract_phone(text):
    match = re.search(r"\+?\d[\d\-\s]{7,}\d", text)
    return match.group(0) if match else None

def extract_links(text):
    urls = re.findall(r"(https?://[^\s]+|www\.[^\s]+|linkedin\.com[^\s]+|github\.com[^\s]+)", text, re.IGNORECASE)
    github, linkedin, portfolios = None, None, []

    for url in urls:
        url = url.rstrip('.,;:()[]')
        if url.startswith("www.") or url.startswith("linkedin.com") or url.startswith("github.com"):
            url = "https://" + url if not url.startswith("http") else url

        if "linkedin.com" in url.lower() and not linkedin:
            linkedin = url
        elif "github.com" in url.lower() and not github:
            github = url
        else:
            portfolios.append(url)

    portfolio = portfolios[0] if portfolios else None
    return github, linkedin, portfolio

# ---------------- NLP-Based Extractors ----------------
def extract_name_nlp(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return "Not Found"

def extract_skills_nlp(text):
    predefined_skills = [
        "python", "sql", "java", "c++", "machine learning", "deep learning",
        "nlp", "flask", "django", "react", "javascript", "html", "css",
        "pandas", "numpy", "tensorflow", "keras", "excel", "power bi", "tableau"
    ]
    doc = nlp(text.lower())
    found_skills = set()
    for token in doc:
        if token.text in predefined_skills:
            found_skills.add(token.text)
    for chunk in doc.noun_chunks:
        if chunk.text.lower() in predefined_skills:
            found_skills.add(chunk.text.lower())
    return list(found_skills)

def extract_professional_summary_nlp(text):
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents]
    return " ".join(sentences[:3]) if sentences else "Not Found"

def extract_soft_skills(text):
    soft_skills = [
        "communication", "leadership", "teamwork",
        "problem solving", "critical thinking",
        "time management", "adaptability"
    ]
    text_lower = text.lower()
    return [skill for skill in soft_skills if skill in text_lower]

def ats_keyword_density(text):
    doc = nlp(text.lower())
    words = [token.text for token in doc if token.is_alpha]
    freq = Counter(words)
    common = freq.most_common(10)
    return {word: count for word, count in common}

# ---------------- Professional Summary ----------------
def extract_Professional_Summary(text):
    return extract_professional_summary_nlp(text)

# ---------------- Education ----------------
def extract_education(text):
    education_entries = []
    degree_keywords = [
        r"B\.?Tech", r"B\.?E", r"M\.?Tech", r"BSc", r"MSc", r"BCA", r"MCA", r"PhD",
        r"Bachelor", r"Master", r"Intermediate", r"SSC", r"HSC", r"High School", r"Secondary School"
    ]
    degree_pattern = "|".join(degree_keywords)
    year_pattern = r"(20\d{2}–20\d{2}|20\d{2}|19\d{2})"
    cgpa_pattern = r"CGPA[:\s]?([\d\.]+)"
    institute_keywords = ["Institute", "College", "School", "University"]

    lines = text.split("\n")
    idx = 0
    while idx < len(lines):
        line = lines[idx].strip()
        while idx + 1 < len(lines) and not re.search(degree_pattern, lines[idx + 1], re.IGNORECASE) and not any(k in lines[idx + 1] for k in institute_keywords):
            line += " " + lines[idx + 1].strip()
            idx += 1
        if re.search(degree_pattern, line, re.IGNORECASE):
            edu_entry = {}
            edu_entry["education"] = line
            next_line = lines[idx + 1].strip() if idx + 1 < len(lines) else ""
            parts = re.split(r"\||-", next_line)
            institute = parts[0].strip() if len(parts) > 0 else "Not Found"
            cgpa, year = "Not Found", "Not Found"
            if len(parts) > 1:
                cgpa_match = re.search(cgpa_pattern, parts[1], re.IGNORECASE)
                year_match = re.search(year_pattern, parts[1])
                cgpa = cgpa_match.group(1) if cgpa_match else "Not Found"
                year = year_match.group(0) if year_match else "Not Found"
            else:
                cgpa_match = re.search(cgpa_pattern, next_line, re.IGNORECASE)
                year_match = re.search(year_pattern, next_line)
                cgpa = cgpa_match.group(1) if cgpa_match else "Not Found"
                year = year_match.group(0) if year_match else "Not Found"
            edu_entry["institution"] = institute
            edu_entry["cgpa"] = cgpa
            edu_entry["year"] = year
            education_entries.append(edu_entry)
            idx += 2
        else:
            idx += 1
    return education_entries or [{"education": "Not Found", "institution": "Not Found", "cgpa": "Not Found", "year": "Not Found"}]

# ---------------- Skills & Job Fit ----------------
def predict_role(text):
    roles_keywords = {
        "Data Scientist": ["machine learning", "data analysis", "pandas", "numpy", "tensorflow", "keras", "nlp"],
        "Data Analyst": ["excel", "tableau", "power bi", "sql", "pandas"],
        "Frontend Developer": [ "html", "css", "javascript", "react", "angular", "vue"],
        "Backend Developer": [ "python", "java", "C++", "flask", "django", "sql", "apis"],
        "Full Stack Developer": ["react", "flask", "django", "javascript", "html", "css"],
        "Backend Developer": ["flask", "django", "apis", "sql", "postgres", "mysql"],
        "Machine Learning Engineer": ["tensorflow", "keras", "pytorch", "deep learning"]
    }
    text = text.lower()
    for role, keywords in roles_keywords.items():
        if any(k in text for k in keywords):
            return role
    return "General IT Role"

def calculate_job_fit(text):
    roles = {
        "Data Scientist": ["machine learning", "data analysis", "python", "pandas"],
        "Web Developer": ["html", "css", "javascript", "react"],
        "Backend Developer": ["flask", "django", "apis", "sql"]
    }
    fit = {}
    text = text.lower()
    for role, keys in roles.items():
        matches = sum(1 for k in keys if k in text)
        fit[role] = f"{int((matches / len(keys)) * 100)}% Match" if keys else "0% Match"
    return fit

def calculate_ats_score(text, skills):
    skill_score = min(len(skills) * 10, 50)
    contact_score = 20 if extract_email(text) and extract_phone(text) else 10
    structure_score = (sum(1 for k in ["experience", "education", "skills", "projects"] if k in text.lower()) / 4) * 20
    length_score = 10 if 300 <= len(text.split()) <= 800 else 5 if 150 <= len(text.split()) < 300 else 0
    return round(skill_score + contact_score + structure_score + length_score, 2)

# ---------------- Sections (Projects, Internships, Certifications, Achievements) ----------------
def extract_projects(text):
    projects = []
    project_keywords = [
        r"Project[s]?:", r"Notable Project[s]?", r"Key Project[s]?", r"Project[s]? Experience"
    ]
    project_pattern = "|".join(project_keywords)
    sections = re.split(project_pattern, text, flags=re.IGNORECASE)
    
    for section in sections[1:]:
        lines = section.split("\n")[:3]
        project_text = " ".join(lines).strip()
        if project_text:
            projects.append(project_text)
    
    return projects if projects else ["Not Found"]

def extract_internships(text):
    internships = []
    internship_keywords = [
        r"Internship[s]?", r"Intern[s]?", r"Internship Experience"
    ]
    internship_pattern = "|".join(internship_keywords)
    sections = re.split(internship_pattern, text, flags=re.IGNORECASE)
    
    for section in sections[1:]:
        lines = section.split("\n")[:3]
        internship_text = " ".join(lines).strip()
        if internship_text:
            internships.append(internship_text)
    
    return internships if internships else ["Not Found"]

def extract_certifications(text):
    certifications = []
    cert_keywords = [
        r"Certification[s]?", r"Certified", r"Certificate[s]?", r"Certification[s]? Experience"
    ]
    cert_pattern = "|".join(cert_keywords)
    sections = re.split(cert_pattern, text, flags=re.IGNORECASE)
    
    for section in sections[1:]:
        lines = section.split("\n")[:2]
        cert_text = " ".join(lines).strip()
        if cert_text:
            certifications.append(cert_text)
    
    return certifications if certifications else ["Not Found"]

def extract_achievements(text):
    achievements = []
    achievement_keywords = [
        r"Achievement[s]?", r"Award[s]?", r"Recognition[s]?", r"Accomplishment[s]?"
    ]
    achievement_pattern = "|".join(achievement_keywords)
    sections = re.split(achievement_pattern, text, flags=re.IGNORECASE)
    
    for section in sections[1:]:
        lines = section.split("\n")[:2]
        achievement_text = " ".join(lines).strip()
        if achievement_text:
            achievements.append(achievement_text)
    
    return achievements if achievements else ["Not Found"]

# ---------------- Upload Route ----------------
@app.route("/upload", methods=["POST"])
def upload_resume():
    try:
        if "file" not in request.files:
            return jsonify({"error": "Key 'file' missing in request"}), 400
        file = request.files["file"]
        if not file or file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(file.filename).lower()
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        text = extract_text(filepath) or ""
        word_count = len(text.split())
        skills = extract_skills_nlp(text)
        ats_score = calculate_ats_score(text, skills)
        predicted_role = predict_role(text)
        job_fit = calculate_job_fit(text)
        github, linkedin, portfolio = extract_links(text)
        professional_summary = extract_professional_summary_nlp(text)
        name = extract_name_nlp(text)
        soft_skills = extract_soft_skills(text)
        keyword_density = ats_keyword_density(text)

        result = {
            "name": name,
            "email": extract_email(text) or "Not Found",
            "phone": extract_phone(text) or "Not Found",
            "linkedin": linkedin or "Not Found",
            "github": github or "Not Found",
            "portfolio": portfolio or "Not Found",
            "professional_summary": professional_summary,
            "education": extract_education(text),
            "technical_skills": skills,
            "soft_skills": soft_skills,
            "projects": extract_projects(text),
            "internships": extract_internships(text),
            "certifications": extract_certifications(text),
            "achievements": extract_achievements(text),
            "word_count": word_count,
            "predicted_role": predicted_role,
            "job_fit": job_fit,
            "ats_score": ats_score,
            "keyword_density": keyword_density,
            "summary": "NLP Resume Analysis Completed"
        }
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- Home Route ----------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Resume Analyzer API Running"}), 200

# ---------------- Signup API ----------------
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    if not username or not email or not password:
        return jsonify({"success": False, "message": "All fields required"}), 400

    hashed_pw = generate_password_hash(password)
    try:
        conn = db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                    (username, email, hashed_pw))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Signup successful"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Email or Username exists"}), 409

# ---------------- Login API ----------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email_or_username = data.get("email") or data.get("username")
    password = data.get("password")
    if not email_or_username or not password:
        return jsonify({"success": False, "message": "Email/Username and password required"}), 400

    try:
        conn = db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = ? OR username = ?", (email_or_username, email_or_username))
        user = cur.fetchone()
        conn.close()

        if not user:
            return jsonify({"success": False, "message": "User does not exist"}), 401
        if not check_password_hash(user["password"], password):
            return jsonify({"success": False, "message": "Invalid password"}), 401

        return jsonify({
            "success": True,
            "message": "Login successful",
            "username": user["username"],
            "email": user["email"]
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Server Error"}), 500

# ---------------- Run App ----------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
