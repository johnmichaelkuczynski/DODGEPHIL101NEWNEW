import { bookContent as paperContent } from "@shared/book-content";

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

export function extractDocumentSections(): DocumentSection[] {
  return paperContent.sections.map((section: any) => ({
    ...section,
    level: 1
  }));
}

export function getFullDocumentContent(): string {
  const sections = extractDocumentSections();
  return sections.map(section => `${section.title}\n\n${section.content}`).join('\n\n');
}
