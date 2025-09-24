import { useState, useEffect, useCallback } from "react";

interface TextSelection {
  text: string;
  range?: Range;
  element?: HTMLElement;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectionChange = useCallback(() => {
    const windowSelection = window.getSelection();
    
    if (!windowSelection || windowSelection.rangeCount === 0) {
      setSelection(null);
      setIsSelecting(false);
      return;
    }

    const range = windowSelection.getRangeAt(0);
    const selectedText = windowSelection.toString().trim();
    
    if (selectedText.length === 0) {
      setSelection(null);
      setIsSelecting(false);
      return;
    }

    // Check if selection is within the document content area
    const documentContent = document.querySelector('[data-document-content]');
    if (!documentContent || !documentContent.contains(range.commonAncestorContainer)) {
      setSelection(null);
      setIsSelecting(false);
      return;
    }

    setSelection({
      text: selectedText,
      range: range.cloneRange(),
      element: range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
        ? range.commonAncestorContainer.parentElement || undefined
        : range.commonAncestorContainer as HTMLElement
    });
    setIsSelecting(true);
  }, []);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    setIsSelecting(false);
  }, []);

  const highlightSelection = useCallback(() => {
    if (!selection?.range) return null;

    try {
      // Create a highlight span
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded';
      highlightSpan.setAttribute('data-highlighted', 'true');
      
      // Surround the selection with the highlight
      selection.range.surroundContents(highlightSpan);
      
      return highlightSpan;
    } catch (error) {
      console.warn('Could not highlight selection:', error);
      return null;
    }
  }, [selection]);

  const removeHighlights = useCallback(() => {
    const highlights = document.querySelectorAll('[data-highlighted="true"]');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        // Move all child nodes out of the highlight span
        while (highlight.firstChild) {
          parent.insertBefore(highlight.firstChild, highlight);
        }
        // Remove the highlight span
        parent.removeChild(highlight);
      }
    });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return {
    selection,
    isSelecting,
    clearSelection,
    highlightSelection,
    removeHighlights
  };
}