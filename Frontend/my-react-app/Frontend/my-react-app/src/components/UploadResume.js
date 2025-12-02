

import React, { useState } from "react";
import axios from "axios";
import ResultCard from "./ResultCard";
import "../styles/upload.css";

function UploadResume() {
  // 🔹 File upload states
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // 🔹 Feedback states
  const [rating, setRating] = useState(3); // default rating 3
  const [feedbackText, setFeedbackText] = useState("");

  // 🔹 Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null); // clear previous result
    setError("");
  };

  // 🔹 Handle resume upload and analysis
  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!file) {
    setError("Please select a file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
 // 🔹 key must be 'resume'
  formData.append("email", "test@gmail.com"); // optional: user email

  setLoading(true);
  setError("");

  try {
    const res = await axios.post("https://resumer-analyzer.onrender.com/upload", formData);
    setResult(res.data); // store scan result
  } catch (err) {
    console.error(err);
    setError(
      err.response?.data?.error || "Failed to process the resume. Try again."
    );
  } finally {
    setLoading(false);
  }
};

  // 🔹 Handle feedback submission
  const handleFeedbackSubmit = () => {
    console.log("Rating:", rating);
    console.log("Feedback:", feedbackText);

    // Reset feedback
    setRating(3);
    setFeedbackText("");
    alert("Thank you for your feedback!");
  };

  return (
    <div className="upload-container">
      {/* 🔹 TITLE */}
      <h2 className="upload-title">AI Resume Analyzer</h2>

      {/* 🔹 4 Steps Guide */}
      <div className="steps-box">
        <h3>How It Works</h3>
        <ul>
          <li>1️⃣ Upload your resume in PDF or DOCX format.</li>
          <li>2️⃣ Our AI extracts skills, experience, projects & education.</li>
          <li>3️⃣ ATS (Applicant Tracking System) score is calculated.</li>
          <li>4️⃣ Get job-fit suggestions and improvements instantly.</li>
        </ul>
      </div>

      {/* 🔹 Upload Form */}
      
<form
  className="upload-form"
  onSubmit={handleSubmit}
  encType="multipart/form-data"
>
  <input
   type="file"
   name="file"   // Ensure name is file
   accept=".pdf,.docx"
   onChange={handleFileChange}
  />


  <button
    type="submit"
    className="upload-btn"
    disabled={loading}
    aria-disabled={loading}
  >
    {loading ? "Analyzing..." : "Upload & Analyze"}
  </button>
</form>


      {error && <p className="error-msg">{error}</p>}

      {/* 🔹 Show result and feedback only after scan */}
      {result && (
        <>
          <ResultCard data={result} />

          <div className="review-box">
            <h3 className="review-title">Your Feedback Matters</h3>
            <p className="review-text">
              Rate your experience with our AI Resume Analyzer:
            </p>

            {/* Slider for rating */}
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              className="feedback-slider"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
            <p className="slider-value">Your Rating: {rating} / 5</p>

            {/* Feedback textarea */}
            <textarea
              className="feedback-input"
              placeholder="Write your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            ></textarea>

            {/* Submit feedback button */}
            <button
              type="button"
              className="submit-feedback"
              onClick={handleFeedbackSubmit}
            >
              Submit Feedback
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UploadResume;
