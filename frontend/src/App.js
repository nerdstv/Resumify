import React, { useState } from 'react';
import './styles/App.css';
import ResumeForm from './components/ResumeForm';
import VersionDashboard from './components/VersionDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('form');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Resumify</h1>
        <p>Manage your resume with version control and automated PDF generation</p>
        <nav className="app-nav">
          <button 
            className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            Resume Editor
          </button>
          <button 
            className={`nav-btn ${activeTab === 'versions' ? 'active' : ''}`}
            onClick={() => setActiveTab('versions')}
          >
            Version History
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeTab === 'form' ? (
          <ResumeForm />
        ) : (
          <VersionDashboard />
        )}
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 Resumify - A Resume Management Web App</p>
      </footer>
    </div>
  );
}

export default App; 