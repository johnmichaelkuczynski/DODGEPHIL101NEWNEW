export interface TextChunk {
  id: number;
  text: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
}

export function chunkText(text: string, maxWords: number = 250): TextChunk[] {
  const words = text.split(/\s+/);
  const chunks: TextChunk[] = [];
  
  for (let i = 0; i < words.length; i += maxWords) {
    const chunkWords = words.slice(i, i + maxWords);
    const chunkText = chunkWords.join(' ');
    
    // Calculate start and end indices in original text
    const wordsBeforeChunk = words.slice(0, i);
    const startIndex = wordsBeforeChunk.length > 0 ? wordsBeforeChunk.join(' ').length + 1 : 0;
    const endIndex = startIndex + chunkText.length;
    
    chunks.push({
      id: Math.floor(i / maxWords),
      text: chunkText,
      startIndex,
      endIndex,
      wordCount: chunkWords.length,
    });
  }
  
  return chunks;
}

export function getChunkPreview(chunk: TextChunk, maxLength: number = 150): string {
  if (chunk.text.length <= maxLength) {
    return chunk.text;
  }
  return chunk.text.substring(0, maxLength) + '...';
}