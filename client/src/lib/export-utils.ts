import { apiRequest } from "./queryClient";

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export async function downloadPDF(content: string, filename: string = 'ai-response.pdf'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for PDF generation.');
      }

      // Get current timestamp for header
      const timestamp = new Date().toLocaleString();

      // Process content to handle LaTeX math notation
      let processedContent = content
        // Convert markdown bold to HTML
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convert markdown headers
        .replace(/^### (.*$)/gm, '<h3 style="font-size: 1.2em; font-weight: bold; margin: 1em 0 0.5em 0;">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.4em; font-weight: bold; margin: 1em 0 0.5em 0;">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 style="font-size: 1.6em; font-weight: bold; margin: 1em 0 0.5em 0;">$1</h1>')
        // Convert code blocks
        .replace(/```[\s\S]*?```/g, (match) => {
          if (!match) return '';
          const codeContent = match.replace(/```/g, '');
          return `<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.9em; margin: 1em 0; white-space: pre-wrap;">${codeContent}</pre>`;
        })
        // Convert inline code
        .replace(/\`(.*?)\`/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>')
        // Convert line breaks
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');

      // Create HTML document with KaTeX support
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>AI Response - Living Book</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
          <style>
            @page {
              margin: 1in;
              size: letter;
            }
            body {
              font-family: Georgia, serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #333;
              max-width: none;
              margin: 0;
              padding: 0;
            }
            .header {
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 18pt;
              font-weight: bold;
              margin: 0;
            }
            .timestamp {
              font-size: 10pt;
              color: #666;
              margin: 5px 0 0 0;
            }
            .content {
              text-align: justify;
              hyphens: auto;
            }
            .katex {
              font-size: 1em !important;
            }
            .katex-display {
              margin: 1em 0 !important;
            }
            h1, h2, h3 {
              page-break-after: avoid;
            }
            pre {
              page-break-inside: avoid;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">AI Response - Dictionary of Analytic Philosophy</h1>
            <p class="timestamp">Generated: ${timestamp}</p>
          </div>
          <div class="content" id="math-content">
            ${processedContent}
          </div>
          
          <script>
            // Render KaTeX math notation
            document.addEventListener("DOMContentLoaded", function() {
              renderMathInElement(document.getElementById('math-content'), {
                delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false},
                  {left: '\\\\(', right: '\\\\)', display: false},
                  {left: '\\\\[', right: '\\\\]', display: true}
                ],
                throwOnError: false,
                strict: false
              });
              
              // Trigger print dialog after math rendering
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            });
          </script>
        </body>
        </html>
      `;

      // Write content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Handle window close event
      printWindow.addEventListener('beforeunload', () => {
        resolve();
      });

      // Fallback timeout
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
        resolve();
      }, 10000);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      reject(error);
    }
  });
}

// Email functionality removed
export async function emailContent(content: string, email: string, subject: string): Promise<void> {
  throw new Error("Email functionality disabled");
}
