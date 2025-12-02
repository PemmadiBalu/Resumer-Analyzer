
import React from "react";
import { Link } from "react-router-dom";
import UploadResume from "../components/UploadResume";
import "../styles/home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Header: title + auth links */}
      <header className="home-header">
        <div className="site-title">AI Resume Analyzer</div>
        <div className="header-actions">
          <Link to="/login" className="login-btn">Log in</Link>
          <Link to="/signup" className="signup-btn">Sign up</Link>
        </div>
      </header>

      {/* Center title / hero */}
      <section className="center-title">
        <h1>CV Scoring (ATS)</h1>
        <p>Analyze your resume with AI-powered insights</p>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-box">
          <span className="icon">📊</span>
          <h3>CV Scoring (ATS)</h3>
          <p>AI-powered resume insights</p>
        </div>

        <div className="feature-box">
          <span className="icon">🧾</span>
          <h3>AI Resume Builder</h3>
          <p>Create resumes with AI help</p>
        </div>

        <div className="feature-box">
          <span className="icon">🎯</span>
          <h3>Job Matching Score</h3>
          <p>Find perfect job matches</p>
        </div>

        <div className="feature-box">
          <span className="icon">✍️</span>
          <h3>Cover Letter Generator</h3>
          <p>Create professional letters</p>
        </div>
      </section>

      {/* Upload section */}
      <div className="upload-section">
        <UploadResume />
      </div>
    </div>
  );
}

export default Home;