📌 AI-Powered Resume Analyzer

The AI-Powered Resume Analyzer is a full-stack web application designed to evaluate resumes using Natural Language Processing (NLP). It extracts key skills from the uploaded PDF and compares them with industry-standard skill sets. The application helps job seekers identify missing skills and provides improvement suggestions.

🧩 Tech Stack
Layer	Technology
Frontend	React.js
Backend	Flask (Python)
AI/NLP	spaCy / Skill Matching
File Parsing	PyPDF2 / PDFPlumber
Communication	REST API (Axios Fetch HTTP Requests)

📁 Folder Structure
AI-Powered-Resume-Analyzer/

# Back-end/
- app.py
- requirements.txt

# Front-end/
- my-app/
- src/
components/
 - Upload.js
- ResultCard.js
  - App.js
  - index.js
 - styles/
  - result.css
  - upload.css
 - package.json

🚀 Features

📄 Upload resume as a PDF file

🤖 AI automatically extracts skills from resume

🎯 Shows skill match percentage

📌 Highlights missing skills and suggestions

⚡ Real-time UI updates with React

🧑‍💼 ATS-friendly improvement tips

🔧 Installation & Setup
1️⃣ Backend Setup (Flask API)
cd Back-end
pip install -r requirements.txt
python app.py


The backend server will run at:

http://127.0.0.1:5000

2️⃣ Frontend Setup (React App)
cd Front-end/my-app
npm install
npm start


React app will run at:

http://localhost:3000

🔄 How It Works
Step	Action
1	User uploads resume PDF from UI
2	File sent to Flask backend
3	NLP extracts skills & compares with expected skills
4	Results sent back to React
5	User views skill score + suggestions
📌 API Endpoints
Method	Endpoint	Description
POST	/analyze	Upload and analyze resume
🛠️ Future Improvements

📌 Job-role based skill matching

📈 Generate downloadable PDF reports

☁️ Deploy using AWS / Render / Vercel

🧠 Use more advanced AI LLM skill extraction

🤝 Contributing

Pull requests and new ideas are welcome!
Feel free to open issues for enhancements or bug reports.

📜 License

MIT License – Free to use and modify.
