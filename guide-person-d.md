# 🧭 COMPASS — Person D: Teacher Experience & Presentation

## Your Feature
You own the teacher's world: class overview dashboard, per-student drilldown, the accept/modify/reject human-in-the-loop workflow, plus the entire pitch — deck, demo script, video, and submission.

## Tech Stack
- React + Tailwind CSS (same codebase as Person C)
- Recharts for class-level charts
- Google Slides / PowerPoint / Canva for pitch deck

---

## STEP 0: Setup (Hour 0-1)

You work inside the same React codebase as Person C. Coordinate on routing:

```
/                    → LoginPage (Person C)
/quiz/:studentId     → QuizPage (Person C)
/dashboard/:studentId → StudentDashboard (Person C)
/teacher             → TeacherDashboard (YOU)
/teacher/:studentId  → TeacherStudentDetail (YOU)
```

Your folder structure inside `src/`:
```
src/components/teacher/
├── TeacherDashboard.jsx      # Class overview
├── StudentRow.jsx            # Row in the class table
├── StudentDetail.jsx         # Per-student drilldown
├── RecommendationReview.jsx  # Accept/Modify/Reject UI
├── OverrideLog.jsx           # History of teacher overrides
└── ClassSummary.jsx          # Aggregate class stats
```

Also start your pitch deck outline NOW (Hour 0). Use Google Slides, Canva, or PowerPoint.

---

## STEP 1: Draft the Pitch Deck Outline (Hour 0-2)

Create the deck structure immediately. You'll fill in screenshots later.

### Slide Structure (8-10 slides, 5-minute pitch)

**Slide 1 — Title**
- "Compass 🧭 — An AI Learning Companion That Keeps the Human in the Driver's Seat"
- Team name, DLW 2026, Microsoft Track

**Slide 2 — The Problem (30 seconds)**
- Current tools tell students WHAT they got wrong, not WHY
- Teachers get grades, not insights
- AI systems are black boxes — no transparency, no teacher control
- When students take a break, the system pretends nothing changed

**Slide 3 — Our Solution (45 seconds)**
- Compass: AI that diagnoses learning gaps, traces them to root causes, and generates personalized plans — with full transparency and human control
- Three pillars: Error Intelligence, Radical Transparency, Human Agency

**Slide 4 — Architecture (45 seconds)**
- Show the 6-layer architecture diagram
- Highlight: Multi-agent pipeline, Maker-Checker pattern, Prerequisite Graph
- Tech stack: OpenAI GPT-4o, Python/FastAPI, React, NetworkX

**Slide 5 — Demo (2 minutes)**
- LIVE DEMO — scripted flow (see demo script below)

**Slide 6 — Responsible AI (45 seconds)**
- Not an afterthought — it's the architecture
- Explainability: reasoning chains visible to users
- Fairness: Evaluator Agent checks for bias
- Human Agency: teachers accept/modify/reject, students can challenge
- Privacy: minimal data, no PII in AI prompts
- Honesty: temporal decay — system never overstates what you know

**Slide 7 — What Makes Us Different (30 seconds)**
- Error classification (conceptual vs careless vs time-pressure)
- Prerequisite graph traces problems to foundational gaps
- Maker-Checker: AI audits itself before speaking
- Built by a practicing tutor with 3 years at SJI and ACSI

**Slide 8 — Real-World Applicability (30 seconds)**
- Subject-agnostic architecture (demo is A-Math, works for any subject with a topic graph)
- Scales from 1 teacher → school-wide
- Integrates with existing workflows

**Slide 9 — Team & Authenticity**

**Slide 10 — Thank You + Q&A**

---

## STEP 2: Build the Teacher Class Overview (Hour 2-8)

Tell Cursor:

"Build a TeacherDashboard React component with these features:
1. Header: 'Class Overview' with the class name (e.g., 'Sec 4A Additional Mathematics')
2. Summary cards row: Total students, Average mastery %, Students needing attention (mastery < 50%), Most common weak topic
3. A sortable table of all students with columns:
   - Student name
   - Overall mastery (colored progress bar: green ≥70%, yellow 40-70%, red <40%)
   - Weakest topic (name + mastery score)
   - Learning velocity (↑ improving / → plateauing / ↓ regressing icon)
   - Last active (relative time: '2 hours ago', '3 weeks ago')
   - AI recommendation status (pending review / approved / no action needed)
   - Click row to go to student detail
4. Sortable by: mastery (low→high to flag weak students), last active, velocity
5. Red alert banner at top if any student has mastery < 30% or inactive > 14 days
6. Clean professional design with Tailwind, subtle table stripes, hover effects"

---

## STEP 3: Build Per-Student Drilldown (Hour 8-14)

Tell Cursor:

"Build a StudentDetail component for the teacher view. It receives a studentId and fetches their knowledge map and agent diagnosis. Layout:
1. Header: student name, overall mastery, last active, velocity summary
2. Left panel (55%):
   - Knowledge map visualization (embed Person B's graph component)
   - Topic-by-topic mastery table: mastery score, velocity, attempts, last practiced
3. Right panel (45%):
   - AI Diagnosis card: diagnosis summary, error classifications (conceptual/careless/time-pressure), root cause analysis, confidence badge
   - Study Plan card: each recommendation with ACCEPT / MODIFY / REJECT buttons
   - Override History log
4. Bottom: Recent activity log (last 10 interactions)
Use Tailwind, professional teacher-facing design."

---

## STEP 4: Build Accept/Modify/Reject Flow (Hour 14-20)

This is YOUR key differentiator — the human-in-the-loop flow.

Tell Cursor:

"Build a RecommendationReview component that displays an AI recommendation card with three action buttons:

1. **ACCEPT** (green button): Teacher agrees. On click: green checkmark animation, log { action: 'accepted', recommendation_id, teacher_id, timestamp }, mark as 'teacher-approved'

2. **MODIFY** (blue button): Teacher adjusts. On click: show inline edit form — change topic, difficulty (dropdown), action text (textarea), add note. Save logs { action: 'modified', original, modified_to, teacher_note, timestamp }

3. **REJECT** (red outline button): Teacher disagrees. On click: dropdown with reasons — 'Student already revised this', 'Student focusing on other priorities', 'AI assessment seems inaccurate', 'Other (custom)'. Log { action: 'rejected', recommendation_id, reason, teacher_note, timestamp }

Show the AI's reasoning trail (expandable) and confidence badge alongside each recommendation. Show evaluator verdict — if AI flagged concerns, highlight that.

After any action, show toast: 'Override logged — your input helps improve future recommendations.'

Use Tailwind, clean accessible design."

---

## STEP 5: Build Override History Log (Hour 20-24)

Tell Cursor:

"Build an OverrideLog component showing a chronological list of all teacher and student overrides. Each entry shows: timestamp, who overrode (teacher/student), action (accepted/modified/rejected/student challenged), original recommendation, teacher's reason, type icon (✅/✏️/❌/🙋). Include filter: all / accepted / modified / rejected. Store in React state for demo."

---

## STEP 6: Design the 3 Demo Personas (Hour 18-24)

Write detailed narratives. Person B generates the data, you define the story.

### Sarah (sarah_001) — The Plateauing High-Achiever
```
Strong Sec 4 student, 75-85% most topics.
Integration and applications of differentiation: plateauing for 2 weeks.

AI detects: ~60% mastery, velocity PLATEAUING, error type TIME_PRESSURE
Root cause: NOT a prerequisite issue — differentiation is strong at 75%
AI recommends: Timed practice drills (build speed, not new concepts)
Teacher action: ACCEPTS — shows AI distinguishes "doesn't know it" from "too slow"
```

### James (james_001) — The Foundational Gap Student
```
Struggling across topics. 30-45% on trig identities and differentiation.

AI detects: trig identities 30% REGRESSING, algebraic manipulation 45% STABLE
Error type: CONCEPTUAL_GAP
Root cause: PREREQUISITE GAP — trig identities requires algebraic manipulation
AI recommends: Go BACK to algebraic manipulation first
Teacher action: ACCEPTS — killer demo moment, exactly what a real tutor would do
```

### Aisha (aisha_001) — The Returning Student
```
Was active 5 weeks ago at 65-75% mastery. Disappeared 3+ weeks. Just returned.

AI detects: ALL mastery decayed (40-55% now), velocity REGRESSING
AI recommends: Diagnostic quiz, confidence MEDIUM (decay is estimated)
Teacher action: MODIFIES — adds "Aisha was on family leave, may retain more 
than estimated. Start with gentle diagnostic."
Shows humans adding nuance AI can't.
```

---

## STEP 7: Script the Exact Demo Flow (Hour 30-36)

### Demo Script (2 minutes)

```
[Open Teacher Dashboard - Class Overview]

"I'm Mrs. Tan, teaching Sec 4 A-Math. Here's my class at a glance.
I can see 2 students need attention. Let me click James."

[Click James → Student Detail]
"James is at 30% on trig identities and it's getting worse. But look 
what Compass found..."

[Point to diagnosis panel]
"The AI traced this BACK to algebraic manipulation — a prerequisite 
topic also weak at 45%. This is the root cause."

[Point to prerequisite graph — red nodes connected]
"See the dependency chain. Compass recommends fixing the foundation first."

[Point to reasoning trail]
"Full reasoning trail — I can read exactly WHY. High confidence, 20+ 
data points. And validated by our Evaluator Agent."

[Click ACCEPT]
"I agree. Now let me show Aisha..."

[Navigate back → Click Aisha]
"Aisha was away 3 weeks. Compass honestly reduced her mastery — it 
doesn't pretend she still knows everything."

[Click MODIFY → Type note]
"I'll modify: she was on leave, may retain more. My input is logged.
The human is always in the driver's seat."

[Quick switch to Student View]
"Students see their own velocity, can ask the AI questions, and 
challenge recommendations they disagree with."

[End]
"Compass: every recommendation explained, every output audited, 
every human in control."
```

---

## STEP 8: Responsible AI Documentation (Hour 24-30)

Write this for both the pitch deck AND GitHub README:

**Explainability** — Full reasoning trails on every recommendation. Confidence levels explicit.

**Fairness** — Evaluator Agent checks for bias. Won't overreact to one bad session. Different learning paces are normal.

**Human Agency** — Teachers accept/modify/reject. Students can challenge. All overrides logged.

**Transparency** — Maker-Checker pattern audits before output. Modular architecture, clear agent roles.

**Privacy** — Minimal data. No PII in AI prompts. No third-party sharing.

**Reliability** — Temporal decay tracks knowledge honestly. Low confidence explicitly marked.

---

## STEP 9: Integration & Screenshots (Hour 30-36)

1. Connect to Person B's `/api/students` and `/api/student/{id}/knowledge-map`
2. Connect to Person A's `/api/diagnose`
3. Take screenshots of every key screen for pitch deck
4. Pre-load all demo data as fallback

---

## STEP 10: Rehearsal & Submission (Hour 40-48)

**Hour 40:** First full rehearsal. Time it (under 5 minutes).
**Hour 42:** Second rehearsal. Fix transitions.
**Hour 44:** Third rehearsal. Everyone can explain any component.
**Hour 46:** Record backup video. Final pitch polish.
**Hour 48:** Submit to Devpost. README polished. Done.

### Q&A Prep
- **"What if AI is wrong?"** → Evaluator Agent + teacher override. Designed for humans to catch errors.
- **"Privacy?"** → Minimal data, no PII in prompts, data stays local.
- **"Other subjects?"** → Architecture is subject-agnostic. Provide topic graph + questions.
- **"Different from ChatGPT?"** → ChatGPT is a conversation. Compass models learning over time, traces root causes, keeps teacher in loop.
- **"Scaling?"** → FastAPI backend, stateless agents. One teacher → one school is a config change.

---

## CHECKLIST

- [ ] Pitch deck outline done (Hour 2)
- [ ] Teacher class overview dashboard
- [ ] Per-student drilldown with AI diagnosis
- [ ] Accept/Modify/Reject flow working
- [ ] Override history log
- [ ] 3 demo personas narratives written
- [ ] Demo script written and practiced
- [ ] Responsible AI documentation
- [ ] Pitch deck with real screenshots (Hour 36)
- [ ] Demo rehearsed 3+ times
- [ ] Backup video recorded
- [ ] Submitted to Devpost
