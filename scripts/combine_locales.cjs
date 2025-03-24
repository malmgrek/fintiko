const fs = require('fs');
const path = require('path');

// Define the input directory containing the individual JSON files.
const inputDir = path.join(__dirname, '..', 'src', 'locales');

// Define the output TypeScript file.
const outputFile = path.join(__dirname, '..', 'src', 'locales.ts');

// Read all files in the input directory.
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error('Error reading the directory:', err);
    return;
  }

  // Filter only the .json files and sort them (e.g., A.json, B.json, etc.).
  const jsonFiles = files.filter(file => file.endsWith('.json')).sort();

  let outputContent = '';

  jsonFiles.forEach(file => {
    // Use the filename without extension as the variable name.
    const varName = path.basename(file, '.json');
    const filePath = path.join(inputDir, file);
    
    // Read the JSON file content.
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Append the export statement for this file.
    outputContent += `export const ${varName} = ${fileContent};\n\n`;
  });

  // Write the combined content into the TypeScript file.
  fs.writeFileSync(outputFile, outputContent, 'utf8');
  console.log(`Combined ${jsonFiles.length} JSON files into ${outputFile}`);
});
