import jsPDF from 'jspdf';

export const generatePDF = (content: string, filename: string = 'document.pdf') => {
  try {
    const pdf = new jsPDF();
    
    // Set up basic styling
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Split content into lines that fit the page width
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - (2 * margin);
    
    // Split content by newlines first
    const lines = content.split('\n');
    const wrappedLines: string[] = [];
    
    lines.forEach(line => {
      if (line.trim() === '') {
        wrappedLines.push(''); // Preserve empty lines
      } else {
        const splitLines = pdf.splitTextToSize(line, maxLineWidth);
        wrappedLines.push(...splitLines);
      }
    });
    
    // Add content to PDF
    let yPosition = margin;
    const lineHeight = 7;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = 20;
    
    wrappedLines.forEach((line) => {
      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - bottomMargin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    
    // Save the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};