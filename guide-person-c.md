# 🧭 COMPASS — Person C: Student Experience & Quiz Interface

## Your Feature
You own everything the student touches: the quiz interface, student dashboard, chat, and student override flow.

## Tech Stack
- React + Tailwind CSS (use Cursor to generate fast)
- Axios or fetch for API calls
- Recharts for velocity charts
- React Router for page navigation

---

## STEP 0: Project Setup (Hour 0-1)

```bash
npx create-react-app compass-frontend
cd compass-frontend
npm install axios react-router-dom recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind in `tailwind.config.js`:
```js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Folder structure:
```
src/
├── App.jsx              # Router setup
├── api/
│   └── client.js        # API helper functions
├── components/
│   ├── quiz/
│   │   ├── QuizInterface.jsx    # Question display + answer input
│   │   └── QuestionCard.jsx     # Individual question component
│   ├── dashboard/
│   │   ├── StudentDashboard.jsx # Main student view
│   │   ├── RecommendationPanel.jsx  # From Person A's agents
│   │   ├── VelocityChart.jsx    # Learning velocity over time
│   │   └── MasteryOverview.jsx  # Summary cards
│   ├── chat/
│   │   └── StudentChat.jsx      # Chat with AI about learning
│   └── shared/
│       ├── ConfidenceBadge.jsx  # High/Medium/Low badge
│       └── OverrideButton.jsx   # "I already know this" button
├── data/
│   └── questions.json   # Sample questions
├── hooks/
│   └── useStudent.js    # Custom hook for student state
└── pages/
    ├── QuizPage.jsx
    ├── DashboardPage.jsx
    └── LoginPage.jsx    # Simple student selector for demo
```

---

## STEP 1: Create Sample Questions (Hour 1-6)

This is your first deliverable. Create 30-50 O-Level A-Math questions. You can use Cursor/Claude to generate them — just make sure they're tagged correctly.

### src/data/questions.json
```json
[
  {
    "id": "alg_001",
    "topic": "algebraic_manipulation",
    "subtopic": "Factorisation",
    "difficulty": "easy",
    "question": "Factorise completely: 6x² + 11x - 10",
    "options": ["(2x + 5)(3x - 2)", "(2x - 5)(3x + 2)", "(6x + 5)(x - 2)", "(3x + 5)(2x - 2)"],
    "correct_answer": "(2x + 5)(3x - 2)",
    "hint": "Look for two numbers that multiply to give 6×(-10) = -60 and add to give 11"
  },
  {
    "id": "alg_002",
    "topic": "algebraic_manipulation",
    "subtopic": "Simplification",
    "difficulty": "medium",
    "question": "Simplify: (x² - 9)/(x² + 5x + 6)",
    "options": ["(x - 3)/(x + 2)", "(x + 3)/(x + 2)", "(x - 3)/(x - 2)", "(x + 3)/(x - 2)"],
    "correct_answer": "(x - 3)/(x + 2)",
    "hint": "Factorise both numerator and denominator first"
  },
  {
    "id": "quad_001",
    "topic": "quadratic_equations",
    "subtopic": "Quadratic formula",
    "difficulty": "medium",
    "question": "Solve 2x² - 5x - 3 = 0 using the quadratic formula",
    "options": ["x = 3 or x = -0.5", "x = -3 or x = 0.5", "x = 3 or x = 0.5", "x = -3 or x = -0.5"],
    "correct_answer": "x = 3 or x = -0.5",
    "hint": "a=2, b=-5, c=-3. Use x = (-b ± √(b²-4ac)) / 2a"
  },
  {
    "id": "quad_002",
    "topic": "quadratic_equations",
    "subtopic": "Discriminant",
    "difficulty": "medium",
    "question": "For what values of k does kx² + 6x + 1 = 0 have two distinct real roots?",
    "options": ["k < 9", "k > 9", "k < 9, k ≠ 0", "k > 0"],
    "correct_answer": "k < 9, k ≠ 0",
    "hint": "For two distinct real roots, b² - 4ac > 0 and a ≠ 0"
  },
  {
    "id": "trig_001",
    "topic": "trigonometric_functions",
    "subtopic": "Trig equations",
    "difficulty": "medium",
    "question": "Solve sin(x) = 0.5 for 0° ≤ x ≤ 360°",
    "options": ["30° and 150°", "30° and 210°", "30° and 330°", "150° and 210°"],
    "correct_answer": "30° and 150°",
    "hint": "sin is positive in the 1st and 2nd quadrants"
  },
  {
    "id": "trig_002",
    "topic": "trigonometric_identities",
    "subtopic": "Double angle formulae",
    "difficulty": "hard",
    "question": "If sin(A) = 3/5 and A is acute, find the exact value of sin(2A)",
    "options": ["24/25", "12/25", "7/25", "6/25"],
    "correct_answer": "24/25",
    "hint": "sin(2A) = 2sin(A)cos(A). Find cos(A) using sin²A + cos²A = 1"
  },
  {
    "id": "diff_001",
    "topic": "differentiation",
    "subtopic": "Power rule",
    "difficulty": "easy",
    "question": "Differentiate y = 3x⁴ - 2x² + 7x - 5",
    "options": ["12x³ - 4x + 7", "12x³ - 4x + 7x", "12x⁴ - 4x² + 7", "3x³ - 2x + 7"],
    "correct_answer": "12x³ - 4x + 7",
    "hint": "Bring the power down and reduce by 1: d/dx(xⁿ) = nxⁿ⁻¹"
  },
  {
    "id": "diff_002",
    "topic": "differentiation",
    "subtopic": "Chain rule",
    "difficulty": "hard",
    "question": "Differentiate y = (2x + 3)⁵",
    "options": ["10(2x + 3)⁴", "5(2x + 3)⁴", "10(2x + 3)⁵", "5(2x + 3)⁴ · 2x"],
    "correct_answer": "10(2x + 3)⁴",
    "hint": "Chain rule: d/dx[f(g(x))] = f'(g(x)) · g'(x). The inner derivative is 2."
  },
  {
    "id": "integ_001",
    "topic": "integration",
    "subtopic": "Definite integrals",
    "difficulty": "medium",
    "question": "Evaluate ∫₁³ (2x + 1) dx",
    "options": ["10", "12", "8", "14"],
    "correct_answer": "10",
    "hint": "Integrate to get x² + x, then substitute limits: [x² + x]₁³"
  },
  {
    "id": "integ_002",
    "topic": "integration",
    "subtopic": "Area under curve",
    "difficulty": "hard",
    "question": "Find the area enclosed between y = x² and y = 4",
    "options": ["32/3", "16/3", "8/3", "64/3"],
    "correct_answer": "32/3",
    "hint": "Find intersection points (x = ±2), then integrate (4 - x²) from -2 to 2"
  },
  {
    "id": "log_001",
    "topic": "indices_and_logarithms",
    "subtopic": "Laws of logarithms",
    "difficulty": "medium",
    "question": "Simplify: log₂(8) + log₂(4)",
    "options": ["5", "7", "12", "32"],
    "correct_answer": "5",
    "hint": "log₂(8) = 3, log₂(4) = 2, or use log(a) + log(b) = log(ab)"
  },
  {
    "id": "log_002",
    "topic": "indices_and_logarithms",
    "subtopic": "Solving exponential equations",
    "difficulty": "hard",
    "question": "Solve 3^(2x+1) = 27^x",
    "options": ["x = 1", "x = 3", "x = 1/2", "x = -1"],
    "correct_answer": "x = 1",
    "hint": "Write 27 as 3³, then equate powers: 2x + 1 = 3x"
  }
]
```

**IMPORTANT:** Generate at least 30 questions total across all topics using Cursor. Tell Cursor: "Generate 20 more O-Level Additional Mathematics MCQ questions in the same JSON format, covering: surds, polynomials, binomial theorem, coordinate geometry, applications of differentiation, kinematics, and linear law. Include topic, subtopic, difficulty (easy/medium/hard), 4 options, correct answer, and hint."

---

## STEP 2: Build the API Client (Hour 2-3)

### src/api/client.js
```javascript
const ENGINE_URL = 'http://localhost:8000';  // Person B's knowledge engine
const AGENT_URL = 'http://localhost:8001';   // Person A's agent pipeline

export const api = {
  // === Knowledge Engine (Person B) ===
  logInteraction: async (event) => {
    const res = await fetch(`${ENGINE_URL}/api/interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.json();
  },

  getKnowledgeMap: async (studentId) => {
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/knowledge-map`);
    if (!res.ok) return null;
    return res.json();
  },

  getVelocity: async (studentId) => {
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/velocity`);
    if (!res.ok) return {};
    return res.json();
  },

  getTopicGraph: async () => {
    const res = await fetch(`${ENGINE_URL}/api/topics/graph`);
    return res.json();
  },

  // === Agent Pipeline (Person A) ===
  getDiagnosis: async (knowledgeMap) => {
    const res = await fetch(`${AGENT_URL}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeMap),
    });
    return res.json();
  },
};
```

---

## STEP 3: Build the Quiz Interface (Hour 3-8)

Tell Cursor exactly this:

"Build a React component QuizInterface with these features:
1. Displays one math question at a time from a questions array prop
2. Shows the question text, 4 multiple choice options as clickable cards
3. Has a visible timer counting seconds since question appeared
4. When student clicks an option: highlight green if correct, red if incorrect, show the hint
5. After answering, show a 'Next Question' button
6. On each answer, call a callback prop onAnswer({ question_id, topic, subtopic, difficulty, student_answer, correct_answer, is_correct, time_taken_sec, timestamp })
7. Show progress: 'Question 3 of 10'
8. At the end, show a summary: X/Y correct, time taken, topic breakdown
9. Use Tailwind CSS, make it clean and modern with smooth transitions
10. The question text may contain math symbols — render them nicely"

Then build QuizPage.jsx that:
- Loads questions from questions.json
- Optionally filters by topic
- On each answer, POSTs the interaction to Person B's API
- After quiz completion, redirects to dashboard

---

## STEP 4: Build the Student Dashboard (Hour 8-16)

Tell Cursor:

"Build a StudentDashboard React component with this layout:
1. Top bar: Student name, overall mastery percentage, last active date
2. Left panel (60% width): Knowledge map area (placeholder div for Person B's graph component)
3. Right panel (40% width): 
   - 'What to Study Next' section showing recommendation cards
   - Each recommendation card has: topic name, action text, reasoning (expandable), priority badge (critical=red, high=orange, medium=blue), confidence badge (high=green, medium=yellow, low=red)
   - Each card has an 'I already know this' button (override)
4. Bottom section: Learning velocity chart (line chart showing mastery over time per topic)
5. Use Tailwind, clean modern design, subtle shadows and rounded corners"

### src/components/dashboard/MasteryOverview.jsx
Tell Cursor: "Build a MasteryOverview component that takes an array of topic masteries (topic name, mastery_score 0-1, velocity, attempt_count) and renders summary cards. Show overall mastery as a large percentage. Show top 3 strongest topics (green) and top 3 weakest topics (red). Show a mastery distribution bar."

### src/components/dashboard/VelocityChart.jsx
Tell Cursor: "Build a VelocityChart React component using Recharts. It takes velocity data per topic (array of {topic, velocity: 'improving'|'plateauing'|'regressing', mastery_change, data_points}). Render a horizontal bar chart where each bar represents a topic. Color: green for improving, gray for plateauing, red for regressing. Show the mastery change as +X% or -X%. Add labels on each bar."

### src/components/shared/ConfidenceBadge.jsx
```jsx
export default function ConfidenceBadge({ level }) {
  const styles = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${styles[level]}`}>
      {level === 'high' ? '🟢' : level === 'medium' ? '🟡' : '🔴'} {level} confidence
    </span>
  );
}
```

---

## STEP 5: Build the Recommendation Panel (Hour 16-20)

This displays Person A's agent output. 

### src/components/dashboard/RecommendationPanel.jsx
Tell Cursor: "Build a RecommendationPanel component that takes an agentOutput prop (with diagnosis, plan, evaluator_verdict, overall_confidence, reasoning_trail). Render:
1. A summary card at the top with the study_plan_summary and overall confidence badge
2. If evaluator_verdict.approved is false, show a yellow warning banner: 'AI flagged some concerns with this analysis'
3. A list of recommendation cards, each showing:
   - Priority badge (critical/high/medium/low with appropriate colors)
   - Topic name in bold
   - Action text
   - Expandable 'Why this recommendation?' section showing the reasoning
   - An 'I already revised this' override button
4. An expandable 'Full Reasoning Trail' section at the bottom showing the complete reasoning_trail text
5. Show the evaluator verdict: approved (green check) or flagged (yellow warning with concerns listed)
Use Tailwind, make it professional."

---

## STEP 6: Build the Override Flow (Hour 20-24)

### src/components/shared/OverrideButton.jsx
Tell Cursor: "Build an OverrideButton React component. When clicked, it shows a dropdown with these options:
- 'I already revised this topic offline'
- 'I think this recommendation is wrong'
- 'I want to focus on something else instead'
When an option is selected, call an onOverride callback with { recommendation_id, override_reason, timestamp }. After override, show a green checkmark with 'Noted — we'll adjust your recommendations'. The button should be subtle (outline style) and not dominate the card."

---

## STEP 7: Build the Chat Interface (Hour 20-26)

### src/components/chat/StudentChat.jsx
Tell Cursor: "Build a StudentChat React component — a chat interface where the student can ask questions about their learning. Features:
1. Chat message list with bubbles (student = right/blue, AI = left/gray)
2. Input field at bottom with send button
3. When student sends a message, POST to an endpoint that includes the student's knowledge map as context
4. AI responses should show a confidence badge
5. Typing indicator while waiting for response
6. Pre-populated suggestion chips: 'Why am I struggling with integration?', 'What should I study first?', 'Am I improving?'
7. Clean chat UI with Tailwind"

For the backend, Person A can add a simple chat endpoint, or you can call OpenAI directly:

```javascript
// Quick chat implementation using OpenAI directly
const getAIResponse = async (message, knowledgeMap) => {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a supportive AI learning companion for a student. You have access to their learning data. Be encouraging, specific, and honest about what they need to work on. Always explain your reasoning. Show confidence levels.
          
Student's knowledge map: ${JSON.stringify(knowledgeMap)}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.5,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
};
```

---

## STEP 8: Set Up Routing (Hour 2-3)

### src/App.jsx
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/quiz/:studentId" element={<QuizPage />} />
        <Route path="/dashboard/:studentId" element={<DashboardPage />} />
        <Route path="/teacher" element={<div>Teacher Dashboard (Person D)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
```

### src/pages/LoginPage.jsx (Demo student selector)
Tell Cursor: "Build a simple LoginPage that shows 3 student persona cards (Sarah, James, Aisha) with a brief description of each. Clicking a card navigates to /dashboard/{studentId}. Also include a 'Take a Quiz' button that goes to /quiz/{studentId}. This is for demo purposes only — no real auth needed."

---

## STEP 9: Integration (Hour 30-36)

1. Replace all mock data with live API calls to Person B's engine (port 8000)
2. Connect recommendation panel to Person A's agent output (port 8001)
3. Wire up quiz → POST interaction → dashboard updates
4. Test the full flow: answer questions → see knowledge map update → get recommendations

---

## STEP 10: Polish (Hour 36-42)

- Loading skeletons while APIs respond
- Error states ("Couldn't load recommendations — try again")
- Smooth animations on mastery score changes
- Mobile-responsive (judges might look at it on a phone)
- Make sure the demo flow is smooth for Person D's presentation

---

## CHECKLIST

- [ ] 30+ sample questions created and tagged
- [ ] Quiz interface working (displays question, captures answer + time, logs to API)
- [ ] Student dashboard layout with all panels
- [ ] Recommendation panel displaying agent output with reasoning trails
- [ ] Confidence badges on all AI outputs
- [ ] Learning velocity chart
- [ ] Override flow ("I already know this")
- [ ] Chat interface working
- [ ] Connected to Person B's knowledge engine
- [ ] Connected to Person A's agent pipeline
- [ ] Demo flow smooth and polished
