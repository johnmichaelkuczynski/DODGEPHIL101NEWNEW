export interface MidtermStudyGuideWeek {
  week: number;
  title: string;
  learningObjectives: string[];
  keyTopics: string[];
  essayPrompts?: string[];
}

export const midtermStudyGuide: {
  title: string;
  description: string;
  examFormat: string[];
  weeks: MidtermStudyGuideWeek[];
  essayQuestions: string[];
} = {
  title: "Philosophy 101 – Midterm Exam Study Guide",
  description: "Comprehensive study guide covering Weeks 1-3. No material from Weeks 4-6 will be tested.",
  examFormat: [
    "Multiple Choice / Short Answer – definitions, examples, arguments from the course",
    "Essay Section – 2–3 prompts from the list below; students will write on 1–2 of them"
  ],
  weeks: [
    {
      week: 1,
      title: "Introduction to Philosophy & Epistemology",
      learningObjectives: [
        "Define the five main branches of philosophy: epistemology, metaphysics, ethics, logic, aesthetics",
        "Explain Plato's Allegory of the Cave",
        "Outline the story as told in the course",
        "Identify what the shadows, fire, and outside world represent",
        "State its main point about the difference between appearance and reality",
        "Define knowledge as presented in the course (\"justified true belief\" – JTB)"
      ],
      keyTopics: [
        "Five branches of philosophy",
        "Plato's Allegory of the Cave",
        "Appearance vs. Reality",
        "Justified True Belief (JTB) definition of knowledge"
      ]
    },
    {
      week: 2,
      title: "Truth, Lying, and Skepticism",
      learningObjectives: [
        "State the course's definitions of truth-telling and lying",
        "Explain Kant's position on lying as presented in the course",
        "Define \"bullshit\" from the assigned reading and explain how it differs from lying",
        "Define skepticism in the course's terms",
        "Summarize Descartes' method of doubt from the text"
      ],
      keyTopics: [
        "Truth-telling vs. Lying definitions",
        "Kant's moral theory on lying",
        "Frankfurt's concept of \"bullshit\"",
        "Philosophical skepticism",
        "Descartes' method of doubt"
      ]
    },
    {
      week: 3,
      title: "Knowledge and Gettier Problems",
      learningObjectives: [
        "State the JTB definition of knowledge",
        "Explain what a Gettier problem is and why it challenges JTB",
        "Recall at least one Gettier example from the course",
        "Explain why that example meets all JTB conditions but still fails to count as knowledge"
      ],
      keyTopics: [
        "JTB (Justified True Belief) definition",
        "Gettier problems and cases",
        "Challenges to traditional epistemology",
        "Knowledge vs. true belief"
      ]
    }
  ],
  essayQuestions: [
    "Construct a new Gettier-style example (not from the course) that challenges the JTB definition of knowledge. Explain why it meets all three JTB conditions and yet fails to be knowledge.",
    "Define skepticism as covered in the course and present one argument for skepticism and one argument against it. Explain which is stronger, using only course concepts.",
    "Describe an original example, parallel to Plato's Cave, in which a person mistakes appearance for reality. Identify what in your example corresponds to the shadows, the fire, and the outside world, and explain the lesson it teaches.",
    "Present a case in which a person holds a belief that is true by accident. Explain why it fails to be knowledge under the course definition, and compare it to a Gettier case.",
    "Using only the moral theory on lying taught in the course, analyze a case where lying might seem justified. Show whether, under the theory, the lie is morally right or wrong.",
    "Explain Descartes' method of doubt as given in the course. Provide a modern example of how this method could be applied to question an everyday belief.",
    "Identify a case in which skepticism would prevent someone from claiming to know something important. Explain how the course material suggests responding to that skeptical challenge.",
    "Present a short scenario in which a person is justified in believing something false. Explain why, under JTB, this does not count as knowledge, and how Gettier cases are similar or different.",
    "Create a simple analogy that explains the point of Plato's Allegory of the Cave to someone unfamiliar with philosophy. Make sure the analogy preserves the key parts of the story.",
    "Explain how \"bullshit,\" as defined in the assigned reading, differs from lying. Give an example of each from everyday life, and explain why the distinction matters for truth-seeking."
  ]
};