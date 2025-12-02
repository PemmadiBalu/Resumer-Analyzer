
import React, { useState } from "react";
import axios from "axios";
import ResultCard from "./ResultCard";
import "../styles/upload.css";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Feedback
  const [rating, setRating] = useState(3);
  const [feedbackText, setFeedbackText] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError("");

    if (selectedFile) {
      document.getElementById("fileName").textContent = selectedFile.name;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    // Backend expects the key "file"
    formData.append("file", file);
    formData.append("email", "test@gmail.com");

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to process the resume. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = () => {
    alert("Thank you for your feedback!");
    setRating(3);
    setFeedbackText("");
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">AI Resume Analyzer</h2>

      <div className="steps-box">
        <h3>How It Works</h3>
        <ul>
          <li>📄 Upload your resume (PDF/DOCX)</li>
          <li>🤖 AI analyzes skills & ATS compatibility</li>
          <li>📊 Provides job-fit score</li>
          <li>🚀 Suggests improvements instantly</li>
        </ul>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        {/* Custom File Input */}
        <div className="custom-file-box">
          <input
            type="file"
            id="fileUpload"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            hidden
          />
          <label htmlFor="fileUpload" className="file-label">
            Select a Resume File
          </label>
          <span id="fileName">No file chosen</span>
        </div>

        <button
          type="submit"
          className="upload-btn"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {result && (
        <>
          <ResultCard data={result} />

          <div className="review-box">
            <h3 className="review-title">Your Feedback Matters</h3>

            <input
              type="range"
              min="1"
              max="5"
              value={rating}
              className="feedback-slider"
              onChange={(e) => setRating(Number(e.target.value))}
            />
            <p className="slider-value">Your Rating: {rating} / 5</p>

            <textarea
              className="feedback-input"
              placeholder="Write your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            ></textarea>

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
