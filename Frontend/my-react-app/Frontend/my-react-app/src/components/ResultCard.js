
import React from "react";
import "../styles/result.css";

function ResultCard({ data }) {
  if (!data) {
    return <div className="result-card">Loading analysis...</div>;
  }

  const {
    name = "Not Found",
    email = "Not Found",
    phone = "Not Found",
    linkedin = "Not Found",
    github = "Not Found",
    portfolio = "Not Found",
    professional_summary = "Not Found",
    education = [],
    technical_skills = [],
    projects = [],
    internships = [],
    certifications = [],
    achievements = [],
    word_count = 0,
    predicted_role = "N/A",
    job_fit = {},
    ats_score = "N/A",
    summary = "N/A"
  } = data;

  return (
    <div className="result-card">
      <h2>Resume Analysis Result</h2>
      <p><strong>Status:</strong> {summary}</p>

      {/* Basic Info */}
      <section>
        <h3>Basic Information</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>LinkedIn:</strong> {linkedin}</p>
        <p><strong>GitHub:</strong> {github}</p>
        <p><strong>Portfolio Link:</strong> {portfolio}</p>
      </section>

      {/* Professional Summary */}
      <section>
        <h3>Professional Summary</h3>
        <p>{professional_summary}</p>
      </section>

      {/* Education */}
      <section>
        <h3>Education</h3>
        {education.length > 0 ? (
          <ul>
            {education.map((edu, idx) => (
              <li key={idx}>
                <p><strong>Degree:</strong> {edu.education || "N/A"}</p>
                <p><strong>Institution:</strong> {edu.institution || "N/A"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Not Found</p>
        )}
      </section>

      {/* Skills */}
      <section>
        <h3>Technical Skills</h3>
        <p>{technical_skills.length > 0 ? technical_skills.join(", ") : "Not Found"}</p>
      </section>

      {/* Projects */}
      <section>
        <h3>Projects</h3>
        {projects.length > 0 ? (
          <ul>{projects.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
        ) : <p>Not Found</p>}
      </section>

      {/* Internships */}
      <section>
        <h3>Internships</h3>
        {internships.length > 0 ? (
          <ul>{internships.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
        ) : <p>Not Found</p>}
      </section>

      {/* Certifications */}
      <section>
        <h3>Certifications</h3>
        {certifications.length > 0 ? (
          <ul>{certifications.map((c, idx) => <li key={idx}>{c}</li>)}</ul>
        ) : <p>Not Found</p>}
      </section>

      {/* Achievements */}
      <section>
        <h3>Achievements</h3>
        {achievements.length > 0 ? (
          <ul>{achievements.map((a, idx) => <li key={idx}>{a}</li>)}</ul>
        ) : <p>Not Found</p>}
      </section>

      {/* Misc */}
      <section>
        <h3>Additional Info</h3>
        <p><strong>Word Count:</strong> {word_count}</p>
        <p><strong>Predicted Role:</strong> {predicted_role}</p>
        <p><strong>ATS Score:</strong> {ats_score}/100</p>
      </section>

      {/* Job Fit */}
      <section>
        <h3>Job Fit</h3>
        {Object.keys(job_fit).length > 0 ? (
          <ul>
            {Object.keys(job_fit).map((job, idx) => (
              <li key={idx}><strong>{job}:</strong> {job_fit[job]}</li>
            ))}
          </ul>
        ) : <p>No Job Fit Data</p>}
      </section>
    </div>
  );
}

export default ResultCard;
