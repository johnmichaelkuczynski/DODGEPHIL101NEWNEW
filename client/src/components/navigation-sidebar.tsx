import { ScrollArea } from "@/components/ui/scroll-area";

const tableOfContents: Array<{ id: string; title: string; level: number }> = [
  { id: "branches-of-philosophy", title: "Discussion 1: Branches of Philosophy (50 points)", level: 0 },
  { id: "branches-model-response", title: "Model Response", level: 0 },
  { id: "frankfurt-speech-types", title: "Discussion 2: Truth-telling, Lying, Bullshit (50 points)", level: 0 },
  { id: "lying-model-response", title: "Model Response", level: 0 },
  { id: "skepticism-essay", title: "Essay 2: Skepticism (50 points)", level: 0 },
  { id: "skepticism-model-response", title: "Model Response", level: 0 },
  { id: "gettier-discussion", title: "Discussion 3: Gettier Cases (50 points)", level: 0 },
  { id: "gettier-model-response", title: "Model Response", level: 0 },
  { id: "jtb-analysis", title: "Essay 3: Gettier Problems (50 points)", level: 0 },
  { id: "gettier-essay-model-response", title: "Model Response", level: 0 },
  { id: "dualism-discussion", title: "Discussion 4: Mind/Body Dualism (50 points)", level: 0 },
  { id: "dualism-model-response", title: "Model Response", level: 0 },
  { id: "euthyphro-dilemma", title: "Essay 4: The Euthyphro Dilemma (50 points)", level: 0 },
  { id: "euthyphro-model-response", title: "Model Response", level: 0 },
  { id: "problem-of-evil", title: "Discussion 5: The Problem of Evil (50 points)", level: 0 },
  { id: "evil-model-response", title: "Model Response", level: 0 },
  { id: "frankfurt-cases", title: "Essay 5: Frankfurt Cases (50 points)", level: 0 },
  { id: "frankfurt-model-response", title: "Model Response", level: 0 },
  { id: "moral-luck", title: "Discussion 6: Moral Luck (50 points)", level: 0 },
  { id: "moral-luck-model-response", title: "Model Response", level: 0 },
  { id: "gyges-ring", title: "Discussion 7: Gyges Ring (50 points)", level: 0 },
  { id: "gyges-model-response", title: "Model Response", level: 0 },
  { id: "term-paper-outline", title: "Term Paper Outline Assignment (100 points)", level: 0 },
  { id: "term-paper-outline-model-response", title: "Model Response", level: 0 },
  { id: "term-paper", title: "Term Paper Assignment (100 points)", level: 0 },
  { id: "term-paper-model-response", title: "Model Response", level: 0 }
];

export default function NavigationSidebar() {
  const handleNavClick = (id: string) => {
    console.log(`Clicking navigation item: ${id}`);
    
    // First try to find exact section ID match
    let element = document.getElementById(id);
    console.log(`Found element by ID: ${!!element}`);
    
    if (element) {
      console.log(`Scrolling to section: ${element.id}`);
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      
      // Add a temporary highlight
      element.style.backgroundColor = '#fef3c7';
      setTimeout(() => {
        if (element) {
          element.style.backgroundColor = '';
        }
      }, 2000);
      return;
    }
    
    // Search within the content for text patterns
    const titleMap: { [key: string]: string } = {
      "branches-of-philosophy": "Discussion 1: Branches of Philosophy (50 points)",
      "branches-model-response": "Model Response:",
      "frankfurt-speech-types": "Frankfurt identifies three speech types:",
      "lying-model-response": "Type: Lying",
      "skepticism-essay": "Essay 2: Skepticism (50 points)",
      "skepticism-model-response": "The Practical Impossibility of Radical Skepticism",
      "gettier-discussion": "Discussion 3: Gettier Cases (50 points)",
      "gettier-model-response": "Sarah glances at her living room clock",
      "jtb-analysis": "Essay 3: Gettier Problems (50 points)",
      "gettier-essay-model-response": "Beyond Justified True Belief",
      "dualism-discussion": "Discussion 4: Mind/Body Dualism (50 points)",
      "dualism-model-response": "A concert pianist sits at her piano",
      "euthyphro-dilemma": "Essay 4: The Euthyphro Dilemma (50 points)",
      "euthyphro-model-response": "Divine Command Theory and the Euthyphro Dilemma",
      "problem-of-evil": "Discussion 5: The Problem of Evil (50 points)",
      "evil-model-response": "Earthquakes kill thousands annually",
      "frankfurt-cases": "Essay 5: Frankfurt Cases (50 points)",
      "frankfurt-model-response": "Moral Responsibility Under Coercion",
      "moral-luck": "Discussion 6: Moral Luck (50 points)",
      "moral-luck-model-response": "Two identical twins, separated at birth",
      "gyges-ring": "Discussion 7: Gyges Ring (50 points)",
      "gyges-model-response": "With Gyges' ring, I would initially",
      "term-paper-outline": "Term Paper Outline Assignment (100 points)",
      "term-paper-outline-model-response": "Privacy and Personal Development",
      "term-paper": "Choose one article:",
      "term-paper-model-response": "The Inherent Harm of Commodifying Intimacy"
    };
    
    const searchText = titleMap[id];
    console.log(`Searching for text: ${searchText}`);
    
    if (searchText) {
      const contentArea = document.querySelector('[data-document-content]');
      if (contentArea) {
        // First try to find a heading that starts with the search text
        const headings = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (let i = 0; i < headings.length; i++) {
          const el = headings[i];
          const textContent = (el.textContent || '').trim();
          
          if (textContent.startsWith(searchText)) {
            element = el as HTMLElement;
            console.log(`Found heading by text search: ${el.tagName} - ${textContent.substring(0, 50)}...`);
            break;
          }
        }
        
        // If no heading found, look for any element that starts with the search text
        if (!element) {
          const allElements = contentArea.querySelectorAll('p, div, span');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const textContent = (el.textContent || '').trim();
            
            if (textContent.startsWith(searchText)) {
              element = el as HTMLElement;
              console.log(`Found element by text search: ${el.tagName} - ${textContent.substring(0, 50)}...`);
              break;
            }
          }
        }
      }
    }
    
    if (element) {
      console.log(`Scrolling to element: ${element.tagName}`);
      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      
      // Add a temporary highlight
      element.style.backgroundColor = '#fef3c7';
      setTimeout(() => {
        if (element) {
          element.style.backgroundColor = '';
        }
      }, 2000);
    } else {
      console.log(`No element found for navigation ID: ${id}`);
    }
  };

  return (
    <aside className="w-48 bg-card shadow-sm border-r border-border sticky top-16 h-[calc(100vh-160px)]">
      <div className="p-3 h-full flex flex-col">
        <h3 className="font-inter font-semibold text-sm text-foreground mb-3 flex-shrink-0">
          Table of Contents
        </h3>
        <ScrollArea className="flex-1 h-full">
          <div className="pr-2">
            <nav className="space-y-1">
              {tableOfContents.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleNavClick(entry.id)}
                  className={`block w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded transition-colors font-normal text-slate-800 dark:text-slate-200`}
                  title={entry.title}
                >
                  <span className="block text-xs leading-tight whitespace-normal">
                    {entry.title}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
