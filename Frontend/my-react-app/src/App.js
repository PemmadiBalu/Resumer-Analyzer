
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadResume from "./components/UploadResume";
import ResultCard from "./components/ResultCard";
import Home from "./pages/Home";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signhup"; // Fixed typo

// Wrapper page to safely show ResultCard
function ResultPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>No Data Provided</h2>
      <p>Please upload a resume first.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME PAGE */}
        <Route path="/" element={<Home />} />

        {/* MAIN FEATURE PAGES */}
        <Route path="/upload" element={<UploadResume />} />

        {/* This page normally receives data via navigation state */}
        <Route path="/result" element={<ResultCard />} />

        {/* LOGIN / SIGNUP */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* FUTURE PAGES */}
        <Route path="/job-matching" element={<h1>Job Matching</h1>} />
        <Route path="/cover-letter" element={<h1>Cover Letter Generator</h1>} />
        <Route path="/salary" element={<h1>Salary Estimator</h1>} />
        <Route path="/pricing" element={<h1>Pricing Page</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
