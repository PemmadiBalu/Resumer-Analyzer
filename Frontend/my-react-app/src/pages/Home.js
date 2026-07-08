

import React from "react";
import { Link } from "react-router-dom";
import UploadResume from "../components/UploadResume";
import "../styles/home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="site-title">AI Resume Analyzer</div>

        <nav className="header-actions">
          <Link to="/login" className="login-btn">Log in</Link>
          <Link to="/signup" className="signup-btn">Sign up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="center-title">
        <h1>CV Scoring (ATS)</h1>
        <p>Analyze your resume with AI-powered insights</p>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-box">
          <span className="icon">📊</span>
          <h3>CV Scoring (ATS)</h3>
          <p>AI-powered resume evaluation</p>
        </div>

        <div className="feature-box">
          <span className="icon">🧾</span>
          <h3>AI Resume Builder</h3>
          <p>Create resumes with AI assistance</p>
        </div>

        <div className="feature-box">
          <span className="icon">🎯</span>
          <h3>Job Matching Score</h3>
          <p>Discover suitable job roles</p>
        </div>

        <div className="feature-box">
          <span className="icon">✍️</span>
          <h3>Cover Letter Generator</h3>
          <p>Generate professional cover letters</p>
        </div>
      </section>

      {/* Upload Resume */}
      <section className="upload-section">
        <UploadResume />
      </section>
    </div>
  );
}

export default Home;
