import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/VersionDashboard.css';

// Base URL for the backend API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function VersionDashboard() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch versions on component mount
  useEffect(() => {
    fetchVersions();
  }, []);
  
  // Function to fetch versions from the backend
  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/versions`);
      
      if (response.data.success) {
        setVersions(response.data.versions);
      } else {
        setError('Failed to fetch resume versions.');
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      setError(error.response?.data?.message || 'An error occurred while fetching versions.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to download a specific PDF version
  const downloadPDF = async (workflowRunId) => {
    try {
      // Direct download link
      window.open(`${API_URL}/pdf/${workflowRunId}`, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="version-dashboard">
      <h2>Version History</h2>
      <p>View and download previous versions of your resume.</p>
      
      {loading ? (
        <div className="loading">Loading versions...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : versions.length === 0 ? (
        <div className="empty-message">
          <p>No resume versions found. Create your first resume using the Resume Editor.</p>
        </div>
      ) : (
        <div className="versions-table-container">
          <table className="versions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Author</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id}>
                  <td>{formatDate(version.date)}</td>
                  <td>{version.message}</td>
                  <td>{version.author}</td>
                  <td>
                    {version.workflowRunId ? (
                      <button 
                        className="download-btn"
                        onClick={() => downloadPDF(version.workflowRunId)}
                      >
                        Download PDF
                      </button>
                    ) : (
                      <span className="processing-label">Processing...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="refresh-action">
        <button 
          className="refresh-btn"
          onClick={fetchVersions}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}

export default VersionDashboard; 