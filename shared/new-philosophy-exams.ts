// Philosophy Course Exams Based on Clean Phil 101 Dodge Book

export const philosophyMidtermExam = {
  title: "Philosophy Midterm Exam - First Half of Course",
  content: {
    instructions: "Complete all 30 questions covering the first half of the course: Branches of Philosophy, Allegory of the Cave, Truth/Lie/Bullshit, Skepticism, Gettier Cases, and Mind/Body Dualism. All questions are based directly on the course text.",
    totalPoints: 120,
    problems: [
      // Multiple Choice Questions (2 pts each)
      {
        id: "q-1",
        title: "Question 1",
        points: 4,
        type: "multiple_choice" as const,
        questions: [{
          id: "q1",
          question: "Which branch of philosophy studies the nature of knowledge?",
          options: ["Metaphysics", "Epistemology", "Ethics", "Logic"],
          answer: "Epistemology",
          explanation: "Epistemology is the study of knowledge - what is knowledge, how does one acquire knowledge, what is knowable, and what cannot be known."
        }]
      },
      {
        id: "q-2",
        title: "Question 2",
        points: 4,
        type: "multiple_choice" as const,
        questions: [{
          id: "q2",
          question: "In Plato's Allegory of the Cave, what do the shadows on the wall represent?",
          options: ["The Forms", "Illusions or appearances", "The truth of reality", "Scientific knowledge"],
          answer: "Illusions or appearances",
          explanation: "The shadows represent illusions or appearances - what the prisoners mistake for reality but are actually just projections of the real objects outside the cave."
        }]
      },
      {
        id: "q-3",
        title: "Question 3",
        points: 4,
        type: "multiple_choice" as const,
        questions: [{
          id: "q3",
          question: "According to Frankfurt, a liar:",
          options: ["Says something false without caring if it's true or false", "Says something they believe is false, intending others to believe it true", "Always tells the truth but withholds information", "Speaks without any communicative purpose"],
          answer: "Says something they believe is false, intending others to believe it true",
          explanation: "Frankfurt defines lying as: saying 'x', believing 'x' is false, and wanting others to believe 'x' is true."
        }]
      },
      {
        id: "q-4",
        title: "Question 4",
        points: 4,
        type: "multiple_choice" as const,
        questions: [{
          id: "q4",
          question: "Which of the following is an example of 'bullshit' in Frankfurt's terms?",
          options: ["Saying 'It's raining' when you know it's sunny", "Saying 'It's raining' to distract someone so you can steal their umbrella", "Saying 'It's raining' because you misread a weather app", "Saying 'It's raining' when you're unsure but want to fill silence"],
          answer: "Saying 'It's raining' to distract someone so you can steal their umbrella",
          explanation: "Bullshit involves saying 'x' while wanting others to believe 'y' or do 'z', where y/z are unrelated to 'x'. The speaker doesn't care about the truth of what they're saying."
        }]
      },
      {
        id: "q-5",
        title: "Question 5",
        points: 4,
        type: "multiple_choice" as const,
        questions: [{
          id: "q5",
          question: "In radical skepticism, which of the following is doubted?",
          options: ["Sensory reliability", "Existence of other minds", "Basic logical truths", "All of the above"],
          answer: "All of the above",
          explanation: "Radical skeptics doubt everything - from the reliability of our senses to the existence of other minds and even basic logical truths."
        }]
      },
      // Short Answer Questions (5 pts each)
      {
        id: "q-6",
        title: "Question 6 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q6",
          question: "Name two key differences between epistemology and metaphysics as described in the course text.",
          options: [],
          answer: "Epistemology studies knowledge (what is knowledge, how do we acquire it), while Metaphysics studies existence (what is the nature of reality, what kinds of things exist).",
          explanation: "This tests understanding of the three main branches of philosophy from the course introduction."
        }]
      },
      {
        id: "q-7",
        title: "Question 7 - Short Answer", 
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q7",
          question: "In the Allegory of the Cave, why does the freed prisoner have difficulty convincing others of the outside world?",
          options: [],
          answer: "The other prisoners have no context for understanding reality beyond shadows and reject claims about the outside world, even threatening violence against the escapee.",
          explanation: "This tests understanding of Plato's allegory and the resistance to new knowledge."
        }]
      },
      {
        id: "q-8",
        title: "Question 8 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q8",
          question: "Explain the key difference between lying and bullshit according to Frankfurt.",
          options: [],
          answer: "Lying involves caring about truth value (saying something you believe is false), while bullshit involves not caring about truth value at all (saying something to achieve an unrelated goal).",
          explanation: "This tests understanding of Frankfurt's three speech types."
        }]
      },
      {
        id: "q-9",
        title: "Question 9 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q9",
          question: "Describe one practical consequence of living as a radical skeptic.",
          options: [],
          answer: "Paralysis in daily activities - hesitating before every action, questioning basic sensory input, making normal functioning virtually impossible.",
          explanation: "This tests understanding of the practical impossibility of radical skepticism."
        }]
      },
      {
        id: "q-10",
        title: "Question 10 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q10",
          question: "In a Gettier case, why is justified true belief insufficient for knowledge?",
          options: [],
          answer: "Because the belief is only accidentally true - the justification is disconnected from why the belief is true, making it merely lucky rather than genuine knowledge.",
          explanation: "This tests understanding of the Gettier problem and the inadequacy of JTB."
        }]
      },
      // Essay Questions (10 pts each)
      {
        id: "q-11",
        title: "Question 11 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q11",
          question: "Summarize Plato's Allegory of the Cave and explain its philosophical significance regarding the nature of reality and knowledge.",
          options: [],
          answer: "Students should describe the cave setup, the prisoners' experience with shadows, the freed prisoner's journey, and the allegory's meaning about reality, knowledge, and the difficulty of enlightenment.",
          explanation: "This essay tests comprehensive understanding of Plato's allegory."
        }]
      },
      {
        id: "q-12",
        title: "Question 12 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q12",
          question: "Construct an original Gettier case, explain how it meets each JTB condition, and why it still fails to constitute knowledge.",
          options: [],
          answer: "Students should create a scenario with justified true belief that is only accidentally true, clearly showing belief, truth, justification, and lack of genuine knowledge.",
          explanation: "This essay tests ability to apply Gettier's insights."
        }]
      },
      {
        id: "q-13",
        title: "Question 13 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q13",
          question: "Using an example from the text, explain Descartes' Mind/Body Dualism and the interaction problem.",
          options: [],
          answer: "Students should explain dualism (mind non-physical, body physical), provide a concrete example like the pianist, and discuss the interaction problem.",
          explanation: "This essay tests understanding of Cartesian dualism."
        }]
      },
      {
        id: "q-14",
        title: "Question 14 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q14",
          question: "Describe Frankfurt's definitions of truth-telling, lying, and bullshit. Provide one original example for each and explain how it fits the definition.",
          options: [],
          answer: "Students should define all three speech types, provide clear examples, and explain how each example matches Frankfurt's criteria.",
          explanation: "This essay tests comprehensive understanding of Frankfurt's analysis."
        }]
      },
      {
        id: "q-15",
        title: "Question 15 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q15",
          question: "Present one argument against radical skepticism (as in Moore's proof of the external world) and explain why it is effective.",
          options: [],
          answer: "Students should explain Moore's pragmatic argument about sensory reliability and practical success, discussing why it counters radical skepticism.",
          explanation: "This essay tests understanding of responses to skepticism."
        }]
      }
    ]
  }
};

export const philosophyFinalExam = {
  title: "Philosophy Final Exam - Second Half of Course Plus Review",
  content: {
    instructions: "Complete all 20 questions covering the second half of the course: Euthyphro Dilemma, Problem of Evil, Frankfurt Cases, Moral Luck, Gyges Ring, Term Paper Topics, plus cumulative review. All questions based on Clean Phil 101 Dodge Book.",
    totalPoints: 100,
    problems: [
      // Multiple Choice Questions (2 pts each)
      {
        id: "q-1",
        title: "Question 1",
        points: 2,
        type: "multiple_choice" as const,
        questions: [{
          id: "q1",
          question: "The Euthyphro Dilemma asks whether something is moral because God commands it, or:",
          options: ["Because humans approve of it", "Because it is moral independently of God's commands", "Because it produces happiness", "Because it maximizes utility"],
          answer: "Because it is moral independently of God's commands",
          explanation: "The Euthyphro dilemma poses whether something is moral because God commands it, or whether God commands it because it's independently moral."
        }]
      },
      {
        id: "q-2",
        title: "Question 2",
        points: 2,
        type: "multiple_choice" as const,
        questions: [{
          id: "q2",
          question: "In the Problem of Evil, which of the following is not one of God's traditional attributes?",
          options: ["Omnipotence", "Omniscience", "Omnibenevolence", "Omnipresence"],
          answer: "Omnipresence",
          explanation: "The Problem of Evil focuses on God being all-powerful, all-knowing, and all-good. Omnipresence (being everywhere) is not central to this argument."
        }]
      },
      {
        id: "q-3",
        title: "Question 3",
        points: 2,
        type: "multiple_choice" as const,
        questions: [{
          id: "q3",
          question: "Which type of moral luck involves differences in behavior due to circumstances beyond one's control?",
          options: ["Resultant moral luck", "Constitutive moral luck", "Circumstantial moral luck", "Causal moral luck"],
          answer: "Circumstantial moral luck",
          explanation: "Circumstantial moral luck involves being placed in situations that reveal or require certain behaviors due to circumstances beyond one's control."
        }]
      },
      {
        id: "q-4",
        title: "Question 4",
        points: 2,
        type: "multiple_choice" as const,
        questions: [{
          id: "q4",
          question: "In a Frankfurt-style case, moral responsibility is shown to be possible:",
          options: ["Only if the agent has alternative possibilities", "Even if the agent lacks alternative possibilities", "Only if coercion is present", "Only if intentions are irrelevant"],
          answer: "Even if the agent lacks alternative possibilities",
          explanation: "Frankfurt cases demonstrate that moral responsibility can exist even when the agent couldn't have done otherwise."
        }]
      },
      {
        id: "q-5",
        title: "Question 5",
        points: 2,
        type: "multiple_choice" as const,
        questions: [{
          id: "q5",
          question: "In the Ring of Gyges thought experiment, what is the main philosophical question?",
          options: ["Can power corrupt absolutely?", "Would people act justly if they could avoid all consequences?", "Does invisibility cause moral responsibility to vanish?", "Is magic possible?"],
          answer: "Would people act justly if they could avoid all consequences?",
          explanation: "The Ring of Gyges explores whether people would remain just if they could act without consequences or external accountability."
        }]
      },
      // Short Answer Questions (5 pts each)
      {
        id: "q-6",
        title: "Question 6 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q6",
          question: "Explain one horn of the Euthyphro Dilemma and its implications for divine command theory.",
          options: [],
          answer: "Students should explain either horn: if something is moral because God commands it, then morality becomes arbitrary; if God commands something because it's moral, then morality is independent of God.",
          explanation: "This tests understanding of the dilemma's implications for divine command theory."
        }]
      },
      {
        id: "q-7",
        title: "Question 7 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q7",
          question: "Give an example of natural evil discussed in the course and explain why it is considered a challenge to theism.",
          options: [],
          answer: "Students should provide examples like earthquakes, diseases, or natural disasters and explain how they challenge belief in an all-good, all-powerful God.",
          explanation: "This tests understanding of the Problem of Evil and natural suffering."
        }]
      },
      {
        id: "q-8",
        title: "Question 8 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q8",
          question: "Define \"resultant moral luck\" and give an original example.",
          options: [],
          answer: "Resultant moral luck occurs when outcomes beyond our control affect our moral assessment. Example: two equally reckless drivers, one hits a child, the other doesn't due to luck.",
          explanation: "This tests understanding of different types of moral luck."
        }]
      },
      {
        id: "q-9",
        title: "Question 9 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q9",
          question: "In a Frankfurt-style case, what is a \"counterfactual intervener\"?",
          options: [],
          answer: "A counterfactual intervener is someone who would have forced the agent to perform the action if the agent had not chosen to do it themselves.",
          explanation: "This tests understanding of Frankfurt cases and their structure."
        }]
      },
      {
        id: "q-10",
        title: "Question 10 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q10",
          question: "Explain one way the Ring of Gyges story supports Plato's view about justice and character.",
          options: [],
          answer: "Students should explain how the story shows that true justice comes from character, not external constraints, supporting Plato's view that justice is intrinsically valuable.",
          explanation: "This tests understanding of Plato's moral philosophy through the Gyges example."
        }]
      },
      // Essay Questions (10 pts each)
      {
        id: "q-11",
        title: "Question 11 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q11",
          question: "Present and defend a resolution to the Euthyphro Dilemma, addressing at least one objection.",
          options: [],
          answer: "Students should present a clear position, defend it with reasoning, and address potential objections. Multiple approaches are acceptable if well-argued.",
          explanation: "This essay tests critical thinking about divine command theory and moral philosophy."
        }]
      },
      {
        id: "q-12",
        title: "Question 12 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q12",
          question: "Describe an original case of moral luck and explain how it challenges control-based theories of responsibility.",
          options: [],
          answer: "Students should create an original example and explain how factors beyond control affect moral responsibility, challenging the idea that we're only responsible for what we control.",
          explanation: "This essay tests understanding of moral luck and responsibility theories."
        }]
      },
      {
        id: "q-13",
        title: "Question 13 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q13",
          question: "Construct an original Frankfurt-style case and explain why moral responsibility applies in your example.",
          options: [],
          answer: "Students should create a case where someone acts freely while a counterfactual intervener would ensure the same outcome, showing responsibility without alternative possibilities.",
          explanation: "This essay tests understanding of Frankfurt cases and alternative possibilities."
        }]
      },
      {
        id: "q-14",
        title: "Question 14 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q14",
          question: "Analyze the Problem of Evil as it relates to natural disasters. Present at least one theistic response and evaluate it.",
          options: [],
          answer: "Students should explain how natural disasters challenge theism, present responses like free will defense or soul-making theodicy, and critically evaluate them.",
          explanation: "This essay tests understanding of the Problem of Evil and theodicies."
        }]
      },
      {
        id: "q-15",
        title: "Question 15 - Essay",
        points: 10,
        type: "text_input" as const,
        questions: [{
          id: "q15",
          question: "Using the Gyges Ring scenario, discuss whether true justice can exist without external accountability.",
          options: [],
          answer: "Students should engage with Plato's argument about justice being intrinsically valuable versus views that justice requires external enforcement or social contracts.",
          explanation: "This essay tests understanding of justice, moral motivation, and social contract theory."
        }]
      },
      // Additional Questions to reach 20 total
      {
        id: "q-16",
        title: "Question 16 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q16",
          question: "Explain how the Problem of Evil specifically challenges the existence of an omnipotent and omnibenevolent God.",
          options: [],
          answer: "If God is all-powerful and all-good, God should prevent evil. Since evil exists, either God cannot prevent it (not omnipotent) or will not prevent it (not omnibenevolent).",
          explanation: "This tests understanding of the logical structure of the Problem of Evil."
        }]
      },
      {
        id: "q-17",
        title: "Question 17 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q17",
          question: "What is constitutive moral luck and how does it differ from circumstantial moral luck?",
          options: [],
          answer: "Constitutive moral luck involves the traits and character we're born with or develop beyond our control. Circumstantial moral luck involves the situations we find ourselves in.",
          explanation: "This tests understanding of different categories of moral luck."
        }]
      },
      {
        id: "q-18",
        title: "Question 18 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q18",
          question: "According to Frankfurt, what makes someone morally responsible even without alternative possibilities?",
          options: [],
          answer: "Frankfurt argues that moral responsibility depends on acting according to one's own will and values, not on having alternative possibilities.",
          explanation: "This tests understanding of Frankfurt's theory of moral responsibility."
        }]
      },
      {
        id: "q-19",
        title: "Question 19 - Short Answer",
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q19",
          question: "In the Ring of Gyges story, what does the shepherd's behavior suggest about human nature and morality?",
          options: [],
          answer: "The story suggests that people may only act morally due to fear of consequences, raising questions about whether anyone would be just if they could act without being caught.",
          explanation: "This tests understanding of the philosophical implications of the Gyges story."
        }]
      },
      {
        id: "q-20",
        title: "Question 20 - Short Answer", 
        points: 5,
        type: "text_input" as const,
        questions: [{
          id: "q20",
          question: "Explain one way that moral luck challenges traditional notions of fairness in moral judgment.",
          options: [],
          answer: "Moral luck shows that factors beyond our control influence how we're judged morally, challenging the idea that moral assessment should be based only on what we control.",
          explanation: "This tests understanding of how moral luck relates to fairness and moral responsibility."
        }]
      }
    ]
  }
};