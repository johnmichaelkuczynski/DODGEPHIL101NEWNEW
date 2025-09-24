// Logic symbol shortcuts conversion utility

export const SYMBOL_SHORTCUTS: { [key: string]: string } = {
  // Propositional logic
  "->": "→",
  "<->": "↔", 
  "^": "∧",
  "&": "∧",
  "v": "∨",
  "|": "∨",
  "~": "¬",
  "!": "¬",
  "T": "⊤",
  "F": "⊥",
  
  // Predicate logic
  "forall": "∀",
  "exists": "∃",
  "!=": "≠",
  "in": "∈",
  "!in": "∉",
  "empty": "∅"
};

export function convertShortcutsToSymbols(text: string): string {
  let result = text;
  
  // Sort shortcuts by length (longest first) to avoid partial matches
  const sortedShortcuts = Object.keys(SYMBOL_SHORTCUTS).sort((a, b) => b.length - a.length);
  
  for (const shortcut of sortedShortcuts) {
    const symbol = SYMBOL_SHORTCUTS[shortcut];
    // Use word boundaries for word-like shortcuts, exact match for symbolic ones
    if (/^[a-zA-Z]/.test(shortcut)) {
      // Word shortcuts like "forall", "exists"
      const regex = new RegExp(`\\b${shortcut}\\b`, 'gi');
      result = result.replace(regex, symbol);
    } else {
      // Symbol shortcuts like "->", "<->", "!="
      result = result.replaceAll(shortcut, symbol);
    }
  }
  
  return result;
}

export function hasShortcuts(text: string): boolean {
  return Object.keys(SYMBOL_SHORTCUTS).some(shortcut => {
    if (/^[a-zA-Z]/.test(shortcut)) {
      const regex = new RegExp(`\\b${shortcut}\\b`, 'gi');
      return regex.test(text);
    } else {
      return text.includes(shortcut);
    }
  });
}