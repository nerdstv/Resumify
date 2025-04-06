import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ResumeForm.css';

// Base URL for the backend API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function ResumeForm() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin_handle: '',
    linkedin_url: '',
    github_handle: '',
    github_url: '',
    university: '',
    university_location: '',
    degree: '',
    gpa: '',
    gpa_prefix: 'GPA',  // Default GPA prefix
    gpa_scale: '10',    // Default GPA scale
    education_date: '',
    languages: '',
    frameworks: '',
    developer_tools: '',
    coursework: '',
    commitMessage: 'Updated resume'
  });

  // Experience items
  const [experiences, setExperiences] = useState([
    { 
      title: '', 
      company: '', 
      location: '', 
      date: '', 
      description: [''] 
    }
  ]);

  // Project items
  const [projects, setProjects] = useState([
    { 
      title: '', 
      date: '', 
      description: [''] 
    }
  ]);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle experience field changes
  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index][field] = value;
    setExperiences(updatedExperiences);
  };

  // Handle experience description changes
  const handleExperienceDescriptionChange = (expIndex, descIndex, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[expIndex].description[descIndex] = value;
    setExperiences(updatedExperiences);
  };

  // Add new experience description field
  const addExperienceDescription = (expIndex) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[expIndex].description.push('');
    setExperiences(updatedExperiences);
  };

  // Remove experience description field
  const removeExperienceDescription = (expIndex, descIndex) => {
    const updatedExperiences = [...experiences];
    if (updatedExperiences[expIndex].description.length > 1) {
      updatedExperiences[expIndex].description.splice(descIndex, 1);
      setExperiences(updatedExperiences);
    }
  };

  // Add new experience section
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { title: '', company: '', location: '', date: '', description: [''] }
    ]);
  };

  // Remove experience section
  const removeExperience = (index) => {
    if (experiences.length > 1) {
      const updatedExperiences = [...experiences];
      updatedExperiences.splice(index, 1);
      setExperiences(updatedExperiences);
    }
  };

  // Handle project field changes
  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  // Handle project description changes
  const handleProjectDescriptionChange = (projIndex, descIndex, value) => {
    const updatedProjects = [...projects];
    updatedProjects[projIndex].description[descIndex] = value;
    setProjects(updatedProjects);
  };

  // Add new project description field
  const addProjectDescription = (projIndex) => {
    const updatedProjects = [...projects];
    updatedProjects[projIndex].description.push('');
    setProjects(updatedProjects);
  };

  // Remove project description field
  const removeProjectDescription = (projIndex, descIndex) => {
    const updatedProjects = [...projects];
    if (updatedProjects[projIndex].description.length > 1) {
      updatedProjects[projIndex].description.splice(descIndex, 1);
      setProjects(updatedProjects);
    }
  };

  // Add new project section
  const addProject = () => {
    setProjects([
      ...projects,
      { title: '', date: '', description: [''] }
    ]);
  };

  // Remove project section
  const removeProject = (index) => {
    if (projects.length > 1) {
      const updatedProjects = [...projects];
      updatedProjects.splice(index, 1);
      setProjects(updatedProjects);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      // Prepare the data for submission
      const formPayload = new FormData();
      
      // Add all the basic form fields
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });
      
      // Add experiences and projects as JSON strings
      formPayload.append('experience', JSON.stringify(experiences));
      formPayload.append('projects', JSON.stringify(projects));
      
      // Submit the form to the backend
      const response = await axios.post(`${API_URL}/resume`, formPayload);
      
      setSubmitMessage('Resume updated successfully! The PDF is being generated.');
      
      // Optionally redirect to the versions tab after a successful submission
      // setTimeout(() => setActiveTab('versions'), 3000);
    } catch (error) {
      console.error('Error submitting resume:', error);
      setSubmitError(error.response?.data?.message || 'An error occurred while updating your resume.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="resume-form-container">
      <h2>Resume Editor</h2>
      <p>Fill out the form below to update your resume. All changes will be committed to GitHub and a new PDF will be generated automatically.</p>
      
      {submitMessage && <div className="success-message">{submitMessage}</div>}
      {submitError && <div className="error-message">{submitError}</div>}
      
      <form onSubmit={handleSubmit} className="resume-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="linkedin_handle">LinkedIn Username</label>
              <input
                type="text"
                id="linkedin_handle"
                name="linkedin_handle"
                value={formData.linkedin_handle}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="linkedin_url">LinkedIn URL</label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="github_handle">GitHub Username</label>
              <input
                type="text"
                id="github_handle"
                name="github_handle"
                value={formData.github_handle}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="github_url">GitHub URL</label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Education</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="university">University/Institution</label>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="university_location">Location</label>
              <input
                type="text"
                id="university_location"
                name="university_location"
                value={formData.university_location}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="degree">Degree</label>
              <input
                type="text"
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gpa">GPA</label>
              <input
                type="text"
                id="gpa"
                name="gpa"
                value={formData.gpa}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gpa_prefix">GPA Prefix</label>
              <input
                type="text"
                id="gpa_prefix"
                name="gpa_prefix"
                value={formData.gpa_prefix}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gpa_scale">GPA Scale</label>
              <input
                type="text"
                id="gpa_scale"
                name="gpa_scale"
                value={formData.gpa_scale}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="education_date">Date Range</label>
              <input
                type="text"
                id="education_date"
                name="education_date"
                value={formData.education_date}
                onChange={handleInputChange}
                placeholder="e.g., Aug 2018 - May 2022"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Experience</h3>
          
          {experiences.map((exp, expIndex) => (
            <div key={`exp-${expIndex}`} className="experience-item">
              <div className="section-header">
                <h4>Experience #{expIndex + 1}</h4>
                {experiences.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeExperience(expIndex)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(expIndex, 'title', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(expIndex, 'company', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(expIndex, 'location', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Date Range</label>
                  <input
                    type="text"
                    value={exp.date}
                    onChange={(e) => handleExperienceChange(expIndex, 'date', e.target.value)}
                    placeholder="e.g., Jan 2020 - Present"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                {exp.description.map((desc, descIndex) => (
                  <div key={`exp-${expIndex}-desc-${descIndex}`} className="description-item">
                    <input
                      type="text"
                      value={desc}
                      onChange={(e) => handleExperienceDescriptionChange(expIndex, descIndex, e.target.value)}
                      required
                    />
                    {exp.description.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-btn small"
                        onClick={() => removeExperienceDescription(expIndex, descIndex)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  className="add-btn small"
                  onClick={() => addExperienceDescription(expIndex)}
                >
                  Add Description Point
                </button>
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            className="add-btn"
            onClick={addExperience}
          >
            Add Experience
          </button>
        </div>
        
        <div className="form-section">
          <h3>Projects</h3>
          
          {projects.map((proj, projIndex) => (
            <div key={`proj-${projIndex}`} className="project-item">
              <div className="section-header">
                <h4>Project #{projIndex + 1}</h4>
                {projects.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeProject(projIndex)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Project Title</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => handleProjectChange(projIndex, 'title', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="text"
                    value={proj.date}
                    onChange={(e) => handleProjectChange(projIndex, 'date', e.target.value)}
                    placeholder="e.g., May 2022"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                {proj.description.map((desc, descIndex) => (
                  <div key={`proj-${projIndex}-desc-${descIndex}`} className="description-item">
                    <input
                      type="text"
                      value={desc}
                      onChange={(e) => handleProjectDescriptionChange(projIndex, descIndex, e.target.value)}
                      required
                    />
                    {proj.description.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-btn small"
                        onClick={() => removeProjectDescription(projIndex, descIndex)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  className="add-btn small"
                  onClick={() => addProjectDescription(projIndex)}
                >
                  Add Description Point
                </button>
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            className="add-btn"
            onClick={addProject}
          >
            Add Project
          </button>
        </div>
        
        <div className="form-section">
          <h3>Skills</h3>
          
          <div className="form-group">
            <label htmlFor="coursework">Coursework</label>
            <input
              type="text"
              id="coursework"
              name="coursework"
              value={formData.coursework}
              onChange={handleInputChange}
              placeholder="e.g., Data Structures, Machine Learning, Web Development"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="languages">Programming Languages</label>
            <input
              type="text"
              id="languages"
              name="languages"
              value={formData.languages}
              onChange={handleInputChange}
              placeholder="e.g., JavaScript, Python, Java"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="frameworks">Frameworks</label>
            <input
              type="text"
              id="frameworks"
              name="frameworks"
              value={formData.frameworks}
              onChange={handleInputChange}
              placeholder="e.g., React, Node.js, Django"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="developer_tools">Developer Tools</label>
            <input
              type="text"
              id="developer_tools"
              name="developer_tools"
              value={formData.developer_tools}
              onChange={handleInputChange}
              placeholder="e.g., Git, VS Code, Docker"
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Commit Message</h3>
          <div className="form-group">
            <label htmlFor="commitMessage">Describe your changes</label>
            <input
              type="text"
              id="commitMessage"
              name="commitMessage"
              value={formData.commitMessage}
              onChange={handleInputChange}
              placeholder="e.g., Updated work experience and skills"
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Update Resume'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResumeForm; 