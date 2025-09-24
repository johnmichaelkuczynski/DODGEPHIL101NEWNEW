import fs from 'fs';

// Extract the complete Tractatus text from the PDF
const extractTractatus = () => {
  const pdfContent = fs.readFileSync('attached_assets/Tractatus Logico-Philosophicus_ the original authoritative edition_1752081636410.pdf', 'utf8');
  
  // Find the start of the main content (after Russell's introduction and Wittgenstein's preface)
  const startMarker = '1               The world is everything that is the case.∗';
  const endMarker = '7      Whereof one cannot speak, thereof one must be silent.';
  
  const startIndex = pdfContent.indexOf(startMarker);
  const endIndex = pdfContent.indexOf(endMarker) + endMarker.length;
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find start or end markers');
    return null;
  }
  
  const mainContent = pdfContent.slice(startIndex, endIndex);
  
  // Also extract Russell's introduction and Wittgenstein's preface
  const introStartMarker = 'INTRODUCTION\n                         By BERTRAND RUSSELL';
  const prefaceStartMarker = 'PREFACE';
  const prefaceEndMarker = 'how little has been done when these problems have been solved.';
  
  const introStart = pdfContent.indexOf(introStartMarker);
  const prefaceStart = pdfContent.indexOf(prefaceStartMarker);
  const prefaceEnd = pdfContent.indexOf(prefaceEndMarker) + prefaceEndMarker.length;
  
  const introduction = pdfContent.slice(introStart, prefaceStart - 1);
  const preface = pdfContent.slice(prefaceStart, prefaceEnd);
  
  return {
    introduction: introduction.trim(),
    preface: preface.trim(),
    mainContent: mainContent.trim()
  };
};

const result = extractTractatus();
if (result) {
  console.log('SUCCESS: Extracted Tractatus content');
  console.log('Introduction length:', result.introduction.length);
  console.log('Preface length:', result.preface.length);
  console.log('Main content length:', result.mainContent.length);
  
  // Save to a JSON file for use in the application
  fs.writeFileSync('tractatus-extracted.json', JSON.stringify(result, null, 2));
} else {
  console.log('FAILED: Could not extract content');
}