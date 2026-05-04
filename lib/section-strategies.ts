export interface StrategyRule {
  title: string;
  content: string;
  examples?: string[];
}

export interface SectionStrategy {
  section: "English" | "Math" | "Reading";
  overview: string;
  rules: StrategyRule[];
  tips: string[];
  resources: { name: string; url?: string }[];
}

export const SECTION_STRATEGIES: readonly SectionStrategy[] = [
  // ─── ENGLISH ───────────────────────────────────────────────
  {
    section: "English",
    overview:
      "English is the most learnable section on the ACT. It tests a finite set of grammar rules that repeat on every test. Going from 19 to 24 means getting roughly 6 more questions right out of 50. Two categories: Usage & Mechanics (~60%) and Rhetorical Skills (~40%).",
    rules: [
      {
        title: "1. Commas — the #1 most tested concept",
        content:
          "Use commas after introductory phrases, around nonessential info, in lists, and between two independent clauses joined by a conjunction. Do NOT use commas between subject and verb, before or after \"that\", or between a verb and its object. When in doubt, remove the comma — the ACT punishes unnecessary commas more than missing ones.",
        examples: [
          'After the game, we went home.',
          'My brother, who lives in Tampa, is visiting.',
          'Red, white, and blue.',
          'I ran, and she walked.',
        ],
      },
      {
        title: "2. Apostrophes",
        content:
          "Possessive singular: dog's bone. Possessive plural: dogs' bones. it's = it is; its = possessive. Never use apostrophes for plurals.",
        examples: [
          "The dog's bone (singular possessive)",
          "The dogs' bones (plural possessive)",
          "It's raining (it is). The cat licked its paw (possessive).",
        ],
      },
      {
        title: "3. Subject-Verb Agreement",
        content:
          "Ignore everything between the subject and verb. The ACT hides the real subject behind prepositional phrases.",
        examples: [
          "The box of chocolates is on the table. (box is, not chocolates are)",
          "Each of the students has a book. (each has)",
          "Neither the teacher nor the students were ready. (closest noun = plural)",
        ],
      },
      {
        title: "4. Pronoun Errors",
        content:
          "Three types: Agreement (everyone → his or her, not their), Ambiguity (unclear who a pronoun refers to), and Case (between you and me, not I; she and I went, not her and me).",
        examples: [
          "Everyone should bring his or her lunch.",
          'When John met Bob, he was nervous — who is "he"? The ACT wants clarity.',
          "Between you and me (not I).",
        ],
      },
      {
        title: "5. Run-Ons, Fragments, and Semicolons",
        content:
          'Run-on (comma splice): fix with a period, semicolon, or ", and". Fragment: not a complete sentence — needs to attach to an independent clause. Semicolons connect two COMPLETE sentences; if either side can\'t stand alone, the semicolon is wrong.',
        examples: [
          'Run-on: "I went to the store, I bought milk." → Fix: "I went to the store; I bought milk."',
          'Fragment: "Because she was tired." → Attach to an independent clause.',
        ],
      },
      {
        title: "6. Parallelism",
        content:
          "Items in a list or comparison must match in form.",
        examples: [
          "✅ She likes running, swimming, and biking.",
          "❌ She likes running, swimming, and to bike.",
          "✅ The cost in Miami is higher than that in Jacksonville.",
        ],
      },
      {
        title: "7. Modifier Placement",
        content:
          "The modifier must be next to what it modifies. If a sentence starts with a descriptive phrase followed by a comma, the very next word must be the person or thing being described.",
        examples: [
          "❌ Walking down the street, the building caught my eye. (The building isn't walking.)",
          "✅ Walking down the street, I noticed the building.",
        ],
      },
      {
        title: "8. Wordiness & Redundancy",
        content:
          "The shortest grammatically correct answer is almost always right. The ACT loves testing whether you can spot unnecessary words.",
        examples: [
          '"She is a person who is very talented" → "She is talented"',
          '"In the event that" → "If"',
          '"At this point in time" → "Now"',
          '"The reason is because" → "The reason is that"',
        ],
      },
      // Rhetorical Skills
      {
        title: "Rhetorical: Transitions",
        content:
          "Read the sentence BEFORE and AFTER the blank. The relationship determines the transition. Contrast: however, nevertheless, yet. Continuation: furthermore, moreover, similarly. Cause/Effect: therefore, consequently, thus. The trap: picking a transition that sounds sophisticated but doesn't match the logical relationship.",
      },
      {
        title: "Rhetorical: Add/Delete Questions",
        content:
          'When asked "Should the writer add this sentence?" — check if it supports the paragraph\'s main point (add) or is off-topic/redundant (delete). Read the reasoning in each answer choice — the ACT often has the right yes/no but wrong reason.',
      },
      {
        title: "Rhetorical: Sentence Ordering",
        content:
          'Look for chronological clues, transition words, and pronoun references. A sentence with "this idea" must come after the idea is introduced.',
      },
    ],
    tips: [
      "Grammar questions are faster — do them first.",
      "When stuck between two answers, pick the shorter one.",
      "Trust your ear, but verify with the rules.",
      "The shortest grammatically correct answer is almost always right.",
      "When in doubt about a comma, remove it.",
    ],
    resources: [
      {
        name: "Khan Academy Grammar",
        url: "https://www.khanacademy.org/humanities/grammar",
      },
      { name: "SupertutorTV — ACT English comma rules (YouTube)" },
      { name: "SupertutorTV — ACT English concision (YouTube)" },
      {
        name: "The Organic Chemistry Tutor — ACT English run-on sentences (YouTube)",
      },
    ],
  },

  // ─── MATH ──────────────────────────────────────────────────
  {
    section: "Math",
    overview:
      "ACT Math goes from easy to hard. Questions 1–20 are straightforward, 21–35 are medium, 36–45 are hard. A score of 24 lives almost entirely in the first 30 questions. Going from 18 to 24 means getting about 7–9 more right answers. You do NOT need to master the hard stuff. Trigonometry is deprioritized — guess the 2–3 trig questions and focus your time on pre-algebra, algebra, and test strategies (backsolving, picking numbers, Desmos).",
    rules: [
      // Anti-Anxiety & Test Strategies
      {
        title: "Anti-Anxiety Scaffolding",
        content:
          "Every math session starts with 5 confidence-builder problems — easy wins from topics you already know. This isn't wasted time; it's warm-up that gets your brain in math mode and proves you CAN do this. Confusion on harder problems is normal and expected. If you hit a wall, switch to untimed practice. Speed comes after accuracy. You're not bad at math — you're building math muscles.",
      },
      {
        title: "Desmos Graphing Calculator",
        content:
          "The Enhanced ACT 2026 has a built-in Desmos calculator. Learn to use it — it can solve problems visually that are hard to solve algebraically. Graph both sides of an equation and find the intersection. Plug in answer choices by graphing y = (expression) and checking which x-value matches. Use sliders to test different values. For systems of equations, graph both lines and read the intersection point.",
        examples: [
          "Solve 2x + 3 = 11: Graph y = 2x + 3 and y = 11, find intersection at x = 4",
          "Which value of x satisfies x² - 5x + 6 = 0? Graph y = x² - 5x + 6, find where it crosses y = 0",
          "Systems: Graph y = 2x + 1 and y = -x + 7, intersection is the solution",
        ],
      },
      {
        title: "Backsolving & Picking Numbers",
        content:
          "Two test strategies that earn points without learning new math. Backsolving: plug each answer choice back into the problem. Start with choice B or C (middle values). If the result is too big, try A; too small, try D. Picking numbers: when answer choices have variables, substitute simple values (x = 2, x = 3) into the problem, solve, then check which answer choice gives the same result. These techniques work on 30–40% of ACT math questions.",
        examples: [
          "Backsolving: 'If 3x - 7 = 14, what is x?' Try B (x=7): 3(7)-7 = 14 ✓",
          "Picking numbers: 'Which equals 2(x+3)?' Let x=2: 2(2+3) = 10. Check choices for 10.",
          "Picking numbers: 'If a shirt costs d dollars after 20% off, original price?' Let d=80: original = 80/0.8 = 100. Check choices.",
        ],
      },
      // Tier 1
      {
        title: "Tier 1: Fractions & Decimals",
        content:
          "Adding, subtracting, multiplying, dividing fractions. Converting between fractions, decimals, and percentages. These are easy points that show up on every test.",
      },
      {
        title: "Tier 1: Percentages",
        content:
          "What is 30% of 80? → 0.30 × 80 = 24. \"15 is what percent of 60?\" → 15/60 = 0.25 = 25%. Percent increase/decrease: (new − old) / old × 100.",
      },
      {
        title: "Tier 1: Ratios & Proportions",
        content:
          "Cross-multiplication: if a/b = c/d, then ad = bc.",
        examples: [
          "If 3 apples cost $2, how much do 12 apples cost? → 3/2 = 12/x → x = 8",
        ],
      },
      {
        title: "Tier 1: Linear Equations",
        content:
          "Solve for x: 2x + 5 = 13 → x = 4. Slope-intercept form: y = mx + b (m = slope, b = y-intercept). Word problems that translate to equations.",
      },
      {
        title: "Tier 1: Inequalities",
        content:
          "Same as equations, but flip the sign when multiplying or dividing by a negative.",
      },
      {
        title: "Tier 1: Mean, Median, Mode",
        content:
          "Mean = sum / count. Median = middle value when sorted. Mode = most frequent value.",
      },
      {
        title: "Tier 1: Basic Probability",
        content:
          "P(event) = favorable outcomes / total outcomes.",
      },
      // Tier 2
      {
        title: "Tier 2: Systems of Equations",
        content:
          "Substitution: solve one equation for a variable, plug into the other. Elimination: add/subtract equations to cancel a variable.",
      },
      {
        title: "Tier 2: Quadratics",
        content:
          "FOIL: (x+2)(x+3) = x² + 5x + 6. Factoring: x² + 5x + 6 = (x+2)(x+3). Quadratic formula: x = (−b ± √(b²−4ac)) / 2a — write this on scratch paper at the start of the test.",
      },
      {
        title: "Tier 2: Geometry Formulas",
        content:
          "Rectangle: Area = l × w, Perimeter = 2l + 2w. Triangle: Area = ½ × b × h. Circle: Area = πr², Circumference = 2πr. Pythagorean theorem: a² + b² = c².",
      },
      {
        title: "Tier 2: Coordinate Geometry",
        content:
          "Slope: (y₂ − y₁) / (x₂ − x₁). Midpoint: ((x₁+x₂)/2, (y₁+y₂)/2). Distance: √((x₂−x₁)² + (y₂−y₁)²).",
      },
      {
        title: "Tier 2: Exponent Rules",
        content:
          "x^a × x^b = x^(a+b). (x^a)^b = x^(ab). x^0 = 1. x^(−a) = 1/x^a.",
      },
      // Tier 3
      {
        title: "Tier 3: Trigonometry (2–3 questions)",
        content:
          "SOH-CAH-TOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent. If a trig question goes beyond this, guess and move on.",
      },
      {
        title: "Tier 3: Advanced Topics",
        content:
          "Matrices, logs, complex numbers, sequences — guess the same letter on all of these. Don't spend time here.",
      },
    ],
    tips: [
      "Work front to back, but skip after 90 seconds. Circle it, come back if time allows.",
      "Plug in answer choices. Start with B or C (middle values).",
      "Plug in numbers for variables. When answers have variables, pick x = 2 or x = 3, solve, and see which answer matches.",
      "Draw pictures for geometry. If no figure is given, sketch one. Label everything.",
      "Use the calculator for arithmetic, not for thinking. Most questions are faster by hand.",
      "Answer every question. No penalty. On hard questions, always guess the same letter.",
      "Do questions 1–30 carefully and accurately. That's where the 24 lives.",
      "Guess strategically on the last 5–10 if needed.",
      "Use the Desmos graphing calculator to check answers visually — graph both sides and find the intersection.",
      "Start each session with 5 confidence-builder problems to warm up and manage anxiety.",
    ],
    resources: [
      { name: "Khan Academy Pre-Algebra", url: "https://www.khanacademy.org/math/pre-algebra" },
      { name: "Khan Academy Algebra Basics" },
      { name: "Khan Academy Geometry" },
      { name: "Khan Academy Statistics & Probability" },
      {
        name: "The Organic Chemistry Tutor — ACT Math (YouTube)",
      },
      { name: "Acely ACT Desmos Guide", url: "https://acely.com/act-prep/act-desmos-calculator" },
      { name: "Desmos Graphing Calculator", url: "https://www.desmos.com/calculator" },
    ],
  },

  // ─── READING ───────────────────────────────────────────────
  {
    section: "Reading",
    overview:
      "You're already strong here (25). A 25 means ~27 out of 36 correct. To hit 27, you need ~29–30 correct — just 2–3 more right answers. This is about eliminating careless mistakes, not learning new skills. 4 passages, ~650–750 words each, 9 questions per passage.",
    rules: [
      {
        title: "Main Idea / Purpose (2–3 per passage)",
        content:
          "Look at the first and last paragraph. The answer is broad, not specific.",
      },
      {
        title: "Detail / Evidence (3–4 per passage)",
        content:
          "The answer is literally in the text. Go back and find it. Don't rely on memory.",
      },
      {
        title: "Inference (2–3 per passage)",
        content:
          "Must be supported by text. ACT inferences are conservative — the answer should feel almost obvious from the passage.",
      },
      {
        title: "Vocab in Context (1–2 per passage)",
        content:
          "Plug each choice into the sentence. Usually NOT the common definition of the word.",
      },
      {
        title: "Author's Tone (~1 per passage)",
        content:
          "Look for loaded words. Extreme answers are almost always wrong.",
      },
      // Wrong answer patterns
      {
        title: 'Wrong Answer Pattern: "Too Extreme"',
        content:
          'Passage says "some scientists believe" → wrong answer says "all scientists agree." Watch for absolute language.',
      },
      {
        title: 'Wrong Answer Pattern: "Opposite"',
        content:
          "Character is nervous → wrong answer says confident. Read carefully.",
      },
      {
        title: 'Wrong Answer Pattern: "True But Not in the Passage"',
        content:
          "The fact might be true in real life, but it's not stated in the text. Stick to what's written.",
      },
      {
        title: 'Wrong Answer Pattern: "Right Passage, Wrong Question"',
        content:
          "The detail exists in the passage but doesn't answer what was asked.",
      },
      {
        title: 'Wrong Answer Pattern: "Half Right"',
        content:
          "First part of the answer is correct, second part is wrong. Read the WHOLE answer choice.",
      },
    ],
    tips: [
      "Read questions first (just the stems, not answer choices).",
      "Read the passage with those questions in mind.",
      "Answer questions by going back to the text for evidence on every single one.",
      "Start with the most comfortable passage type — don't go in order.",
      'When between two answers, ask: "Can I point to a specific line that supports this?" If not, it\'s wrong.',
      "You're strong here — light touch. Don't over-invest. The ROI is in English and Math.",
    ],
    resources: [
      {
        name: "Free Enhanced ACT Practice Test",
        url: "https://www.act.org/content/act/en/products-and-services/the-act/test-preparation.html",
      },
      { name: "Old prep book — reading passages for comprehension practice" },
      { name: "Albert.io free tier — ACT-specific practice questions" },
    ],
  },
] as const;


export function getStrategyForSection(
  section: string,
): SectionStrategy | undefined {
  return SECTION_STRATEGIES.find((s) => s.section === section);
}
