const fs = require('fs');
const path = require('path');

// Path to the LaTeX template
const templatePath = path.join(__dirname, 'latexTemplate.tex');

// Read the template
let templateContent = fs.readFileSync(templatePath, 'utf8');

// Fix the <<n>> placeholder to <<NAME>>
templateContent = templateContent.replace(/<<n>>/g, '<<NAME>>');

// Write the fixed template back
fs.writeFileSync(templatePath, templateContent);

console.log('Placeholders fixed successfully!'); 