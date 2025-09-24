// Pre-existing course content to avoid waiting for AI generation

export const presetLectures = {
  1: {
    title: "Week 1: Basic Concepts, Notation, and Logical Operators",
    content: `<h2>Week 1: Basic Concepts, Notation, and Logical Operators</h2>

<h3>Overview</h3>
<p>Welcome to symbolic logic! This week introduces the fundamental building blocks of logical reasoning and formal notation systems.</p>

<h3>Key Concepts</h3>

<h4>1. Propositions and Truth Values</h4>
<ul>
<li>A <strong>proposition</strong> is a statement that is either true or false</li>
<li>Examples: "It is raining" (can be true or false)</li>
<li>Non-examples: "What time is it?" (questions aren't propositions)</li>
</ul>

<h4>2. Basic Logical Operators</h4>

<h5>Negation (¬)</h5>
<ul>
<li>Symbol: ¬ or ~</li>
<li>Meaning: "not"</li>
<li>Example: ¬P means "not P"</li>
</ul>

<h5>Conjunction (∧)</h5>
<ul>
<li>Symbol: ∧</li>
<li>Meaning: "and"</li>
<li>Example: P ∧ Q means "P and Q"</li>
<li>True only when both P and Q are true</li>
</ul>

<h5>Disjunction (∨)</h5>
<ul>
<li>Symbol: ∨</li>
<li>Meaning: "or" (inclusive or)</li>
<li>Example: P ∨ Q means "P or Q (or both)"</li>
<li>False only when both P and Q are false</li>
</ul>

<h5>Conditional (→)</h5>
<ul>
<li>Symbol: → or ⊃</li>
<li>Meaning: "if...then"</li>
<li>Example: P → Q means "if P then Q"</li>
<li>False only when P is true and Q is false</li>
</ul>

<h5>Biconditional (↔)</h5>
<ul>
<li>Symbol: ↔ or ≡</li>
<li>Meaning: "if and only if"</li>
<li>Example: P ↔ Q means "P if and only if Q"</li>
<li>True when P and Q have the same truth value</li>
</ul>

<h4>3. Truth Tables</h4>
<p>Truth tables show all possible truth value combinations for logical formulas.</p>

<h3>Practice Problems</h3>
<ol>
<li>Translate: "If it rains, then the ground is wet"</li>
<li>Create a truth table for: P ∧ (Q ∨ ¬R)</li>
<li>Determine when (P → Q) ∧ (Q → R) is true</li>
</ol>

<h3>Next Week Preview</h3>
<p>We'll explore more complex formulas and introduce quantifiers (∀, ∃).</p>`
  },
  2: {
    title: "Week 2: Complex Formulas and Truth Tables",
    content: `<h2>Week 2: Complex Formulas and Truth Tables</h2>

<h3>Building Complex Logical Formulas</h3>

<h4>Operator Precedence</h4>
<ol>
<li>Negation (¬) - highest priority</li>
<li>Conjunction (∧) and Disjunction (∨)</li>
<li>Conditional (→) and Biconditional (↔) - lowest priority</li>
</ol>

<h4>Parentheses for Clarity</h4>
<ul>
<li>Use parentheses to group operations: (P ∧ Q) → R</li>
<li>Without parentheses: P ∧ Q → R means P ∧ (Q → R)</li>
</ul>

<h3>Advanced Truth Table Construction</h3>

<h4>Step-by-Step Method</h4>
<ol>
<li>List all atomic propositions</li>
<li>Create columns for all possible truth value combinations</li>
<li>Build intermediate columns for subformulas</li>
<li>Calculate final column for the complete formula</li>
</ol>

<h4>Example: (P → Q) ∧ (¬P ∨ Q)</h4>

<table border="1">
<tr><th>P</th><th>Q</th><th>P→Q</th><th>¬P</th><th>¬P∨Q</th><th>(P→Q)∧(¬P∨Q)</th></tr>
<tr><td>T</td><td>T</td><td>T</td><td>F</td><td>T</td><td>T</td></tr>
<tr><td>T</td><td>F</td><td>F</td><td>F</td><td>F</td><td>F</td></tr>
<tr><td>F</td><td>T</td><td>T</td><td>T</td><td>T</td><td>T</td></tr>
<tr><td>F</td><td>F</td><td>T</td><td>T</td><td>T</td><td>T</td></tr>
</table>

<h3>Tautologies, Contradictions, and Contingencies</h3>

<h4>Tautology</h4>
<ul>
<li>Always true regardless of truth values</li>
<li>Example: P ∨ ¬P</li>
</ul>

<h4>Contradiction</h4>
<ul>
<li>Always false regardless of truth values</li>
<li>Example: P ∧ ¬P</li>
</ul>

<h4>Contingency</h4>
<ul>
<li>Sometimes true, sometimes false</li>
<li>Most formulas are contingencies</li>
</ul>

<h3>Logical Equivalence</h3>
<p>Two formulas are logically equivalent if they have identical truth tables.</p>

<p>Examples:</p>
<ul>
<li>P → Q ≡ ¬P ∨ Q</li>
<li>¬(P ∧ Q) ≡ ¬P ∨ ¬Q (De Morgan's Law)</li>
</ul>

<h3>Practice Problems</h3>
<ol>
<li>Construct truth table for: (P ∧ Q) → (P ∨ R)</li>
<li>Prove: ¬(P → Q) ≡ P ∧ ¬Q</li>
<li>Identify tautologies: P → P, P ∧ ¬P, (P → Q) → ((Q → R) → (P → R))</li>
</ol>`
  },
  3: {
    title: "Week 3: Boolean Algebra and Functions",
    content: `<h2>Week 3: Boolean Algebra and Functions</h2>

<h3>Boolean Algebra Fundamentals</h3>

<h4>Basic Laws</h4>

<h5>Identity Laws</h5>
<ul>
<li>P ∧ T ≡ P (True is identity for ∧)</li>
<li>P ∨ F ≡ P (False is identity for ∨)</li>
</ul>

<h5>Domination Laws</h5>
<ul>
<li>P ∧ F ≡ F (False dominates ∧)</li>
<li>P ∨ T ≡ T (True dominates ∨)</li>
</ul>

<h5>Idempotent Laws</h5>
<ul>
<li>P ∧ P ≡ P</li>
<li>P ∨ P ≡ P</li>
</ul>

<h5>Commutative Laws</h5>
<ul>
<li>P ∧ Q ≡ Q ∧ P</li>
<li>P ∨ Q ≡ Q ∨ P</li>
</ul>

<h5>Associative Laws</h5>
<ul>
<li>(P ∧ Q) ∧ R ≡ P ∧ (Q ∧ R)</li>
<li>(P ∨ Q) ∨ R ≡ P ∨ (Q ∨ R)</li>
</ul>

<h5>Distributive Laws</h5>
<ul>
<li>P ∧ (Q ∨ R) ≡ (P ∧ Q) ∨ (P ∧ R)</li>
<li>P ∨ (Q ∧ R) ≡ (P ∨ Q) ∧ (P ∨ R)</li>
</ul>

<h5>De Morgan's Laws</h5>
<ul>
<li>¬(P ∧ Q) ≡ ¬P ∨ ¬Q</li>
<li>¬(P ∨ Q) ≡ ¬P ∧ ¬Q</li>
</ul>

<h5>Double Negation</h5>
<ul>
<li>¬¬P ≡ P</li>
</ul>

<h4>Boolean Functions</h4>

<h5>Definition</h5>
<p>A Boolean function maps n Boolean variables to a Boolean result:<br>
f: {T,F}ⁿ → {T,F}</p>

<h5>Truth Table Representation</h5>
<p>Every Boolean function can be represented by a truth table.</p>

<h5>Normal Forms</h5>

<h6>Disjunctive Normal Form (DNF)</h6>
<ul>
<li>Disjunction of conjunctions</li>
<li>Example: (P ∧ Q) ∨ (¬P ∧ R)</li>
</ul>

<h6>Conjunctive Normal Form (CNF)</h6>
<ul>
<li>Conjunction of disjunctions</li>
<li>Example: (P ∨ Q) ∧ (¬P ∨ R)</li>
</ul>

<h4>Function Minimization</h4>

<h5>Using Boolean Laws</h5>
<p>Simplify expressions by applying algebraic laws:</p>
<ul>
<li>(P ∧ Q) ∨ (P ∧ ¬Q) ≡ P ∧ (Q ∨ ¬Q) ≡ P ∧ T ≡ P</li>
</ul>

<h5>Karnaugh Maps (K-maps)</h5>
<p>Visual method for minimizing Boolean functions with few variables.</p>

<h3>Applications</h3>

<h4>Circuit Design</h4>
<p>Boolean algebra directly corresponds to digital circuits:</p>
<ul>
<li>AND gates implement ∧</li>
<li>OR gates implement ∨</li>
<li>NOT gates implement ¬</li>
</ul>

<h4>Computer Science</h4>
<ul>
<li>Database queries</li>
<li>Search algorithms</li>
<li>Conditional statements in programming</li>
</ul>

<h3>Practice Problems</h3>
<ol>
<li>Simplify: (P ∧ Q) ∨ (P ∧ ¬Q) ∨ (¬P ∧ Q)</li>
<li>Convert to CNF: P → (Q ∨ R)</li>
<li>Find DNF from truth table with outputs T,F,T,T for inputs 00,01,10,11</li>
</ol>`
  },
  4: {
    title: "Week 4: Predicate Logic and Quantifiers",
    content: `# Week 4: Predicate Logic and Quantifiers

## Beyond Propositional Logic

### Limitations of Propositional Logic
Propositional logic treats statements as atomic units, but many logical arguments involve relationships between objects.

Example that propositional logic can't handle:
- "All humans are mortal"
- "Socrates is human"  
- "Therefore, Socrates is mortal"

### Predicate Logic Components

#### Predicates
- Functions that return true/false for given arguments
- P(x): "x is a person"
- L(x,y): "x loves y"
- Between(x,y,z): "x is between y and z"

#### Terms
- Constants: specific objects (socrates, 5, π)
- Variables: placeholders (x, y, z)
- Functions: operations that return objects (father(x), +(2,3))

### Quantifiers

#### Universal Quantifier (∀)
- Symbol: ∀
- Meaning: "for all" or "for every"
- ∀x P(x): "For all x, P(x) is true"
- Example: ∀x (Human(x) → Mortal(x))

#### Existential Quantifier (∃)
- Symbol: ∃  
- Meaning: "there exists" or "for some"
- ∃x P(x): "There exists an x such that P(x) is true"
- Example: ∃x (Student(x) ∧ Smart(x))

### Quantifier Scope and Binding

#### Scope
The scope of a quantifier is the formula it governs:
- ∀x (P(x) → Q(x)): scope is (P(x) → Q(x))

#### Bound vs Free Variables
- Bound: variable controlled by a quantifier
- Free: variable not controlled by any quantifier
- In ∀x P(x,y): x is bound, y is free

### Multiple Quantifiers

#### Order Matters
- ∀x ∃y L(x,y): "Everyone loves someone"
- ∃y ∀x L(x,y): "Someone is loved by everyone"

#### Common Patterns
- ∀x ∀y: "For all x and all y"
- ∃x ∃y: "There exist x and y"  
- ∀x ∃y: "For every x, there exists a y"
- ∃x ∀y: "There exists an x such that for all y"

### Negation with Quantifiers

#### De Morgan's Laws for Quantifiers
- ¬∀x P(x) ≡ ∃x ¬P(x)
- ¬∃x P(x) ≡ ∀x ¬P(x)

#### Examples
- ¬∀x (Student(x) → Smart(x)) ≡ ∃x (Student(x) ∧ ¬Smart(x))
- "Not all students are smart" = "Some student is not smart"

### Translation Practice

#### English to Logic
- "All cats are animals": ∀x (Cat(x) → Animal(x))
- "Some dogs bark": ∃x (Dog(x) ∧ Bark(x))
- "No one is perfect": ∀x ¬Perfect(x) or ¬∃x Perfect(x)

#### Logic to English
- ∀x (Bird(x) → CanFly(x)): "All birds can fly"
- ∃x (Student(x) ∧ ∀y (Course(y) → Taking(x,y))): "Some student is taking every course"

## Practice Problems
1. Translate: "Every student has read some book"
2. Negate: ∀x ∃y (Friend(x,y) ∧ Smart(y))
3. Express: "There is exactly one person who knows everything"`
  },
  5: {
    title: "Week 5: Logical Inference and Proof Methods",
    content: `# Week 5: Logical Inference and Proof Methods

## Rules of Inference

### Modus Ponens
- Form: P → Q, P ⊢ Q
- "If P implies Q, and P is true, then Q is true"
- Example: "If it rains, streets get wet. It's raining. Therefore, streets are wet."

### Modus Tollens  
- Form: P → Q, ¬Q ⊢ ¬P
- "If P implies Q, and Q is false, then P is false"
- Example: "If it rains, streets get wet. Streets aren't wet. Therefore, it's not raining."

### Hypothetical Syllogism
- Form: P → Q, Q → R ⊢ P → R
- Chain conditionals together
- Example: "If it rains, streets get wet. If streets get wet, driving is dangerous. Therefore, if it rains, driving is dangerous."

### Disjunctive Syllogism
- Form: P ∨ Q, ¬P ⊢ Q
- "Either P or Q. Not P. Therefore Q."
- Example: "Either John or Mary did it. John didn't do it. Therefore Mary did it."

### Addition
- Form: P ⊢ P ∨ Q
- "P is true, therefore P or Q is true"

### Simplification
- Form: P ∧ Q ⊢ P (also P ∧ Q ⊢ Q)
- "P and Q are both true, therefore P is true"

### Conjunction
- Form: P, Q ⊢ P ∧ Q  
- "P is true and Q is true, therefore P and Q"

### Resolution
- Form: P ∨ Q, ¬P ∨ R ⊢ Q ∨ R
- Foundation for automated theorem proving

### Universal Instantiation (UI)
- Form: ∀x P(x) ⊢ P(c) for any constant c
- "If P is true for all x, then P is true for any specific constant"

### Existential Generalization (EG)
- Form: P(c) ⊢ ∃x P(x)
- "If P is true for some constant c, then there exists an x for which P is true"

## Proof Techniques

### Direct Proof
1. Assume the premises are true
2. Apply rules of inference step by step
3. Derive the conclusion

Example: Prove P → Q, Q → R ⊢ P → R
1. P → Q        (Premise)
2. Q → R        (Premise)  
3. P            (Assumption for conditional proof)
4. Q            (1,3 Modus Ponens)
5. R            (2,4 Modus Ponens)
6. P → R        (3-5 Conditional Proof)

### Proof by Contradiction
1. Assume the negation of what you want to prove
2. Derive a contradiction
3. Conclude the original statement must be true

### Conditional Proof
To prove P → Q:
1. Assume P
2. Derive Q
3. Conclude P → Q

### Proof by Cases
To prove a conclusion from P ∨ Q:
1. Assume P and derive the conclusion
2. Assume Q and derive the conclusion  
3. Since P ∨ Q, the conclusion follows in either case

## Natural Deduction

### Introduction and Elimination Rules

#### Conjunction
- Introduction: P, Q ⊢ P ∧ Q
- Elimination: P ∧ Q ⊢ P and P ∧ Q ⊢ Q

#### Disjunction  
- Introduction: P ⊢ P ∨ Q and Q ⊢ P ∨ Q
- Elimination: P ∨ Q, P → R, Q → R ⊢ R

#### Conditional
- Introduction: [P ... Q] ⊢ P → Q (Conditional Proof)
- Elimination: P → Q, P ⊢ Q (Modus Ponens)

#### Negation
- Introduction: [P ... ⊥] ⊢ ¬P (Proof by contradiction)
- Elimination: ¬¬P ⊢ P (Double negation)

## Formal Proof Systems

### Hilbert-style Systems
- Few inference rules
- Many axioms
- Compact but hard to use

### Natural Deduction
- Many inference rules
- Few/no axioms  
- Intuitive and practical

### Sequent Calculus
- Symmetric treatment of premises and conclusions
- Good for automated reasoning

## Practice Problems
1. Prove: P → Q, ¬Q ⊢ ¬P
2. Prove: ∀x (P(x) → Q(x)), ∀x P(x) ⊢ ∀x Q(x)
3. Show by contradiction: ¬(P ∧ ¬P)`
  },
  6: {
    title: "Week 6: Advanced Topics and Applications",
    content: `# Week 6: Advanced Topics and Applications

## Modal Logic

### Necessity and Possibility
- □P: "It is necessary that P" (P is necessarily true)
- ◊P: "It is possible that P" (P is possibly true)
- Relationship: ◊P ≡ ¬□¬P

### Modal Axioms
- K: □(P → Q) → (□P → □Q)
- T: □P → P (what's necessary is true)
- S4: □P → □□P (necessity is necessary)
- S5: ◊P → □◊P (possibility is necessarily possible)

### Applications
- Epistemic logic: knowledge and belief
- Deontic logic: obligation and permission
- Temporal logic: always/eventually

## Many-Valued Logic

### Three-Valued Logic
- Truth values: True, False, Unknown/Undefined
- Useful for databases (NULL values)
- Kleene's strong three-valued logic

### Fuzzy Logic
- Truth values range from 0 to 1
- Degrees of membership
- Applications in AI and control systems

## Non-Classical Logics

### Intuitionistic Logic
- Rejects law of excluded middle: ¬(P ∨ ¬P)
- Constructive approach to mathematics
- ¬¬P does not imply P

### Paraconsistent Logic
- Allows contradictions without explosion
- ¬(P ∧ ¬P → Q) - contradictions don't imply everything
- Useful for inconsistent databases

### Relevance Logic
- Requires relevance between antecedent and consequent
- Rejects paradoxes of material implication
- P → (Q → P) is not a theorem

## Applications in Computer Science

### Database Query Languages
- SQL uses three-valued logic for NULL handling
- Relational algebra operations
- Query optimization

### Programming Language Semantics
- Hoare logic for program verification
- Pre/post conditions
- Loop invariants

### Artificial Intelligence

#### Automated Theorem Proving
- Resolution method
- Tableau methods
- Model checking

#### Logic Programming
- Prolog: facts, rules, queries
- Horn clauses
- Unification algorithm

#### Knowledge Representation
- Description logics
- Semantic web (RDF, OWL)
- Expert systems

### Circuit Design
- Boolean functions → logic gates
- Minimization techniques
- Sequential vs combinational circuits

## Computational Complexity

### Satisfiability (SAT)
- First NP-complete problem
- Boolean satisfiability
- SAT solvers in practice

### Model Checking
- Verify finite-state systems
- Temporal logic specifications
- State explosion problem

## Philosophical Applications

### Paradoxes

#### Russell's Paradox
- Set of all sets that don't contain themselves
- Foundation crisis in mathematics
- Resolution through type theory

#### Liar Paradox
- "This statement is false"
- Self-reference problems
- Tarski's hierarchy of languages

### Logic and Language
- Compositionality principle
- Formal semantics for natural language
- Montague grammar

## Advanced Proof Techniques

### Cut Elimination
- Removing intermediate lemmas
- Gentzen's Hauptsatz
- Computational interpretation

### Proof by Induction
- Mathematical induction
- Structural induction on formulas
- Well-founded induction

## Course Review

### Key Concepts Mastered
1. Propositional logic and truth tables
2. Boolean algebra and minimization
3. Predicate logic and quantifiers
4. Natural deduction and proof methods
5. Advanced logics and applications

### Skills Developed
- Formal reasoning and proof construction
- Translation between natural and formal languages
- Recognition of logical patterns and structures
- Application of logic to real-world problems

### Further Study
- Mathematical logic and set theory
- Computability and complexity theory
- Logic in artificial intelligence
- Philosophical logic and foundations

## Final Exam Preparation
Review all weekly materials, practice proofs, and understand the connections between different logical systems. Focus on translation skills and proof techniques.`
  }
};

export const presetPracticeHomework = {
  1: {
    title: "Week 1 Practice Homework: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "Translate: 'If it rains, then the ground is wet' using P for rain and Q for wet ground.",
              answer: "P → Q",
              explanation: "This is a conditional statement: if P then Q."
            }
          ]
        }
      ]
    }
  },
  2: {
    title: "Week 2 Practice Homework: Test Version", 
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "Is 'The sky is blue' a proposition?",
              options: ["Yes, it's true", "Yes, it's false", "No, it's not a proposition"],
              correct: 0,
              explanation: "This is a proposition because it can be either true or false."
            }
          ]
        }
      ]
    }
  },
  3: {
    title: "Week 3 Practice Homework: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "Simplify: P ∧ (P ∨ Q)",
              answer: "P",
              explanation: "By absorption law: P ∧ (P ∨ Q) = P"
            }
          ]
        }
      ]
    }
  },
  4: {
    title: "Week 4 Practice Homework: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "Translate: 'All students are smart' using S(x) for student, M(x) for smart",
              answer: "∀x(S(x) → M(x))",
              explanation: "Universal quantification with conditional"
            }
          ]
        }
      ]
    }
  },
  5: {
    title: "Week 5 Practice Homework: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "What rule of inference: P → Q, P ∴ Q",
              answer: "Modus Ponens",
              explanation: "Classic rule: if P implies Q and P is true, then Q is true"
            }
          ]
        }
      ]
    }
  },
  6: {
    title: "Week 6 Practice Homework: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "What type of statement is P ∨ ¬P?",
              options: ["Tautology", "Contradiction", "Contingency"],
              correct: 0,
              explanation: "Always true, so it's a tautology"
            }
          ]
        }
      ]
    }
  },
  7: {
    title: "Week 7 Practice Homework: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "Express 'It is possible that P' in modal logic",
              answer: "◊P",
              explanation: "Diamond symbol represents possibility in modal logic"
            }
          ]
        }
      ]
    }
  },
  8: {
    title: "Week 8 Practice Homework: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test", 
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "Which is a valid inference rule?",
              options: ["Modus Ponens", "Affirming Consequent", "Denying Antecedent"],
              correct: 0,
              explanation: "Modus Ponens is valid, the others are fallacies"
            }
          ]
        }
      ]
    }
  }
};

export const presetPracticeQuizzes = {
  1: {
    title: "Week 1 Practice Quiz: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "Which symbol represents 'and'?",
              options: ["∧", "∨", "→"],
              correct: 0,
              explanation: "∧ is the symbol for logical conjunction (and)"
            }
          ]
        }
      ]
    }
  },
  2: {
    title: "Week 2 Practice Quiz: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "What is ¬(P ∧ Q) equivalent to?",
              answer: "¬P ∨ ¬Q",
              explanation: "De Morgan's law: negation distributes over conjunction"
            }
          ]
        }
      ]
    }
  },
  3: {
    title: "Week 3 Practice Quiz: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1", 
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "What is the absorption law?",
              options: ["P ∧ (P ∨ Q) = P", "P ∨ (P ∧ Q) = Q", "P ∧ Q = Q ∧ P"],
              correct: 0,
              explanation: "Absorption: P ∧ (P ∨ Q) = P"
            }
          ]
        }
      ]
    }
  },
  4: {
    title: "Week 4 Practice Quiz: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "What does ∀x P(x) mean?",
              answer: "For all x, P(x) is true",
              explanation: "Universal quantifier means the property holds for all elements"
            }
          ]
        }
      ]
    }
  },
  5: {
    title: "Week 5 Practice Quiz: Test Version",
    content: {
      instructions: "Single question test version for app testing.", 
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "Which is NOT a valid rule of inference?",
              options: ["Modus Ponens", "Modus Tollens", "Affirming Consequent"],
              correct: 2,
              explanation: "Affirming the consequent is a logical fallacy, not valid"
            }
          ]
        }
      ]
    }
  },
  6: {
    title: "Week 6 Practice Quiz: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "What does □P mean in modal logic?",
              answer: "P is necessarily true",
              explanation: "Box symbol represents necessity in modal logic"
            }
          ]
        }
      ]
    }
  },
  7: {
    title: "Week 7 Practice Quiz: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "In temporal logic, what does Gp mean?",
              options: ["p is always true", "p is sometimes true", "p was true"],
              correct: 0,
              explanation: "G (globally) means the proposition is always true"
            }
          ]
        }
      ]
    }
  },
  8: {
    title: "Week 8 Practice Quiz: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "What is the main goal of automated theorem proving?",
              answer: "Prove theorems using computer algorithms",
              explanation: "Automated theorem proving uses algorithms to establish mathematical truths"
            }
          ]
        }
      ]
    }
  }
};

export const presetPracticeTests = {
  1: {
    title: "Week 1 Practice Test: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "Define what makes a statement a proposition",
              answer: "A statement that is either true or false",
              explanation: "Propositions are declarative statements with definite truth values"
            }
          ]
        }
      ]
    }
  },
  2: {
    title: "Week 2 Practice Test: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "When is P → Q false?",
              options: ["When P is true and Q is false", "When P is false and Q is true", "When both are false"],
              correct: 0,
              explanation: "Conditional is false only when antecedent is true and consequent is false"
            }
          ]
        }
      ]
    }
  },
  3: {
    title: "Week 3 Practice Test: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "Apply absorption law to simplify: P ∧ (P ∨ Q)",
              answer: "P",
              explanation: "Absorption law: P ∧ (P ∨ Q) = P"
            }
          ]
        }
      ]
    }
  },
  4: {
    title: "Week 4 Practice Test: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "What does ∃x P(x) mean?",
              options: ["For all x, P(x)", "For some x, P(x)", "For no x, P(x)"],
              correct: 1,
              explanation: "Existential quantifier means there exists some x for which P(x) is true"
            }
          ]
        }
      ]
    }
  },
  5: {
    title: "Week 5 Practice Test: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "What is the contrapositive of P → Q?",
              answer: "¬Q → ¬P",
              explanation: "Contrapositive switches and negates both parts"
            }
          ]
        }
      ]
    }
  },
  6: {
    title: "Week 6 Practice Test: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "In three-valued logic, what represents unknown?",
              options: ["T", "F", "U"],
              correct: 2,
              explanation: "U represents unknown/undefined in three-valued logic systems"
            }
          ]
        }
      ]
    }
  },
  7: {
    title: "Week 7 Practice Test: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "text_input",
          questions: [
            {
              id: "p1a",
              question: "What does Fp mean in temporal logic?",
              answer: "p will be true in the future",
              explanation: "F (future) operator means the proposition will hold at some future time"
            }
          ]
        }
      ]
    }
  },
  8: {
    title: "Week 8 Practice Test: Test Version",
    content: {
      instructions: "Single question test version for app testing.",
      totalPoints: 10,
      problems: [
        {
          id: "p1",
          title: "Basic Logic Test",
          points: 10,
          type: "multiple_choice",
          questions: [
            {
              id: "p1a",
              question: "What is the key benefit of automated reasoning?",
              options: ["Speed", "Accuracy", "Both speed and accuracy"],
              correct: 2,
              explanation: "Automated reasoning provides both speed and accuracy advantages"
            }
          ]
        }
      ]
    }
  }
};
        {
          id: "p1",
          title: "Operator Precedence",
          points: 20,
          type: "text_input",
          context: "Add parentheses to clarify meaning according to standard precedence rules:",
          questions: [
            {
              id: "p1a",
              question: "¬P ∧ Q → R ∨ S",
              answer: "((¬P ∧ Q) → (R ∨ S))",
              explanation: "Negation has highest precedence, then ∧ and ∨, then → has lowest precedence."
            },
            {
              id: "p1b",
              question: "P → Q ∧ R ↔ S ∨ T",
              answer: "(P → (Q ∧ R)) ↔ (S ∨ T)",
              explanation: "∧ and ∨ bind tighter than → and ↔."
            }
          ]
        },
        {
          id: "p2",
          title: "Logical Equivalences",
          points: 25,
          type: "multiple_choice",
          questions: [
            {
              id: "p2a",
              question: "Which is equivalent to P → Q?",
              options: ["¬P ∨ Q", "P ∧ Q", "¬P ∧ Q", "P ∨ ¬Q"],
              correct: 0,
              explanation: "P → Q is equivalent to ¬P ∨ Q by the definition of conditional."
            },
            {
              id: "p2b",
              question: "Which is equivalent to ¬(P ∧ Q)?",
              options: ["¬P ∧ ¬Q", "¬P ∨ ¬Q", "P ∨ Q", "¬P → ¬Q"],
              correct: 1,
              explanation: "By De Morgan's law: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q"
            }
          ]
        },
        {
          id: "p3",
          title: "Tautologies and Contradictions",
          points: 30,
          type: "multiple_choice",
          questions: [
            {
              id: "p3a", 
              question: "What type is P ∨ ¬P?",
              options: ["Tautology", "Contradiction", "Contingency"],
              correct: 0,
              explanation: "P ∨ ¬P is always true, making it a tautology."
            },
            {
              id: "p3b",
              question: "What type is P ∧ ¬P?",
              options: ["Tautology", "Contradiction", "Contingency"],
              correct: 1,
              explanation: "P ∧ ¬P is always false, making it a contradiction."
            },
            {
              id: "p3c",
              question: "What type is (P → Q) → ((Q → R) → (P → R))?",
              options: ["Tautology", "Contradiction", "Contingency"],
              correct: 0,
              explanation: "This represents transitivity of implication and is always true."
            }
          ]
        },
        {
          id: "p4",
          title: "Complex Truth Evaluations",
          points: 25,
          type: "calculation",
          context: "Given P = True, Q = False, R = True, evaluate:",
          questions: [
            {
              id: "p4a",
              question: "(P ∧ Q) → (R ∨ ¬P)",
              answer: "True",
              explanation: "(True ∧ False) → (True ∨ False) = False → True = True"
            },
            {
              id: "p4b",
              question: "(P → Q) ↔ (¬Q → ¬P)",
              answer: "True",
              explanation: "(True → False) ↔ (True → False) = False ↔ False = True"
            }
          ]
        }
      ]
    }
  },
  3: {
    title: "Week 3 Practice Homework: Boolean Algebra Applications",
    content: `# Week 3 Practice Homework: Boolean Algebra Applications

## Problem 1: Boolean Simplification (25 points)
Simplify using Boolean algebra laws. Show each step and name the law used:

a) (P ∧ Q) ∨ (P ∧ ¬Q)
b) (P ∨ Q) ∧ (P ∨ ¬Q) ∧ (¬P ∨ Q)
c) ¬(¬P ∨ Q) ∨ (P ∧ ¬Q)
d) (P → Q) ∧ (P → ¬Q) ∧ P

## Problem 2: Normal Forms (20 points)
Convert to both CNF and DNF:

a) P → (Q ∧ R)
b) (P ∨ Q) ↔ R
c) ¬((P ∧ Q) → R)

## Problem 3: Function Minimization (15 points)
Given this truth table, find the minimal DNF and CNF:

| P | Q | R | F(P,Q,R) |
|---|---|---|----------|
| 0 | 0 | 0 |    1     |
| 0 | 0 | 1 |    0     |
| 0 | 1 | 0 |    1     |
| 0 | 1 | 1 |    1     |
| 1 | 0 | 0 |    0     |
| 1 | 0 | 1 |    0     |
| 1 | 1 | 0 |    1     |
| 1 | 1 | 1 |    0     |

## Problem 4: Digital Circuit Design (20 points)
Design a circuit for a 3-way light switch system:
- 3 switches A, B, C can each toggle the light
- Light starts OFF
- Flipping any switch changes the light state
- Express as Boolean function and minimize

## Problem 5: Applications (20 points)
A vending machine accepts quarters (Q), dimes (D), and nickels (N). It should dispense a drink when the total is ≥25 cents. Design the logic for combinations that total exactly 25 cents using at most 4 coins.

Express as Boolean function and create the circuit.`
  },
  4: {
    title: "Week 4 Practice Homework: Predicate Logic and Quantifiers",
    content: `# Week 4 Practice Homework: Predicate Logic and Quantifiers

## Problem 1: Translation to Predicate Logic (25 points)
Translate using appropriate predicates and quantifiers:

a) "All students are hardworking."
b) "Some professors are brilliant."
c) "No one is perfect."
d) "Every dog has an owner."
e) "There is a book that everyone has read."

## Problem 2: Multiple Quantifiers (20 points)
Translate and explain the difference:

a) ∀x ∃y Love(x,y)
b) ∃y ∀x Love(x,y)
c) ∀x ∀y (Friend(x,y) → Friend(y,x))
d) ∃x ∃y (Student(x) ∧ Professor(y) ∧ Teaches(y,x))

## Problem 3: Negation with Quantifiers (15 points)
Find the logical negation:

a) ∀x (Student(x) → Smart(x))
b) ∃x (Cat(x) ∧ ∀y (Mouse(y) → Chases(x,y)))
c) ∀x ∃y (Parent(x,y) ∧ Love(x,y))

## Problem 4: Scope and Binding (10 points)
Identify bound and free variables:

a) ∀x (P(x,y) → ∃z Q(x,z,w))
b) ∃x (∀y R(x,y) ∧ S(z))
c) ∀x ∀y (P(x) → (∃x Q(x,y) ∧ R(x)))

## Problem 5: Complex Translations (20 points)
Express in predicate logic:

a) "Every student who studies hard passes the course."
b) "There is exactly one person who knows everything."
c) "If someone loves everyone, then everyone loves someone."
d) "No two people have the same social security number."

## Problem 6: Domain of Discourse (10 points)
Given domain: {1, 2, 3}
P(x): "x is even"
Q(x): "x > 2"

Evaluate the truth value:
a) ∀x P(x)
b) ∃x (P(x) ∧ Q(x))
c) ∀x (P(x) → ¬Q(x))
d) ∃x ∀y (x ≠ y → ¬(P(x) ↔ P(y)))`
  },
  5: {
    title: "Week 5 Practice Homework: Proofs and Inference",
    content: `# Week 5 Practice Homework: Proofs and Inference

## Problem 1: Rules of Inference (20 points)
Identify the rule of inference used:

a) P → Q, P ∴ Q
b) P ∨ Q, ¬P ∴ Q
c) P, Q ∴ P ∧ Q
d) P → Q, Q → R ∴ P → R
e) ∀x P(x) ∴ P(a)

## Problem 2: Direct Proofs (25 points)
Construct formal proofs:

a) P → Q, Q → R, P ⊢ R
b) P ∨ Q, P → R, Q → R ⊢ R
c) ∀x (P(x) → Q(x)), ∀x P(x) ⊢ ∀x Q(x)

## Problem 3: Conditional Proof (15 points)
Prove using conditional proof:
(P ∧ Q) → R ⊢ P → (Q → R)

## Problem 4: Proof by Contradiction (15 points)
Prove using contradiction:
P → Q, ¬Q ⊢ ¬P

## Problem 5: Natural Deduction (25 points)
Complete these proofs using natural deduction rules:

a) Prove: ¬¬P ⊢ P
b) Prove: P ∧ Q ⊢ Q ∧ P
c) Prove: P → Q ⊢ ¬Q → ¬P
d) Prove: (P → Q) ∧ (R → S) ⊢ (P ∧ R) → (Q ∧ S)

Show each step with justification.`
  },
  6: {
    title: "Week 6 Practice Homework: Advanced Applications",
    content: `# Week 6 Practice Homework: Advanced Applications

## Problem 1: Modal Logic (20 points)
Express using □ (necessity) and ◊ (possibility):

a) "It is possible that it will rain tomorrow."
b) "If something is necessary, then it is true."
c) "If something is possible, then it is not necessarily false."

## Problem 2: Three-Valued Logic (15 points)
Using truth values {T, F, U} for True, False, Unknown:
Evaluate (P ∧ Q) ∨ ¬R when P=T, Q=U, R=F

## Problem 3: Logic Programming (20 points)
Write Prolog-style rules for:
- parent(X,Y) means X is parent of Y
- grandparent(X,Z) means X is grandparent of Z
- sibling(X,Y) means X and Y are siblings

Express: "Someone is a grandparent if they are the parent of someone who is also a parent."

## Problem 4: Circuit Optimization (15 points)
Minimize this Boolean function using algebraic methods:
F = AB'C + ABC + A'BC + AB'C'

## Problem 5: Automated Reasoning (15 points)
Use resolution to prove:
From: {P ∨ Q, ¬P ∨ R, ¬Q ∨ R}
Prove: R

## Problem 6: Real-World Application (15 points)
Design a logic system for a smart home:
- Lights turn on if motion detected AND (dark outside OR manual override)
- Alarm sounds if door opens AND (system armed OR motion in restricted area)
- System arms if all doors locked AND all windows closed AND override not active

Express in logic and analyze for consistency.`
  }
};

export const presetPracticeQuizzes = {
  1: {
    title: "Week 1 Practice Quiz: Logic Fundamentals",
    content: `# Week 1 Practice Quiz: Logic Fundamentals

**Time Limit:** 20 minutes | **Questions:** 10 | **Practice Mode - No Grades Recorded**

## Question 1 (2 points)
Which of the following is NOT a proposition?
a) The sky is blue
b) 2 + 2 = 5
c) Please close the door
d) All cats are mammals

## Question 2 (2 points)
If P is true and Q is false, what is the truth value of P ∧ Q?
a) True
b) False
c) Cannot be determined
d) Both true and false

## Question 3 (2 points)
The symbol ∨ represents:
a) Conjunction (and)
b) Disjunction (or)
c) Negation (not)
d) Conditional (if-then)

## Question 4 (2 points)
Given P = "It's raining" and Q = "The ground is wet", translate "If it's raining, then the ground is wet":
a) P ∧ Q
b) P ∨ Q
c) P → Q
d) P ↔ Q

## Question 5 (3 points)
When is P → Q false?
a) When P is true and Q is true
b) When P is true and Q is false
c) When P is false and Q is true
d) When P is false and Q is false

## Question 6 (3 points)
What is the truth value of ¬(True ∧ False)?
a) True
b) False
c) Cannot be determined
d) Undefined

## Question 7 (3 points)
The biconditional P ↔ Q is true when:
a) P and Q have the same truth value
b) P and Q have different truth values
c) P is true
d) Q is false

## Question 8 (3 points)
Which logical operator has the highest precedence?
a) ∧ (conjunction)
b) ∨ (disjunction)
c) ¬ (negation)
d) → (conditional)

## Question 9 (4 points)
Create a truth table for P ∧ ¬Q:

| P | Q | ¬Q | P ∧ ¬Q |
|---|---|----|----- --|
| T | T |    |        |
| T | F |    |        |
| F | T |    |        |
| F | F |    |        |

## Question 10 (6 points)
Translate into symbolic logic using P = "The alarm sounds" and Q = "There is danger":
"The alarm sounds if and only if there is danger, and if there is no danger, the alarm doesn't sound."

Show your work and explain your reasoning.

**Answer Key Available After Completion**`
  },
  2: {
    title: "Week 2 Practice Quiz: Truth Tables and Equivalences",
    content: `# Week 2 Practice Quiz: Truth Tables and Equivalences

**Practice Mode - Unlimited Attempts**

## Question 1 (3 points)
Which formula is a tautology?
a) P ∧ ¬P
b) P ∨ ¬P
c) P → ¬P
d) P ↔ ¬P

## Question 2 (3 points)
The formula (P → Q) is logically equivalent to:
a) ¬P ∨ Q
b) P ∧ Q
c) ¬P ∧ Q
d) P ∨ ¬Q

## Question 3 (4 points)
How many rows will a truth table have for a formula with 4 different propositional variables?
a) 4
b) 8
c) 12
d) 16

## Question 4 (5 points)
Complete this truth table for (P ∨ Q) → R:

| P | Q | R | P∨Q | (P∨Q)→R |
|---|---|---|-----|---------|
| T | T | T |     |         |
| T | T | F |     |         |
| T | F | T |     |         |
| T | F | F |     |         |
| F | T | T |     |         |
| F | T | F |     |         |
| F | F | T |     |         |
| F | F | F |     |         |

## Question 5 (5 points)
Apply De Morgan's Law to ¬(P ∧ Q):
a) ¬P ∧ ¬Q
b) ¬P ∨ ¬Q
c) P ∨ Q
d) P ∧ Q

## Question 6 (5 points)
Which pair of formulas are logically equivalent?
a) P → Q and Q → P
b) ¬(P ∨ Q) and ¬P ∧ ¬Q
c) P ∧ Q and P ∨ Q
d) P ↔ Q and (P → Q) ∨ (Q → P)

## Question 7 (5 points)
A contradiction is a formula that is:
a) Always true
b) Always false
c) Sometimes true, sometimes false
d) Undefined`
  },
  3: {
    title: "Week 3 Practice Quiz: Boolean Algebra",
    content: `# Week 3 Practice Quiz: Boolean Algebra

**Practice Mode - Focus on Minimization**

## Question 1 (4 points)
Simplify: P ∧ (P ∨ Q)
a) P
b) Q
c) P ∧ Q
d) P ∨ Q

## Question 2 (4 points)
Which law does P ∨ (Q ∧ R) ≡ (P ∨ Q) ∧ (P ∨ R) represent?
a) Associative Law
b) Distributive Law
c) Commutative Law
d) De Morgan's Law

## Question 3 (5 points)
Convert to CNF: P → (Q ∨ R)
a) (¬P ∨ Q) ∧ (¬P ∨ R)
b) ¬P ∨ Q ∨ R
c) P ∧ (Q ∨ R)
d) (P → Q) ∨ (P → R)

## Question 4 (5 points)
Minimize: (A ∧ B) ∨ (A ∧ ¬B)
a) A
b) B
c) A ∨ B
d) A ∧ B

## Question 5 (6 points)
For the truth table below, write the minimal DNF:

| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | 1 |
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 1 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 |
| 1 | 1 | 1 | 1 |

## Question 6 (6 points)
Design a Boolean function for: "Output is 1 if exactly two of three inputs A, B, C are 1"
Express in minimal form.`
  },
  4: {
    title: "Week 4 Practice Quiz: Predicate Logic",
    content: `# Week 4 Practice Quiz: Predicate Logic

**Practice Quantifiers and Translation**

## Question 1 (3 points)
∀x P(x) means:
a) Some x has property P
b) All x have property P
c) No x has property P
d) x is a variable

## Question 2 (3 points)
∃x P(x) means:
a) All x have property P
b) Some x has property P
c) No x has property P
d) Exactly one x has property P

## Question 3 (4 points)
Translate: "All birds can fly"
Let B(x) = "x is a bird", F(x) = "x can fly"
a) ∀x (B(x) ∧ F(x))
b) ∀x (B(x) → F(x))
c) ∃x (B(x) → F(x))
d) ∀x (F(x) → B(x))

## Question 4 (4 points)
What's the negation of ∀x P(x)?
a) ∀x ¬P(x)
b) ∃x ¬P(x)
c) ¬∃x P(x)
d) ∃x P(x)

## Question 5 (5 points)
Translate: "Someone loves everyone"
Let L(x,y) = "x loves y"
a) ∀x ∀y L(x,y)
b) ∃x ∀y L(x,y)
c) ∀x ∃y L(x,y)
d) ∃x ∃y L(x,y)

## Question 6 (5 points)
In ∀x ∃y (P(x,y) ∧ Q(x,z)), which variables are bound?
a) x only
b) y only
c) x and y
d) x, y, and z

## Question 7 (6 points)
Express: "There is exactly one person who is tall"
Let T(x) = "x is tall", P(x) = "x is a person"`
  },
  5: {
    title: "Week 5 Practice Quiz: Proofs and Inference",
    content: `# Week 5 Practice Quiz: Proofs and Inference

**Practice Proof Techniques**

## Question 1 (3 points)
Modus Ponens has the form:
a) P → Q, ¬Q ⊢ ¬P
b) P → Q, P ⊢ Q
c) P ∨ Q, ¬P ⊢ Q
d) P, Q ⊢ P ∧ Q

## Question 2 (3 points)
Modus Tollens has the form:
a) P → Q, ¬Q ⊢ ¬P
b) P → Q, P ⊢ Q
c) P ∨ Q, ¬P ⊢ Q
d) P → Q, Q ⊢ P

## Question 3 (4 points)
Which rule allows: ∀x P(x) ⊢ P(a)?
a) Universal Generalization
b) Universal Instantiation
c) Existential Generalization
d) Existential Instantiation

## Question 4 (5 points)
Construct a proof for: P → Q, Q → R, P ⊢ R
Show the main steps.

## Question 5 (5 points)
What type of proof would you use for: ⊢ P ∨ ¬P?
a) Direct proof
b) Conditional proof
c) Proof by contradiction
d) Proof by cases

## Question 6 (5 points)
In natural deduction, to prove P → Q, you typically:
a) Assume P and derive Q
b) Assume Q and derive P
c) Assume ¬Q and derive ¬P
d) Prove P ∨ Q

## Question 7 (5 points)
Complete this proof:
1. P ∨ Q     (Premise)
2. ¬P        (Premise)
3. ?         (Rule?)
What goes in step 3?`
  },
  6: {
    title: "Week 6 Practice Quiz: Advanced Topics",
    content: `# Week 6 Practice Quiz: Advanced Topics

**Final Review and Applications**

## Question 1 (4 points)
In modal logic, □P means:
a) P is possibly true
b) P is necessarily true
c) P is false
d) P is a contradiction

## Question 2 (4 points)
In three-valued logic with values {T, F, U}, what is T ∧ U?
a) T
b) F
c) U
d) Undefined

## Question 3 (4 points)
The SAT problem asks:
a) Is a formula a tautology?
b) Is a formula satisfiable?
c) Is a formula a contradiction?
d) Is a formula in CNF?

## Question 4 (4 points)
Resolution is used for:
a) Proving theorems
b) Boolean minimization
c) Truth table construction
d) Modal reasoning

## Question 5 (5 points)
In Prolog, the rule "grandfather(X,Z) :- father(X,Y), parent(Y,Z)" means:
a) X is grandfather of Z if X is father of Y and Y is parent of Z
b) All grandfathers are fathers
c) X, Y, Z are variables
d) Grandfather implies father

## Question 6 (5 points)
Which logic rejects the law of excluded middle?
a) Classical logic
b) Modal logic
c) Intuitionistic logic
d) Fuzzy logic

## Question 7 (4 points)
Boolean algebra is applied in:
a) Digital circuits
b) Database queries
c) Search algorithms
d) All of the above

## Question 8 (5 points)
Translate: "Every student who studies logic loves puzzles"
Use S(x) = "x is a student", G(x) = "x studies logic", L(x) = "x loves puzzles"

## Question 9 (6 points)
Prove or disprove: ∀x (P(x) → Q(x)), ∃x P(x) ⊢ ∃x Q(x)
Show your reasoning.

## Question 10 (8 points)
Design a complete proof system for the following argument:
1. All mammals are warm-blooded
2. All whales are mammals  
3. Shamu is a whale
4. Therefore, Shamu is warm-blooded

Use predicate logic with appropriate domain and predicates.`
  },
  7: {
    title: "Week 7 Practice Quiz: Extended Applications",
    content: `# Week 7 Practice Quiz: Extended Applications

**Advanced Logic Applications and Review**

## Question 1 (3 points)
In temporal logic, ◊P means:
a) P is always true
b) P is eventually true  
c) P is never true
d) P is currently true

## Question 2 (4 points)
Which of these is a well-formed formula in first-order logic?
a) ∀x ∃y (P(x,y) ∧ ∀z Q(z))
b) ∀x (P(x) → ∃y R(x,y))
c) ∃x ∀y (P(x) ∧ Q(y) → R(x,y))
d) All of the above

## Question 3 (5 points)
In a logic programming language, what does the following represent?
"parent(tom, bob). parent(bob, pat). grandparent(X,Z) :- parent(X,Y), parent(Y,Z)."

## Question 4 (5 points)
Express in symbolic logic: "There is someone who is older than everyone else"
Let O(x,y) = "x is older than y", P(x) = "x is a person"

## Question 5 (6 points)
Construct a resolution proof for: {P ∨ Q, ¬P ∨ R, ¬Q ∨ R} ⊢ R

## Question 6 (7 points)
Design a logic circuit that implements: (A ∧ B) ∨ (¬A ∧ C) ∨ (B ∧ C)
Minimize the expression and draw the circuit.`
  },
  8: {
    title: "Week 8 Practice Quiz: Comprehensive Review",
    content: `# Week 8 Practice Quiz: Comprehensive Review

**Final Preparation and Mastery Check**

## Question 1 (3 points)
The principle of bivalence states that:
a) Every proposition has exactly two truth values
b) Every proposition is either true or false
c) Logic has only two operators
d) There are two types of reasoning

## Question 2 (4 points)
In second-order logic, ∀P ∃x P(x) means:
a) For every property P, there exists an x that has P
b) For every x, there exists a property P
c) Properties and individuals are equivalent
d) Second-order quantification is undefined

## Question 3 (5 points)
Gödel's incompleteness theorem tells us that:
a) All logical systems are complete
b) Some logical systems contain undecidable propositions
c) Mathematics is inconsistent
d) Logic cannot be formalized

## Question 4 (5 points)
In fuzzy logic, if A = 0.7 and B = 0.3, what is A ∧ B using min operator?
a) 0.21
b) 0.3
c) 0.7
d) 1.0

## Question 5 (6 points)
Translate: "No student passes without studying"
Let S(x) = "x is a student", P(x) = "x passes", T(x) = "x studies"

## Question 6 (7 points)
Prove using natural deduction: (P → Q) → ((Q → R) → (P → R))

## Question 7 (8 points)
A knowledge base contains:
1. bird(X) → flies(X) ∨ penguin(X)
2. penguin(X) → ¬flies(X)  
3. bird(tweety)
4. penguin(opus)

What can be concluded about flies(tweety) and flies(opus)?

## Question 8 (12 points)
Complete logic system design:
You're designing a smart building system. The system should:
- Turn on lights if motion detected AND (dark outside OR manual override)
- Activate security if door opened AND system armed AND NOT (valid keycard)
- Sound alarm if security activated OR smoke detected
- Emergency mode overrides all other settings

Express each rule in symbolic logic, create truth tables for critical combinations, and design the minimal Boolean circuits.`
  }
};

export const presetPracticeTests = {
  1: {
    title: "Week 1-2 Practice Midterm: Foundations",
    content: `# Practice Midterm Exam: Weeks 1-2

**Time:** 50 minutes | **Points:** 100 | **Practice Mode**

## Section A: Multiple Choice (30 points)

### Question 1 (3 points)
Which of these is a proposition?
a) "How are you?"
b) "Close the window!"
c) "The Earth is round"
d) "x + 5 = 10"

### Question 2 (3 points)
The conditional P → Q is false only when:
a) P is true and Q is true
b) P is true and Q is false
c) P is false and Q is true  
d) P is false and Q is false

### Question 3 (3 points)
Which formula is a tautology?
a) P ∧ ¬P
b) P ∨ ¬P
c) P → ¬P
d) P ↔ ¬P

### Question 4 (3 points)
De Morgan's Law states that ¬(P ∧ Q) is equivalent to:
a) ¬P ∧ ¬Q
b) ¬P ∨ ¬Q
c) P ∨ Q
d) P ∧ Q

### Question 5 (3 points)
The precedence order for logical operators (highest to lowest) is:
a) ¬, ∧, ∨, →, ↔
b) →, ↔, ¬, ∧, ∨
c) ∧, ∨, ¬, →, ↔
d) ¬, ∨, ∧, →, ↔

## Section B: Truth Tables (25 points)

### Question 6 (15 points)
Construct a complete truth table for: (P → Q) ∧ (¬Q → ¬P)

Show all intermediate columns and determine if this is a tautology, contradiction, or contingency.

### Question 7 (10 points)
Prove using truth tables that P → Q ≡ ¬P ∨ Q

## Section C: Translation (20 points)

### Question 8 (10 points)
Translate these English statements using P: "It's sunny", Q: "It's warm", R: "We go to beach":

a) "If it's sunny and warm, we go to the beach"
b) "We go to the beach only if it's sunny"
c) "It's not the case that it's sunny but not warm"

### Question 9 (10 points)
Express in English using the same variables:
a) (P ∧ Q) → R
b) R → (P ∨ Q)  
c) ¬R ↔ (¬P ∨ ¬Q)

## Section D: Applied Logic (25 points)

### Question 10 (15 points)
A security system has these rules:
1. Alarm sounds if motion detected AND system is armed
2. Lights activate if alarm sounds OR manual override is pressed
3. System arms only if all doors are locked AND all windows are closed

Using variables M (motion), A (armed), D (doors locked), W (windows closed), L (lights), O (override), S (alarm sounds):

a) Express each rule in symbolic logic
b) If motion is detected, system is armed, but override is not pressed, what can we conclude?
c) Under what conditions do the lights NOT activate?

### Question 10 (10 points)
Design a truth table for a 3-input majority function that outputs 1 if and only if at least 2 of the 3 inputs are 1. Then write the Boolean expression in minimal form.

**Good luck! Remember to show all work and explain your reasoning.**`
  },
  3: {
    title: "Week 3-4 Practice Test: Boolean Algebra and Predicates",
    content: `# Practice Test: Boolean Algebra and Predicate Logic

**Practice Mode - Comprehensive Review**

## Part I: Boolean Algebra (50 points)

### Problem 1 (15 points)
Simplify using Boolean algebra laws. Show each step:
a) (A ∧ B) ∨ (A ∧ ¬B) ∨ (¬A ∧ B)
b) ¬((P ∧ Q) ∨ (¬P ∧ ¬Q))
c) (X → Y) ∧ (X → ¬Y) where X and Y are Boolean expressions

### Problem 2 (15 points)
Convert to both CNF and DNF:
a) P → (Q ∧ R)
b) (P ∨ Q) ↔ R
c) ¬(P ∨ (Q ∧ ¬R))

### Problem 3 (20 points)
Design a Boolean circuit for a car alarm system:
- Alarm sounds if: (Door opened OR Window broken) AND (System armed) AND NOT (Valid key used)
- Express as Boolean function
- Draw circuit diagram
- Minimize the expression
- Create truth table for all input combinations

## Part II: Predicate Logic (50 points)

### Problem 4 (20 points)
Translate to predicate logic using appropriate quantifiers:

a) "All students who study hard pass the exam"
b) "Some teachers know every subject"
c) "No one can please everyone"
d) "There exists a book that everyone has read"
e) "If anyone calls, take a message"

### Problem 5 (15 points)
Determine the truth value in domain {1, 2, 3, 4}:
- Even(x): x is even
- Prime(x): x is prime
- Greater(x,y): x > y

a) ∀x Even(x)
b) ∃x (Even(x) ∧ Prime(x))
c) ∀x ∃y Greater(x,y)
d) ∃x ∀y Greater(x,y)

### Problem 6 (15 points)
Find the negation and express in English:
a) ∀x (Student(x) → ∃y (Book(y) ∧ Read(x,y)))
b) ∃x (Teacher(x) ∧ ∀y (Student(y) → Likes(y,x)))
c) ∀x ∀y ((Parent(x,y) ∧ Male(x)) → Father(x,y))

**Answer all questions completely. Show logical reasoning steps.**`
  },
  6: {
    title: "Practice Final Exam: Comprehensive Logic Review",
    content: `# Practice Final Exam: Symbolic Logic Course

**Time: 2 hours | Points: 200 | Practice Mode - No Time Limit**

## Section I: Propositional Logic (40 points)

### Problem 1 (10 points)
Construct truth tables and classify each as tautology, contradiction, or contingency:
a) ((P → Q) ∧ P) → Q
b) (P ∧ Q) ∧ ¬(P ∨ Q)
c) (P ↔ Q) → ((P → Q) ∧ (Q → P))

### Problem 2 (15 points)
Prove equivalences using truth tables:
a) ¬(P → Q) ≡ P ∧ ¬Q
b) (P → Q) ∧ (Q → R) ≡ (P → R) ∨ ¬(P ∧ Q ∧ ¬R)

### Problem 3 (15 points)
Real-world application: Design logic for a smart home system with these requirements:
- Lights turn on if: Motion detected AND (Dark outside OR Manual override)
- Heat turns on if: Temperature < 68°F AND (Occupied OR Schedule active)
- Security arms if: All doors locked AND All windows closed AND No motion for 10 minutes

Express in symbolic logic and analyze for conflicts.

## Section II: Boolean Algebra (35 points)

### Problem 4 (20 points)
Minimize using algebraic methods:
a) AB'C + ABC + A'BC + AB'C' + A'B'C
b) (A + B)(A' + C)(B + C)
c) ((A ⊕ B) ∧ C) ∨ (A ∧ B ∧ ¬C)

### Problem 5 (15 points)
Circuit design: Create a 4-bit parity checker that outputs 1 if an even number of inputs are 1.
- Write Boolean expression
- Minimize using K-maps
- Draw circuit diagram

## Section III: Predicate Logic (40 points)

### Problem 6 (20 points)
Complex translations:
a) "Every student has read some book that every professor has recommended"
b) "There is exactly one person who is loved by everyone"
c) "No two people have all the same friends"
d) "If someone teaches a course, then all students in that course have that person as an instructor"

### Problem 7 (20 points)
Quantifier manipulation:
a) Express "All birds except penguins can fly" using only universal quantifiers
b) Prove: ∀x (P(x) → Q(x)) ≡ ¬∃x (P(x) ∧ ¬Q(x))
c) Find prenex normal form: ∀x P(x) → (∃y Q(y) ∧ ∀z R(z))

## Section IV: Proofs and Inference (40 points)

### Problem 8 (25 points)
Construct formal proofs:
a) {P → (Q ∧ R), P, ¬R} ⊢ ⊥ (contradiction)
b) {∀x (P(x) → Q(x)), ∃x P(x)} ⊢ ∃x Q(x)
c) ⊢ ((P → Q) ∧ (Q → R)) → (P → R)

### Problem 9 (15 points)
Resolution theorem proving:
Convert to CNF and use resolution to prove:
From: {P ∨ Q, ¬P ∨ R, ¬Q ∨ S, ¬R ∨ ¬S}
Prove: ⊥ (unsatisfiable)

## Section V: Advanced Topics (25 points)

### Problem 10 (15 points)
Modal logic applications:
a) Express "If it's necessarily true that P, then P is actually true"
b) Distinguish: "It's possible that everyone is happy" vs "Everyone can possibly be happy"
c) Analyze: □(P → Q) vs (□P → □Q)

### Problem 11 (10 points)
Applications:
a) Write Prolog rules for family relationships
b) Design 3-valued logic for database NULL handling
c) Explain resolution's role in automated theorem proving

## Section VI: Synthesis (20 points)

### Problem 12 (20 points)
Comprehensive problem: Design a formal logical system for a university course registration system:

1. Express constraints in predicate logic:
   - Students can only register for courses if they meet prerequisites
   - Each course has a maximum enrollment
   - Students cannot register for conflicting time slots
   - Certain courses are restricted to specific majors

2. Identify potential logical inconsistencies

3. Propose resolution strategies using the logical principles learned

**End of Exam. Check all work and show complete reasoning for full credit.**`
  }
};

export const presetPracticeExams = {
  midterm: presetPracticeTests[1],
  final: presetPracticeTests[6]
};