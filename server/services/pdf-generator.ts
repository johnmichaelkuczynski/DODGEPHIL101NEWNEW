import puppeteer from 'puppeteer';

export async function generatePDF(htmlContent: string): Promise<Buffer> {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content with KaTeX CSS
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <style>
            body { 
              font-family: Georgia, serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 2rem;
              color: #333;
            }
            h1, h2, h3 { color: #1565C0; }
            .math-inline { display: inline-block; }
            .math-display { display: block; text-align: center; margin: 1rem 0; }
            .definition { 
              background: #f8f9fa; 
              border-left: 4px solid #1565C0; 
              padding: 1rem; 
              margin: 1rem 0; 
            }
            .theorem { 
              background: #e3f2fd; 
              border-left: 4px solid #2196F3; 
              padding: 1rem; 
              margin: 1rem 0; 
            }
            .proof { 
              font-size: 0.9em; 
              color: #666; 
              margin-top: 0.5rem; 
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
    
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in'
      }
    });
    
    return pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
