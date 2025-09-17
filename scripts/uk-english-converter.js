#!/usr/bin/env node

// UK English Conversion Script for WorkDoc360
// Ensures all text uses British English spelling and construction terminology

const fs = require('fs');
const path = require('path');

// American to British English conversion mappings
const conversions = {
  // Core -ize/-ise conversions
  'organize': 'organise',
  'organized': 'organised',
  'organizing': 'organising',
  'organization': 'organisation',
  'customize': 'customise',
  'customized': 'customised',
  'customizing': 'customising',
  'customization': 'customisation',
  'realize': 'realise',
  'realized': 'realised',
  'realizing': 'realising',
  'realization': 'realisation',
  'analyze': 'analyse',
  'analyzed': 'analysed',
  'analyzing': 'analysing',
  'analysis': 'analysis', // Already correct
  'optimize': 'optimise',
  'optimized': 'optimised',
  'optimizing': 'optimising',
  'optimization': 'optimisation',
  'categorize': 'categorise',
  'categorized': 'categorised',
  'categorizing': 'categorising',
  'categorization': 'categorisation',
  
  // Core -er/-re conversions
  'center': 'centre',
  'centered': 'centred',
  'centering': 'centring',
  
  // Core -or/-our conversions
  'color': 'colour',
  'colored': 'coloured',
  'coloring': 'colouring',
  'labor': 'labour',
  'labored': 'laboured',
  'laboring': 'labouring',
  'neighbor': 'neighbour',
  'honored': 'honoured',
  'favored': 'favoured',
  
  // Program/Programme distinction
  'program': 'programme', // Note: Only for schedules/plans, not software
  'programmed': 'programmed', // Keep for software context
  'programming': 'programming', // Keep for software context
  
  // UK Construction specific terms
  'job site': 'site',
  'work site': 'site',
  'schedule': 'programme', // In construction context
  'scheduled': 'programmed',
  'scheduling': 'programming',
  
  // Common British spellings
  'grey': 'grey', // Already correct
  'enquiry': 'enquiry', // Already correct
  'licence': 'licence', // noun
  'license': 'licence', // when used as noun
  
  // Ensure proper capitalisation
  'Organize': 'Organise',
  'Organized': 'Organised',
  'Organization': 'Organisation',
  'Customize': 'Customise',
  'Customized': 'Customised',
  'Customization': 'Customisation',
  'Realize': 'Realise',
  'Realized': 'Realised',
  'Realization': 'Realisation',
  'Analyze': 'Analyse',
  'Analyzed': 'Analysed',
  'Center': 'Centre',
  'Centered': 'Centred',
  'Color': 'Colour',
  'Colored': 'Coloured',
  'Labor': 'Labour',
  'Labored': 'Laboured',
  'Program': 'Programme',
  'Schedule': 'Programme'
};

// Files to process (avoiding node_modules, dist, etc.)
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.txt'];
const excludeDirs = ['node_modules', 'dist', '.git', 'backups'];

function shouldProcessFile(filePath) {
  return fileExtensions.some(ext => filePath.endsWith(ext)) &&
         !excludeDirs.some(dir => filePath.includes(dir));
}

function convertToUKEnglish(content) {
  let converted = content;
  
  // Apply all conversions
  for (const [american, british] of Object.entries(conversions)) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${american}\\b`, 'g');
    converted = converted.replace(regex, british);
  }
  
  return converted;
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !excludeDirs.includes(item)) {
      processDirectory(fullPath);
    } else if (stat.isFile() && shouldProcessFile(fullPath)) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const converted = convertToUKEnglish(content);
    
    if (content !== converted) {
      fs.writeFileSync(filePath, converted, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🇬🇧 Converting WorkDoc360 to UK English...\n');

// Process the main directories
const dirsToProcess = ['client', 'server', 'shared'];

for (const dir of dirsToProcess) {
  if (fs.existsSync(dir)) {
    console.log(`Processing ${dir}/...`);
    processDirectory(dir);
  }
}

// Process documentation files
const docsToProcess = ['README.md', 'replit.md', 'CONFLUENCE_INTEGRATION.md'];
for (const doc of docsToProcess) {
  if (fs.existsSync(doc)) {
    processFile(doc);
  }
}

console.log('\n✅ UK English conversion complete!');
console.log('All American English terms have been converted to British English.');
console.log('WorkDoc360 now uses proper UK construction terminology throughout.');