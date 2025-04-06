require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { Octokit } = require('octokit');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure Octokit for GitHub API
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for handling form data
const upload = multer();

// Helper function to replace placeholders in LaTeX template
function fillTemplate(templateContent, userData) {
  let filledTemplate = templateContent;
  
  // Replace simple placeholders
  for (const [key, value] of Object.entries(userData)) {
    if (typeof value === 'string') {
      // Make sure to use global replace
      const placeholder = new RegExp(`<<${key.toUpperCase()}>>`, 'g');
      filledTemplate = filledTemplate.replace(placeholder, value);
    }
  }
  
  // Special handling for GPA placeholders
  if (userData.gpa) {
    filledTemplate = filledTemplate.replace(/<<GPA>>/g, userData.gpa);
    filledTemplate = filledTemplate.replace(/<<GPA_PREFIX>>/g, userData.gpa_prefix || 'GPA');
    filledTemplate = filledTemplate.replace(/<<GPA_SCALE>>/g, userData.gpa_scale || '10');
  }
  
  // Handle complex placeholders (EXPERIENCE_ITEMS, PROJECT_ITEMS)
  // These would require specific formatting based on the LaTeX template
  if (userData.experience && Array.isArray(userData.experience)) {
    const experienceItems = userData.experience.map(exp => {
      // Handle description array or string
      let descriptionItems = '';
      if (Array.isArray(exp.description)) {
        descriptionItems = exp.description.map(desc => `\\resumeItem{${desc}}`).join('\n        ');
      } else if (typeof exp.description === 'string') {
        // If the description is a single string, split by new lines
        descriptionItems = exp.description.split('\n')
          .map(desc => desc.trim())
          .filter(desc => desc.length > 0)
          .map(desc => `\\resumeItem{${desc}}`)
          .join('\n        ');
      }
      
      return `
    \\resumeSubheading
      {${exp.title || ''}}{${exp.date || ''}}
      {${exp.company || ''}}{${exp.location || ''}}
      \\resumeItemListStart
        ${descriptionItems}
      \\resumeItemListEnd
    `;
    }).join('\n    ');
    
    filledTemplate = filledTemplate.replace('<<EXPERIENCE_ITEMS>>', experienceItems);
  }
  
  if (userData.projects && Array.isArray(userData.projects)) {
    const projectItems = userData.projects.map(proj => {
      // Handle description array or string
      let descriptionItems = '';
      if (Array.isArray(proj.description)) {
        descriptionItems = proj.description.map(desc => `\\resumeItem{${desc}}`).join('\n            ');
      } else if (typeof proj.description === 'string') {
        // If the description is a single string, split by new lines
        descriptionItems = proj.description.split('\n')
          .map(desc => desc.trim())
          .filter(desc => desc.length > 0)
          .map(desc => `\\resumeItem{${desc}}`)
          .join('\n            ');
      }
      
      return `
      \\resumeProjectHeading
          {\\textbf{${proj.title || ''}}}{${proj.date || ''}}
          \\resumeItemListStart
            ${descriptionItems}
          \\resumeItemListEnd
    `;
    }).join('\n      ');
    
    filledTemplate = filledTemplate.replace('<<PROJECT_ITEMS>>', projectItems);
  }
  
  // Handle missing placeholders with empty strings to avoid LaTeX compilation errors
  filledTemplate = filledTemplate.replace(/<<[A-Z_]+>>/g, '');
  
  return filledTemplate;
}

// API Routes

// 1. Submit resume data
app.post('/api/resume', upload.none(), async (req, res) => {
  try {
    // Get form data
    const formData = req.body;
    const commitMessage = formData.commitMessage || 'Update resume';
    
    // Read the LaTeX template
    const templatePath = path.join(__dirname, 'latexTemplate.tex');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Fill the template with user data
    const filledTemplate = fillTemplate(templateContent, formData);
    
    // GitHub API: Get latest commit SHA
    const { data: ref } = await octokit.rest.git.getRef({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      ref: 'heads/main'
    });
    const latestCommitSha = ref.object.sha;
    
    // GitHub API: Get the tree associated with the latest commit
    const { data: latestCommit } = await octokit.rest.git.getCommit({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      commit_sha: latestCommitSha
    });
    const treeSha = latestCommit.tree.sha;
    
    // GitHub API: Create a new blob for the resume content
    const { data: blobData } = await octokit.rest.git.createBlob({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      content: Buffer.from(filledTemplate).toString('base64'),
      encoding: 'base64'
    });
    
    // GitHub API: Create a new tree with the updated resume file
    const { data: newTreeData } = await octokit.rest.git.createTree({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      base_tree: treeSha,
      tree: [
        {
          path: 'resume.tex',
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        }
      ]
    });
    
    // GitHub API: Create a new commit
    const { data: newCommitData } = await octokit.rest.git.createCommit({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      message: commitMessage,
      tree: newTreeData.sha,
      parents: [latestCommitSha]
    });
    
    // GitHub API: Update the reference to point to the new commit
    await octokit.rest.git.updateRef({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      ref: 'heads/main',
      sha: newCommitData.sha
    });
    
    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      commitSha: newCommitData.sha
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume',
      error: error.message
    });
  }
});

// 2. Get resume version history
app.get('/api/versions', async (req, res) => {
  try {
    // GitHub API: Get commit history for the resume.tex file
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      path: 'resume.tex'
    });
    
    // GitHub API: Get workflow runs to find PDF artifacts
    const { data: workflowRuns } = await octokit.rest.actions.listWorkflowRuns({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      workflow_id: 'latex.yml'
    });
    
    // Map commits to versions with PDF artifact links
    const versions = commits.map(commit => {
      // Find the workflow run triggered by this commit
      const workflowRun = workflowRuns.workflow_runs.find(run => 
        run.head_sha === commit.sha
      );
      
      return {
        id: commit.sha,
        message: commit.commit.message,
        date: commit.commit.author.date,
        author: commit.commit.author.name,
        workflowRunId: workflowRun ? workflowRun.id : null
      };
    });
    
    res.status(200).json({
      success: true,
      versions
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume versions',
      error: error.message
    });
  }
});

// 3. Get PDF for a specific version
app.get('/api/pdf/:workflowRunId', async (req, res) => {
  try {
    const { workflowRunId } = req.params;
    
    // GitHub API: Get artifacts for the workflow run
    const { data: artifacts } = await octokit.rest.actions.listWorkflowRunArtifacts({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      run_id: workflowRunId
    });
    
    // Find the Resume-PDF artifact
    const pdfArtifact = artifacts.artifacts.find(artifact => 
      artifact.name === 'Resume-PDF'
    );
    
    if (!pdfArtifact) {
      return res.status(404).json({
        success: false,
        message: 'PDF artifact not found'
      });
    }
    
    // GitHub API: Download the artifact
    const { data: artifactDownload } = await octokit.rest.actions.downloadArtifact({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      artifact_id: pdfArtifact.id,
      archive_format: 'zip'
    });
    
    // Set appropriate headers for PDF download
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename=resume-${workflowRunId}.zip`);
    
    // Send the artifact data
    res.send(Buffer.from(artifactDownload));
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 