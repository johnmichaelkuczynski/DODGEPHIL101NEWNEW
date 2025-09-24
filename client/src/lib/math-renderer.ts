import katex from 'katex';

declare global {
  interface Window {
    renderMathInElement?: (element: HTMLElement, options?: any) => void;
    katex?: any;
  }
}

export function initializeMathRenderer() {
  // Initialize KaTeX auto-render when the script loads
  if (typeof window !== 'undefined') {
    const checkKaTeX = () => {
      if (window.renderMathInElement) {
        renderMathInElement();
      } else {
        setTimeout(checkKaTeX, 100);
      }
    };
    checkKaTeX();
  }
}

export function renderMathInElement(element?: HTMLElement) {
  if (typeof window !== 'undefined' && window.renderMathInElement) {
    const target = element || document.body;
    window.renderMathInElement(target, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false,
      errorColor: '#cc0000',
      strict: false,
    });
  }
}

export function renderMathString(latex: string, displayMode: boolean = false): string {
  try {
    if (!latex || typeof latex !== 'string') {
      return latex || '';
    }
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: displayMode
    });
  } catch (error) {
    console.warn('KaTeX string rendering failed:', error);
    return latex || '';
  }
}
