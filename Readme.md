*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

I built **StudyBuddy**—an all-in-one, distraction-free study companion web app designed to help learners conquer exam fatigue, stay in deep focus, and retain knowledge effectively.

### The Friend I Built It For
I built this for my friend who has been preparing for demanding tech certification exams and software engineering interviews. Like many students and self-learners, they found themselves constantly context-switching between 4 different tools:
1. A noisy Pomodoro timer app filled with ads.
2. A clunky online flashcard app that required an account and monthly subscription.
3. Random quiz websites that didn't allow customizing questions.
4. A white noise app that drained laptop battery in the background.

This fragmentation caused friction and mental exhaustion before the actual studying even started.

### The Solution: StudyBuddy
**StudyBuddy** unites all these tools into a single, cohesive, zero-friction experience:
- ⏱️ **Customizable Pomodoro Clock**: Choose or customize your Focus, Short Break, and Long Break durations, track session rounds, watch a smooth SVG progress dial, and hear a calming 3-note audio chime upon completion.
- 🎧 **Built-In Focus Ambience**: Synthesized soundscapes (Rain, White Noise, Ocean Waves) built directly with the Web Audio API—no heavy streaming or external audio files required.
- 🗂️ **Interactive 3D Flashcards**: Realistic flip animations, card recall grading (*"Mastered"* vs. *"Needs Review"*), deck switcher, and full card editing/shuffling with keyboard shortcuts (<kbd>Space</kbd>, <kbd>◀</kbd>, <kbd>▶</kbd>).
- 📝 **Quiz Master (with 1-Click Flashcard-to-Quiz Conversion)**: Test recall with instant feedback and explanations. Learners can build custom multiple-choice quizzes or auto-generate a quiz directly from their active flashcards!
- 🤖 **Pixel the Virtual Study Buddy**: An animated, expressive companion mascot that shares contextual encouragement, tracks daily focus time, and celebrates high quiz scores with confetti.
- 🔒 **100% Private & Offline-Ready**: Operates completely in the browser with `localStorage` persistence, dark/light mode toggle, and full JSON data export/import capabilities.

---

## Demo

- **Live Demo Link**: [Deploy on GitHub Pages / Vercel / Netlify URL here]
- **Repository Preview**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │  StudyBuddy 🎓           [Pomodoro] [Flashcards] [Quiz] [⚙]  │
 ├───────────────────────────────┬─────────────────────────────┤
 │                               │   🤖 Pixel (Study Buddy)    │
 │            25:00              │   "You've got this! Let's   │
 │        [Stay focused]         │    conquer your goals!"     │
 │          Round 1/4            │                             │
 │                               │   🎯 Goal: Master Closures  │
 │     [Start]  [Reset]  [Skip]  │   ⏱ 50m Focus Today        │
 │                               │   🗂 14 Cards Studied       │
 └───────────────────────────────┴─────────────────────────────┘
```

> **Quick Local Run**:
> Simply clone the repo and open `index.html` in any modern web browser—no build steps or package managers needed!

---

## Code

<!-- Show us the code! Embed your repository link below -->
{% github https://github.com/CYBERtony786/studybuddy %}

*(Or clone locally: `git clone https://github.com/CYBERtony786/studybuddy`)*

### Project Architecture
The project was intentionally engineered with **zero external runtime dependencies** for maximum speed, longevity, and offline availability:
- **`index.html`**: Clean, accessible semantic markup housing the modular view tabs, SVG timer, custom modals, and accessible keyboard-navigable widgets.
- **`style.css`**: Modern study aesthetic with custom CSS variables, responsive design, dark/light themes, and GPU-accelerated 3D perspective card flips (`transform-style: preserve-3d`).
- **`app.js`**: Core reactive engine managing timer state, procedural Web Audio generation, flashcard deck manipulations, dynamic quiz generator algorithms, and `localStorage` synchronization.

---

## How I Built It

To build a high-polish, robust app over the weekend, I paired with an autonomous agentic AI coding workflow:

1. **Procedural Web Audio Engine**: Instead of bundling heavy `.mp3` files that fail offline or slow down page loads, I used the native browser **Web Audio API** (`AudioContext`, `OscillatorNode`, and `BiquadFilterNode`) to synthesize realistic rain, ocean swells, white noise, and pleasant harmonic completion chimes on the fly.
2. **Flashcard-to-Quiz Algorithmic Generator**: Designed an active-recall converter that automatically transforms flashcard front/back pairs into multiple-choice quiz questions, programmatically generating intelligent distractors from other cards in the same deck.
3. **Agentic Pair Programming**: The entire application architecture, responsive CSS, interactive SVG mascot, and state synchronization were iteratively refined with an AI agent. The AI helped verify syntax, prevent scope/temporal dead zone issues, and validate ID mappings across the DOM.

---

## Why Does Open Innovation Matter?

Open innovation is about **agency, accessibility, and freedom for the learner**. 

Closed education and productivity software today has become increasingly gatekept:
- Popular flashcard and study tools lock basic features (like custom question creation or offline access) behind recurring subscriptions.
- Proprietary platforms harvest user study habits and personal notes for ad targeting.
- Web apps rely on bloated, tracking-heavy third-party libraries that break the moment you are offline or on a low-bandwidth connection.

With open innovation and modern web standards:
1. **Zero Gatekeeping**: Anyone with a browser can open this tool, study for free, and retain their data forever.
2. **Data Sovereignty**: Flashcard decks and quiz questions can be exported and imported as simple, open JSON files with no proprietary lock-in.
3. **Longevity & Hackability**: Because the code is open source and dependency-free, my friend (or anyone in the open-source community) can inspect the code, tweak intervals, create custom companion avatars, or fork the repository to tailor it to their personal study flow.

---

## My Agent Session

<!-- Link or embed your agent session transcript/details here -->
- Built and verified iteratively using an autonomous AI coding assistant.
- Transcript includes automated DOM integrity checks, CSS 3D transform debugging, and syntax verification using Node and Python test scripts.

---

## Prize Categories

- **Primary**: Hacktoberfest Weekend Challenge: Build for a Friend
- **Categories**:
  - Open Innovation & Education
  - Developer Productivity & Wellbeing
