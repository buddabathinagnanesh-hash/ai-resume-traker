# AI-Powered Job Application Tracker & Resume Matcher 

A full-stack, "Tier-1" MVP application to track job applications and optimize your resume using AI-driven keyword matching. Built with Python (FastAPI) and Vanilla JS.

## 🌟 Features
- **Job Tracker Dashboard**: visually track companies, roles, and status (Applied, Interview, Offer, etc.).
- **Smart Resume Matcher**: Compare your resume text against a Job Description (JD).
- **Match Score**: Get a 0-100% compatibility score based on keyword coverage.
- **Actionable Insights**: See exactly which keywords you are missing from the JD.
- **Modern UI**: Dark-themed, responsive interface with clean visual design.

## 🛠 Tech Stack
- **Backend**: Python, FastAPI, SQLite, SQLAlchemy.
- **Frontend**: HTML5, CSS3 (Custom Glassmorphism), JavaScript (ES6+).
- **AI Logic**: Custom Tokenization & Set-based Entity Extraction (Runs 100% locally, no heavy models).

## 📂 Architecture
- `/backend`: Contains the API logic, database models, and AI service.
    - `main.py`: Entry point for the FastAPI server.
    - `ai_service.py`: Pure Python logic for keyword matching (Tokenization + Stopword filtering).
    - `database.py`: SQLite connection handling.
- `/frontend`: Contains the user interface.
    - `index.html`: The main dashboard structure.
    - `styles.css`: All visual styling (Variables, Flexbox/Grid, Animations).
    - `script.js`: Handles API communication and DOM updates.

## 🚀 How to Run Locally

### 1. Backend Setup
1. Open a terminal in the root directory.
2. Navigate to the backend folder or stay in root.
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Run the server:
   ```bash
   # If you are in the root directory:
   uvicorn backend.main:app --reload

   # If you are in the backend directory:
   # uvicorn main:app --reload
   ```
   *The server will start at `http://127.0.0.1:8000`*

### 2. Frontend Setup
1. Simply open `frontend/index.html` in your web browser.
   - You can double-click the file in File Explorer.
   - OR use a simple HTTP server (optional but recommended for best experience):
     ```bash
     python -m http.server 3000
     ```
     Then go to `http://localhost:3000/frontend/`

### 3. Usage
- **Add Application**: Fill in the details on the "Application Tracker" tab.
- **Analyze Resume**: Switch to "Resume Matcher", paste your resume text and a JD, and click "Analyze Match".

## 📷 Screenshots
<img width="1918" height="1030" alt="image" src="https://github.com/user-attachments/assets/09e683f1-ee81-4491-b35f-74203dd1da42" />
<img width="1904" height="1028" alt="image" src="https://github.com/user-attachments/assets/341901d1-394b-46d2-b3e4-6db3075f5810" />



---
Built for practical job application tracking and resume optimization.
