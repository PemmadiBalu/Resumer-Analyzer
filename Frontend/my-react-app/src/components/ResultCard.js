

import React from "react";
import "../styles/result.css";

function ResultCard({ data }) {
  if (!data) {
    return <div className="result-card">Loading analysis...</div>;
  }

  const {
    name,
    email,
    phone,
    links = {}, // links object from backend
    professional_summary,
    education = [],
    technical_skills = [],
    projects = [],
    internships = [],
    certifications = [],
    achievements = [],
    word_count,
    predicted_role,
    job_fit = {},
    ats_score,
    status
  } = data;

  const { linkedin, github, portfolio } = links;

  return (
    <div className="result-card">
      <h2>Resume Analysis Result</h2>
      <p><strong>Status:</strong> {status || "N/A"}</p>

      {/* Basic Info */}
      <section>
        <h3>Basic Information</h3>
        <p><strong>Name:</strong> {name || "N/A"}</p>
        <p><strong>Email:</strong> {email || "N/A"}</p>
        <p><strong>Phone:</strong> {phone || "N/A"}</p>
        <p><strong>LinkedIn:</strong> {linkedin || "N/A"}</p>
        <p><strong>GitHub:</strong> {github || "N/A"}</p>
        <p><strong>Portfolio:</strong> {portfolio || "N/A"}</p>
      </section>

      {/* Professional Summary */}
      <section>
        <h3>Professional Summary</h3>
        {professional_summary ? <p>{professional_summary}</p> : <p>No professional summary found.</p>}
      </section>

      {/* Projects */}
      <section>
        <h3>Projects</h3>
        {projects.length > 0 ? (
          <ul>
             {projects.map((project, idx) => {
             const projectName = project.project_name || project;
             const projectDesc = project.description || "";

            return (
              <li key={idx}>
               <strong>{projectName}</strong>
               {projectDesc && <p>{projectDesc}</p>}
             </li>
           );
        })}
          </ul>
        ) : (
          <p>No projects found.</p>
        )}
      </section>

      {/* Education */}
      <section>
        <h3>Education</h3>
          {education && education.length > 0 ? (
            <ul> {education.map((edu, i) => ( 
            <li key={i} style={{ marginBottom: "20px" }}> 
            {edu.level && (
              <p>
                <strong>Degree:</strong> {edu.level}
                </p>
              )}
              {edu.institution && (
                <p> <strong>Institution:</strong> {edu.institution} </p>
                )}
                {edu.year && ( <p> <strong>Year:</strong> {edu.year} </p>
              )}
              {edu.score && (
                <p> <strong>CGPA:</strong> {edu.score} </p>
                )}
                 </li>
              ))}
              </ul>
              ) : (
              <p>Education details not found.</p>
             )}
       </section>

      {/* Technical Skills */}
      <section>
        <h3>Technical Skills</h3>
        <p>{technical_skills.length > 0 ? technical_skills.join(", ") : "No skills found."}</p>
      </section>

      {/* Internships */}
      <section>
        <h3>Internships / Internship Experience</h3>
        {internships && internships.length > 0 ? (
          <ul>
            {internships.map((intern, index) => (
              <li key={index} style={{ marginBottom: "15px" }}>
                <h4>{intern.role}</h4>
                {intern.details && (
                  <p>{intern.details}</p>
                )}
              </li>
            ))}
          </ul>
          ) : (
           <p>No internships found.</p>
          )}
        </section>  

      {/* Certifications */}
      <section>
         <h3>Certifications</h3>
          {certifications.length > 0 ? (
           <ul>{certifications.map((cert, i) => ( <li key={i}>{cert}</li>))} </ul>
          ) : (
            <p>No certifications found.</p>
          )}
      </section>

      {/* Achievements */}
      <section>
        <h3>Achievements</h3>
        {achievements.length > 0 ? (
          <ul>{achievements.map((a, i) => <li key={i}>{a}</li>)}</ul>
        ) : (
          <p>No achievements found.</p>
        )}
      </section>

      {/* Additional Info */}
      <section>
        <h3>Additional Info</h3>
        <p>Word Count: {word_count || "N/A"}</p>
        <p>Predicted Role: {predicted_role || "N/A"}</p>
        <p>ATS Score: {ats_score !== undefined ? `${ats_score}/100` : "N/A"}</p>
      </section>

      {/* Job Fit */}
      <section>
        <h3>Job Fit</h3>
        {Object.keys(job_fit).length > 0 ? (
          <ul>{Object.entries(job_fit).map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>
        ) : (
          <p>No job fit data available.</p>
        )}
      </section>
    </div>
  );
}

export default ResultCard;
