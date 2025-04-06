# Resumify

A full-stack web application for managing your resume with GitHub integration, automated PDF generation, and version control.

## Features

- Form-based resume editor for easy updates
- GitHub integration for version control
- Automated LaTeX to PDF conversion via GitHub Actions
- Version history dashboard to view and download previous resume versions

## Technology Stack

### Frontend
- React.js
- Axios for API requests
- Modern responsive UI components

### Backend
- Node.js with Express
- GitHub API integration via Octokit
- LaTeX template processing

### CI/CD
- GitHub Actions for LaTeX compilation and artifact storage

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- GitHub account
- Personal Access Token with repo permissions

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/resumify.git
   cd resumify
   ```

2. Set up the backend:
   ```
   cd backend
   npm install
   cp .env.example .env  # Then edit .env with your GitHub credentials
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

4. Create a GitHub repository:
   - Create a new repository on GitHub
   - Set up the repository with the correct .github/workflows/latex.yml file

5. Start the application:
   ```
   # In the backend directory
   npm run dev
   
   # In the frontend directory (separate terminal)
   npm start
   ```

6. Access the application at http://localhost:3000

## Usage

1. Fill out the resume form with your details
2. Enter a description of your changes
3. Submit the form to update your resume
4. View previous versions in the Version History dashboard

## GitHub Setup

Before using the application, make sure to:
1. Create a Personal Access Token with repo permissions on GitHub
2. Set up the correct webhook (if applicable)
3. Update your .env file with the correct repository details

## Known Issues

- In the LaTeX template, you'll need to manually fix a placeholder before using the application:
  1. Open the file `backend/latexTemplate.tex` in a text editor
  2. Find the line with `\textbf{\Huge \scshape <<n>>}` (around line 111)
  3. Change `<<n>>` to `<<NAME>>`
  4. Save the file

This ensures the name field from your form correctly populates in the generated resume.

## Template Customization

The LaTeX resume template has been generalized to work with dynamic user input. Key features:

- All personal information like name, contact details, and social links use placeholders
- Education section includes GPA prefix and scale options (e.g., "CPI: 7.71/10")
- Experience and projects sections are dynamically generated from user input
- Multiple experiences and projects can be added with customizable bullet points
- Technical skills section has placeholders for coursework, languages, frameworks, and tools

When using the application, your form inputs will automatically populate these placeholders and generate the LaTeX code that is then compiled into a PDF through GitHub Actions.

## License

MIT 