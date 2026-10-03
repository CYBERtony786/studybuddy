/**
 * StudyBuddy - 100% Functional Study Companion Application
 * Features: Pomodoro Clock, Flashcard System with 3D flip, Custom Quiz Maker & Runner,
 * Web Audio Ambient Sound + Chimes, and LocalStorage Persistence.
 */

// ==========================================
// 1. DEFAULT DATA & STORAGE INITIALIZATION
// ==========================================

const STORAGE_KEY = 'study_buddy_app_v1';
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const DEFAULT_STATE = {
  theme: 'light',
  stats: {
    pomosToday: 0,
    focusSecondsToday: 0,
    totalPomos: 0,
    totalFocusSeconds: 0,
    totalCardsStudied: 0,
    totalQuizzesTaken: 0,
    lastActiveDate: new Date().toISOString().split('T')[0]
  },
  timerSettings: {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    soundChime: true
  },
  currentGoal: '',
  activeDeckId: 'deck-js',
  decks: [
    {
      id: 'deck-js',
      title: 'JavaScript Essentials',
      description: 'Core concepts, closures, prototypes, and async JS.',
      cards: [
        {
          id: 'card-1',
          front: 'What is a Closure in JavaScript?',
          back: 'A closure is a function bundled together with references to its surrounding lexical environment, allowing inner functions to access outer scope variables even after the outer function has executed.',
          mastered: false
        },
        {
          id: 'card-2',
          front: 'What is the difference between "let" and "var"?',
          back: '"let" is block-scoped and cannot be re-declared in the same scope without error, whereas "var" is function-scoped and gets hoisted to the top of its scope initialized to undefined.',
          mastered: true
        },
        {
          id: 'card-3',
          front: 'What does "=== " (strict equality) check?',
          back: 'Strict equality checks both value and type without performing implicit type coercion.',
          mastered: false
        },
        {
          id: 'card-4',
          front: 'What is an Event Loop in JS?',
          back: 'The Event Loop monitors the Call Stack and Task Queue. When the stack is empty, it pushes pending tasks/microtasks from the queue to the stack for execution.',
          mastered: false
        },
        {
          id: 'card-5',
          front: 'What is a Promise and its 3 states?',
          back: 'A Promise is an object representing eventual completion or failure of an asynchronous operation. States: Pending, Fulfilled, and Rejected.',
          mastered: false
        }
      ]
    },
    {
      id: 'deck-science',
      title: 'General Science & Biology',
      description: 'Fundamental concepts of biology and physics.',
      cards: [
        {
          id: 'card-s1',
          front: 'What is the primary function of Mitochondria?',
          back: 'Often called the "powerhouse of the cell", mitochondria generate most of the chemical energy needed to power the cell\'s biochemical reactions via ATP synthesis.',
          mastered: false
        },
        {
          id: 'card-s2',
          front: 'What is Photosynthesis equation in words?',
          back: 'Carbon Dioxide + Water + Sunlight ➔ Glucose + Oxygen.',
          mastered: true
        },
        {
          id: 'card-s3',
          front: 'What is Newton\'s First Law of Motion?',
          back: 'An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced external force (Inertia).',
          mastered: false
        }
      ]
    }
  ],
  quizzes: [
    {
      id: 'quiz-js',
      title: 'JavaScript Quick Check',
      description: 'Test your understanding of core JavaScript building blocks.',
      questions: [
        {
          prompt: 'Which method converts a JSON string into a JavaScript object?',
          options: [
            'JSON.stringify()',
            'JSON.parse()',
            'JSON.toObject()',
            'JSON.convert()'
          ],
          correctIndex: 1,
          explanation: 'JSON.parse() parses a JSON string, constructing the JavaScript value or object described by the string.'
        },
        {
          prompt: 'Which of the following is NOT a JavaScript primitive data type?',
          options: [
            'String',
            'Boolean',
            'Array',
            'Symbol'
          ],
          correctIndex: 2,
          explanation: 'Arrays in JavaScript are specialized Objects, not primitive data types.'
        },
        {
          prompt: 'What keyword prevents a variable from being reassigned?',
          options: [
            'const',
            'let',
            'var',
            'static'
          ],
          correctIndex: 0,
          explanation: '"const" creates a read-only reference to a value, preventing reassignment.'
        },
        {
          prompt: 'Which operator is used to unpack iterable arrays or objects into elements?',
          options: [
            'Rest operator',
            'Spread operator (...)',
            'Slice operator',
            'Destructure operator'
          ],
          correctIndex: 1,
          explanation: 'The spread syntax (...) allows an iterable to be expanded into individual elements.'
        }
      ]
    },
    {
      id: 'quiz-science',
      title: 'Science Fundamentals',
      description: 'Quick check on biology, physics, and chemistry.',
      questions: [
        {
          prompt: 'What is the chemical symbol for Gold?',
          options: ['Ag', 'Au', 'Fe', 'Gd'],
          correctIndex: 1,
          explanation: 'Au comes from the Latin word for gold, "Aurum".'
        },
        {
          prompt: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
          correctIndex: 1,
          explanation: 'Mars appears reddish due to iron oxide (rust) on its surface.'
        },
        {
          prompt: 'What is the most abundant gas in Earth\'s atmosphere?',
          options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
          correctIndex: 1,
          explanation: 'Nitrogen makes up roughly 78% of Earth\'s atmosphere.'
        }
      ]
    }
  ]
};

// Application state holder
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);

    // Date check to reset daily stats if new day
    const today = new Date().toISOString().split('T')[0];
    if (parsed.stats && parsed.stats.lastActiveDate !== today) {
      parsed.stats.lastActiveDate = today;
      parsed.stats.pomosToday = 0;
      parsed.stats.focusSecondsToday = 0;
    }

    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
    return DEFAULT_STATE;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

// ==========================================
// 2. AUDIO & AMBIENT ENGINE (Web Audio API)
// ==========================================

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.currentAmbient = 'none';
    this.volume = 0.4;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Play a happy 3-note chime: C5 -> E5 -> G5
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.16);

        gain.gain.setValueAtTime(0, now + index * 0.16);
        gain.gain.linearRampToValueAtTime(0.28, now + index * 0.16 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.16 + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.16);
        osc.stop(now + index * 0.16 + 0.7);
      });
    } catch (e) {
      console.warn('Audio chime playback blocked or not supported', e);
    }
  }

  playQuizSound(isCorrect) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isCorrect) {
        // High ascending pleasant ding
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      } else {
        // Lower gentle buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(170, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Quiz sound effect failed', e);
    }
  }

  setAmbient(type) {
    this.init();
    if (!this.ctx) return;
    this.stopAmbient();

    if (type === 'none') {
      this.currentAmbient = 'none';
      return;
    }

    this.currentAmbient = type;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate noise buffer
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        // Pinkish / filtered rain noise
        data[i] = (lastOut + 0.025 * white) / 1.025;
        lastOut = data[i];
      } else if (type === 'waves') {
        // Ocean waves with swell
        const t = i / this.ctx.sampleRate;
        const waveSwell = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * Math.PI));
        data[i] = white * waveSwell * 0.35;
      } else {
        // Standard White noise
        data[i] = white * 0.2;
      }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to soften the sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(type === 'rain' ? 850 : 500, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    noiseSource.start();
    this.ambientSource = noiseSource;
  }

  setAmbientVolume(val) {
    this.volume = val;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(val * 0.4, this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch (e) {}
      this.ambientSource = null;
    }
  }
}

const audio = new AudioEngine();

// ==========================================
// 3. STUDY BUDDY MASCOT & QUOTES
// ==========================================

const BUDDY_QUOTES = {
  idle: [
    "Ready to study! What are we focusing on today?",
    "Small consistent steps turn into massive accomplishments.",
    "A journey of a thousand miles begins with a single Pomodoro.",
    "Take a breath, clear your desk, and let's get into the zone!"
  ],
  focus: [
    "Lock in! You're in the deep focus zone right now.",
    "Keep pushing, your future self is thanking you.",
    "Eliminate distractions. We are doing great!",
    "One concept at a time. Pure momentum!"
  ],
  break: [
    "Pencil down! Time to stretch and rest your eyes.",
    "Hydrate, stretch, and let your brain integrate what you learned.",
    "Great work on that session! Enjoy your well-earned breather.",
    "Relax your shoulders, take a deep sip of water."
  ],
  quizVictory: [
    "ABSOLUTELY LEGENDARY! You crushed that quiz!",
    "Look at that score! Your hard work is paying off big time.",
    "Brilliant memory! You really mastered this material."
  ],
  quizEncourage: [
    "Good effort! Quizzes are for learning where to improve.",
    "Every mistake is just a stepping stone to mastery. Let's review it!",
    "Don't worry, review the flashcards and try once more. You can do this!"
  ]
};

function setBuddyMood(moodType, customText = null) {
  const quoteEl = document.getElementById('buddyQuote');
  const moodSub = document.getElementById('headerBuddyMood');
  const buddyStatus = document.getElementById('buddyStatus');

  let text = customText;
  if (!text) {
    const list = BUDDY_QUOTES[moodType] || BUDDY_QUOTES.idle;
    text = list[Math.floor(Math.random() * list.length)];
  }

  if (quoteEl) quoteEl.textContent = `"${text}"`;
  if (moodSub) {
    if (moodType === 'focus') moodSub.textContent = 'Focusing with you... 🔥';
    else if (moodType === 'break') moodSub.textContent = 'Resting with you... ☕';
    else if (moodType === 'quizVictory') moodSub.textContent = 'Celebrating your win! 🎉';
    else moodSub.textContent = 'Your smart study companion';
  }
  if (buddyStatus) {
    buddyStatus.textContent = `- Pixel the Study Buddy`;
  }
}

// ==========================================
// 4. POMODORO TIMER ENGINE
// ==========================================

const PomodoroTimer = {
  mode: 'work', // 'work' | 'shortBreak' | 'longBreak'
  isRunning: false,
  totalSeconds: 25 * 60,
  secondsLeft: 25 * 60,
  round: 1,
  intervalId: null,
  ringCircumference: 2 * Math.PI * 130, // r=130 -> ~816.81

  init() {
    this.syncDurations();
    this.updateDisplay();
    this.setupListeners();
  },

  syncDurations() {
    const s = state.timerSettings;
    if (this.mode === 'work') this.totalSeconds = s.work * 60;
    else if (this.mode === 'shortBreak') this.totalSeconds = s.shortBreak * 60;
    else if (this.mode === 'longBreak') this.totalSeconds = s.longBreak * 60;

    if (!this.isRunning) {
      this.secondsLeft = this.totalSeconds;
    }
  },

  setMode(newMode) {
    this.pause();
    this.mode = newMode;
    this.syncDurations();
    this.updateModePills();
    this.updateDisplay();

    const ring = document.getElementById('timerProgressRing');
    if (newMode === 'work') {
      ring.classList.remove('mode-break');
      document.getElementById('timerStatusLabel').textContent = 'Stay focused';
      setBuddyMood('focus');
    } else {
      ring.classList.add('mode-break');
      document.getElementById('timerStatusLabel').textContent = 'Rest & Recharge';
      setBuddyMood('break');
    }
  },

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  start() {
    audio.init();
    this.isRunning = true;
    this.updateButtonState();

    if (this.mode === 'work') {
      setBuddyMood('focus');
    } else {
      setBuddyMood('break');
    }

    this.intervalId = setInterval(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
        if (this.mode === 'work') {
          state.stats.focusSecondsToday++;
          state.stats.totalFocusSeconds++;
          if (this.secondsLeft % 60 === 0) saveState();
        }
        this.updateDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  },

  pause() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.updateButtonState();
    saveState();
  },

  reset() {
    this.pause();
    this.syncDurations();
    this.updateDisplay();
    showToast('Timer reset.');
  },

  skip() {
    this.pause();
    this.nextSession();
    showToast('Skipped to next session.');
  },

  completeSession() {
    this.pause();

    if (state.timerSettings.soundChime) {
      audio.playChime();
    }

    if (this.mode === 'work') {
      state.stats.pomosToday++;
      state.stats.totalPomos++;
      saveState();
      renderStats();
      showToast('🎉 Focus round complete! Time for a breather.');

      // Check if long break interval hit
      if (this.round % state.timerSettings.longBreakInterval === 0) {
        this.setMode('longBreak');
      } else {
        this.setMode('shortBreak');
      }
    } else {
      showToast('☕ Break finished! Ready to focus again?');
      this.round++;
      this.setMode('work');
    }

    if (state.timerSettings.autoStartBreaks) {
      this.start();
    }
  },

  nextSession() {
    if (this.mode === 'work') {
      if (this.round % state.timerSettings.longBreakInterval === 0) {
        this.setMode('longBreak');
      } else {
        this.setMode('shortBreak');
      }
    } else {
      this.round++;
      this.setMode('work');
    }
  },

  updateDisplay() {
    const mins = Math.floor(this.secondsLeft / 60);
    const secs = this.secondsLeft % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    document.getElementById('timerDisplay').textContent = timeStr;
    document.title = `${timeStr} - ${this.mode === 'work' ? 'Focus' : 'Break'} | StudyBuddy`;

    // Circular progress
    const ring = document.getElementById('timerProgressRing');
    const fraction = this.secondsLeft / this.totalSeconds;
    const offset = this.ringCircumference * (1 - fraction);
    ring.style.strokeDashoffset = offset;

    // Session Counter
    document.getElementById('sessionCounter').textContent = 
      `Round ${this.round}/${state.timerSettings.longBreakInterval}`;
  },

  updateButtonState() {
    const btn = document.getElementById('timerToggleBtn');
    if (this.isRunning) {
      btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg><span>Pause</span>`;
      btn.classList.add('btn-warning-soft');
      btn.classList.remove('btn-primary');
    } else {
      btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Start Focus</span>`;
      btn.classList.remove('btn-warning-soft');
      btn.classList.add('btn-primary');
    }
  },

  updateModePills() {
    document.querySelectorAll('.mode-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === this.mode);
    });
  },

  setupListeners() {
    document.getElementById('timerToggleBtn').addEventListener('click', () => this.toggle());
    document.getElementById('timerResetBtn').addEventListener('click', () => this.reset());
    document.getElementById('timerSkipBtn').addEventListener('click', () => this.skip());

    document.querySelectorAll('.mode-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.setMode(e.target.dataset.mode);
      });
    });
  }
};

// ==========================================
// 5. FLASHCARDS ENGINE
// ==========================================

const FlashcardsEngine = {
  currentCardIndex: 0,
  isFlipped: false,

  init() {
    this.populateDeckSelector();
    this.renderCurrentCard();
    this.setupListeners();
  },

  getActiveDeck() {
    return state.decks.find(d => d.id === state.activeDeckId) || state.decks[0];
  },

  populateDeckSelector() {
    const sel = document.getElementById('deckSelector');
    sel.innerHTML = '';
    state.decks.forEach(deck => {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = `${deck.title} (${deck.cards.length} cards)`;
      if (deck.id === state.activeDeckId) opt.selected = true;
      sel.appendChild(opt);
    });
  },

  renderCurrentCard() {
    const deck = this.getActiveDeck();
    const flipCardEl = document.getElementById('flipCardElement');
    const frontEl = document.getElementById('cardFrontText');
    const backEl = document.getElementById('cardBackText');
    const badgeEl = document.getElementById('cardMasteryBadge');
    const countText = document.getElementById('currentCardIndexText');
    const progressFill = document.getElementById('cardProgressFill');
    const totalBadge = document.getElementById('totalCardsBadge');

    this.isFlipped = false;
    flipCardEl.classList.remove('flipped');

    if (!deck || deck.cards.length === 0) {
      frontEl.textContent = 'No cards in this deck yet. Click "+ Add Card" above!';
      backEl.textContent = 'Click "+ Add Card" above to get started.';
      badgeEl.textContent = 'Empty';
      countText.textContent = '0 of 0';
      progressFill.style.width = '0%';
      totalBadge.textContent = '0';
      return;
    }

    if (this.currentCardIndex >= deck.cards.length) {
      this.currentCardIndex = 0;
    }

    const card = deck.cards[this.currentCardIndex];
    frontEl.textContent = card.front;
    backEl.textContent = card.back;
    totalBadge.textContent = deck.cards.length;

    countText.textContent = `Card ${this.currentCardIndex + 1} of ${deck.cards.length}`;
    progressFill.style.width = `${((this.currentCardIndex + 1) / deck.cards.length) * 100}%`;

    if (card.mastered) {
      badgeEl.textContent = '✅ Mastered';
      badgeEl.style.background = 'var(--success-subtle)';
      badgeEl.style.color = 'var(--success-text)';
    } else {
      badgeEl.textContent = '⚠️ Learning';
      badgeEl.style.background = 'var(--warning-subtle)';
      badgeEl.style.color = 'var(--warning-text)';
    }
  },

  flip() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length === 0) return;
    this.isFlipped = !this.isFlipped;
    document.getElementById('flipCardElement').classList.toggle('flipped', this.isFlipped);
  },

  next() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length === 0) return;
    this.currentCardIndex = (this.currentCardIndex + 1) % deck.cards.length;
    this.renderCurrentCard();
  },

  prev() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length === 0) return;
    this.currentCardIndex = (this.currentCardIndex - 1 + deck.cards.length) % deck.cards.length;
    this.renderCurrentCard();
  },

  shuffle() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length <= 1) return;
    for (let i = deck.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
    }
    this.currentCardIndex = 0;
    saveState();
    this.renderCurrentCard();
    showToast('Deck shuffled! 🔀');
  },

  markRecall(isMastered) {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length === 0) return;
    const card = deck.cards[this.currentCardIndex];
    card.mastered = isMastered;
    state.stats.totalCardsStudied++;
    saveState();
    renderStats();

    showToast(isMastered ? 'Marked as Mastered! 🌟' : 'Marked for Review 📝');
    this.next();
  },

  setupListeners() {
    // Flip card click & button
    const cardEl = document.getElementById('flipCardElement');
    cardEl.addEventListener('click', () => this.flip());
    document.getElementById('btnFlipCard').addEventListener('click', () => this.flip());

    // Navigation buttons
    document.getElementById('btnNextCard').addEventListener('click', () => this.next());
    document.getElementById('btnPrevCard').addEventListener('click', () => this.prev());
    document.getElementById('btnShuffleDeck').addEventListener('click', () => this.shuffle());

    // Recall marking
    document.getElementById('btnMarkMastered').addEventListener('click', () => this.markRecall(true));
    document.getElementById('btnMarkNeedsReview').addEventListener('click', () => this.markRecall(false));

    // Deck Selector
    document.getElementById('deckSelector').addEventListener('change', (e) => {
      state.activeDeckId = e.target.value;
      this.currentCardIndex = 0;
      saveState();
      this.renderCurrentCard();
    });

    // Keyboard navigation (Space, Left, Right)
    window.addEventListener('keydown', (e) => {
      // Don't trigger if inside an input or textarea or modal
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (document.querySelector('.modal-backdrop.open')) return;

      const activeTab = document.querySelector('.nav-tab.active')?.dataset.tab;
      if (activeTab !== 'flashcards') return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.flip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.next();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      }
    });

    // Delete Deck
    document.getElementById('btnDeleteDeck').addEventListener('click', () => {
      if (state.decks.length <= 1) {
        showToast('You must have at least one deck active.');
        return;
      }
      const deck = this.getActiveDeck();
      if (confirm(`Are you sure you want to delete deck "${deck.title}"?`)) {
        state.decks = state.decks.filter(d => d.id !== deck.id);
        state.activeDeckId = state.decks[0].id;
        this.currentCardIndex = 0;
        saveState();
        this.populateDeckSelector();
        this.renderCurrentCard();
        showToast('Deck deleted.');
      }
    });
  }
};

// ==========================================
// 6. QUIZ ENGINE & CUSTOM QUIZ BUILDER
// ==========================================

const QuizEngine = {
  currentQuiz: null,
  currentIndex: 0,
  userAnswers: [],
  selectedOption: null,

  init() {
    this.renderQuizzesList();
    this.setupListeners();
  },

  renderQuizzesList() {
    const container = document.getElementById('quizzesListContainer');
    container.innerHTML = '';

    if (state.quizzes.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">
          No quizzes yet. Create one or generate one from your flashcards!
        </div>
      `;
      return;
    }

    state.quizzes.forEach(quiz => {
      const card = document.createElement('div');
      card.className = 'quiz-item-card';
      card.innerHTML = `
        <div>
          <span class="quiz-badge">${quiz.questions.length} Questions</span>
          <h3 class="quiz-item-title" style="margin-top: 0.65rem;">${escapeHtml(quiz.title)}</h3>
          <p class="quiz-item-desc">${escapeHtml(quiz.description || 'Test your knowledge on this topic.')}</p>
        </div>
        <div class="quiz-meta-row">
          <span>Self-paced</span>
          <div style="display:flex; gap: 0.35rem;">
            <button class="btn btn-primary btn-sm btn-start-quiz" data-id="${quiz.id}">Start Quiz</button>
            <button class="btn btn-outline-danger btn-sm btn-delete-quiz" data-id="${quiz.id}" title="Delete Quiz">🗑️</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Attach listeners
    container.querySelectorAll('.btn-start-quiz').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.startQuiz(e.currentTarget.dataset.id);
      });
    });

    container.querySelectorAll('.btn-delete-quiz').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qid = e.currentTarget.dataset.id;
        if (state.quizzes.length <= 1) {
          showToast('Keep at least one quiz in your collection.');
          return;
        }
        if (confirm('Are you sure you want to delete this quiz?')) {
          state.quizzes = state.quizzes.filter(q => q.id !== qid);
          saveState();
          this.renderQuizzesList();
          showToast('Quiz deleted.');
        }
      });
    });
  },

  startQuiz(quizId) {
    const quiz = state.quizzes.find(q => q.id === quizId);
    if (!quiz || quiz.questions.length === 0) {
      showToast('This quiz has no questions yet!');
      return;
    }

    this.currentQuiz = quiz;
    this.currentIndex = 0;
    this.userAnswers = [];
    this.selectedOption = null;

    this.showView('quizPlayView');
    this.renderCurrentQuestion();
    setBuddyMood('focus', `Taking "${quiz.title}". Read carefully and trust yourself!`);
  },

  renderCurrentQuestion() {
    const q = this.currentQuiz.questions[this.currentIndex];
    const total = this.currentQuiz.questions.length;

    document.getElementById('quizPlayTitle').textContent = this.currentQuiz.title;
    document.getElementById('quizPlayStep').textContent = `Question ${this.currentIndex + 1} of ${total}`;
    document.getElementById('quizProgressFill').style.width = `${((this.currentIndex + 1) / total) * 100}%`;

    document.getElementById('quizQuestionPrompt').textContent = q.prompt;

    const optList = document.getElementById('quizOptionsList');
    optList.innerHTML = '';
    this.selectedOption = null;

    const feedbackBox = document.getElementById('quizFeedbackBox');
    feedbackBox.style.display = 'none';
    feedbackBox.className = 'quiz-feedback-box';

    const nextBtn = document.getElementById('btnNextQuizQuestion');
    nextBtn.style.display = 'none';
    nextBtn.textContent = this.currentIndex === total - 1 ? 'See Results 🏆' : 'Continue ➔';

    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `
        <span class="option-letter">${OPTION_LETTERS[idx]}</span>
        <span>${escapeHtml(optText)}</span>
      `;
      btn.addEventListener('click', () => this.handleOptionSelection(idx));
      optList.appendChild(btn);
    });
  },

  handleOptionSelection(chosenIdx) {
    if (this.selectedOption !== null) return; // Already picked

    this.selectedOption = chosenIdx;
    const q = this.currentQuiz.questions[this.currentIndex];
    const isCorrect = chosenIdx === q.correctIndex;

    this.userAnswers.push({
      question: q.prompt,
      chosen: q.options[chosenIdx],
      correct: q.options[q.correctIndex],
      isCorrect: isCorrect,
      explanation: q.explanation || ''
    });

    audio.playQuizSound(isCorrect);

    // Style buttons
    const buttons = document.querySelectorAll('.quiz-option-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === chosenIdx && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    // Show explanation feedback
    const feedbackBox = document.getElementById('quizFeedbackBox');
    const feedbackIcon = document.getElementById('feedbackIcon');
    const feedbackHeading = document.getElementById('feedbackHeading');
    const feedbackExpl = document.getElementById('feedbackExplanation');

    feedbackBox.style.display = 'flex';
    if (isCorrect) {
      feedbackBox.classList.add('correct-box');
      feedbackIcon.textContent = '🎉';
      feedbackHeading.textContent = 'Spot on!';
      feedbackExpl.textContent = q.explanation || 'Great job answering correctly.';
    } else {
      feedbackBox.classList.add('wrong-box');
      feedbackIcon.textContent = '💡';
      feedbackHeading.textContent = `Not quite. Correct answer: ${OPTION_LETTERS[q.correctIndex]} (${q.options[q.correctIndex]})`;
      feedbackExpl.textContent = q.explanation || 'Review this concept to master it.';
    }

    document.getElementById('btnNextQuizQuestion').style.display = 'inline-flex';
  },

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex < this.currentQuiz.questions.length) {
      this.renderCurrentQuestion();
    } else {
      this.finishQuiz();
    }
  },

  finishQuiz() {
    state.stats.totalQuizzesTaken++;
    saveState();
    renderStats();

    const total = this.userAnswers.length;
    const correctCount = this.userAnswers.filter(a => a.isCorrect).length;
    const percent = Math.round((correctCount / total) * 100);

    document.getElementById('resultPercentage').textContent = `${percent}%`;
    document.getElementById('resultRatio').textContent = `${correctCount}/${total} Correct`;

    // SVG Score circle offset (circumference = 2 * PI * 68 = 427.25)
    const ring = document.getElementById('scoreRingFill');
    const circumference = 2 * Math.PI * 68;
    ring.style.strokeDashoffset = circumference * (1 - percent / 100);

    const titleEl = document.getElementById('resultTitle');
    const msgEl = document.getElementById('resultMessage');

    if (percent >= 80) {
      titleEl.textContent = 'Outstanding Mastery! 🎉';
      msgEl.textContent = 'You proved you have a fantastic grasp of this subject. Keep up the high score streak!';
      setBuddyMood('quizVictory');
      launchConfetti();
    } else if (percent >= 50) {
      titleEl.textContent = 'Good Effort! 📚';
      msgEl.textContent = 'Solid foundation! A quick review of the questions below will get you to 100%.';
      setBuddyMood('idle', 'Nice work finishing the quiz! Reviewing mistakes is where real learning happens.');
    } else {
      titleEl.textContent = 'Keep Practicing! 💪';
      msgEl.textContent = 'Don\'t sweat it—learning takes repetition. Check the answers below and try once more!';
      setBuddyMood('quizEncourage');
    }

    // Render review list
    const reviewList = document.getElementById('quizReviewList');
    reviewList.innerHTML = '';
    this.userAnswers.forEach((ans, idx) => {
      const item = document.createElement('div');
      item.className = `review-item ${ans.isCorrect ? 'review-correct' : 'review-wrong'}`;
      item.innerHTML = `
        <div class="review-item-q">${idx + 1}. ${escapeHtml(ans.question)}</div>
        <div class="review-item-ans">
          <span>Your Answer: <strong>${escapeHtml(ans.chosen)}</strong> ${ans.isCorrect ? '✅' : '❌'}</span>
          ${!ans.isCorrect ? `<br><span>Correct: <strong style="color:var(--success);">${escapeHtml(ans.correct)}</strong></span>` : ''}
          ${ans.explanation ? `<br><small style="color:var(--text-muted);">${escapeHtml(ans.explanation)}</small>` : ''}
        </div>
      `;
      reviewList.appendChild(item);
    });

    this.showView('quizResultView');
  },

  showView(viewId) {
    document.querySelectorAll('.quiz-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
  },

  generateFromFlashcards() {
    const deck = FlashcardsEngine.getActiveDeck();
    if (!deck || deck.cards.length < 2) {
      showToast('Need at least 2 flashcards in active deck to generate a quiz!');
      return;
    }

    // Convert flashcards into quiz questions
    const questions = deck.cards.map((card, i, arr) => {
      // Pick 3 distractors from other cards
      const otherAnswers = arr.filter((_, idx) => idx !== i).map(c => c.back);
      const shuffledOthers = otherAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const options = [card.back, ...shuffledOthers].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(card.back);

      return {
        prompt: card.front,
        options: options,
        correctIndex: correctIndex,
        explanation: `Answer is: ${card.back}`
      };
    });

    const newQuiz = {
      id: `quiz-gen-${Date.now()}`,
      title: `${deck.title} Quiz (From Cards)`,
      description: `Auto-generated from ${deck.cards.length} cards in ${deck.title}.`,
      questions: questions
    };

    state.quizzes.unshift(newQuiz);
    saveState();
    this.renderQuizzesList();
    showToast('Quiz created from your flashcards! ⚡');
    this.startQuiz(newQuiz.id);
  },

  setupListeners() {
    document.getElementById('btnNextQuizQuestion').addEventListener('click', () => this.nextQuestion());
    
    document.getElementById('btnExitQuiz').addEventListener('click', () => {
      if (confirm('Are you sure you want to exit the quiz?')) {
        this.showView('quizSelectionView');
        setBuddyMood('idle');
      }
    });

    document.getElementById('btnRetakeQuiz').addEventListener('click', () => {
      if (this.currentQuiz) this.startQuiz(this.currentQuiz.id);
    });

    document.getElementById('btnBackToQuizzes').addEventListener('click', () => {
      this.showView('quizSelectionView');
      setBuddyMood('idle');
    });

    document.getElementById('btnQuizFromCards').addEventListener('click', () => {
      this.generateFromFlashcards();
    });
  }
};

// ==========================================
// 7. QUIZ BUILDER MODAL (CUSTOM USER QUIZZES)
// ==========================================

const QuizBuilder = {
  currentQuestions: [],

  open() {
    this.currentQuestions = [];
    document.getElementById('quizTitleInput').value = '';
    document.getElementById('quizDescInput').value = '';
    document.getElementById('inlineQuestionForm').style.display = 'none';
    this.renderQuestionsList();
    openModal('modalQuizBuilder');
  },

  renderQuestionsList() {
    const list = document.getElementById('builderQuestionsList');
    document.getElementById('builderQuestionCount').textContent = this.currentQuestions.length;
    list.innerHTML = '';

    if (this.currentQuestions.length === 0) {
      list.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem;">No questions added yet. Click "+ Add Question" below.</div>';
      return;
    }

    this.currentQuestions.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'builder-q-item';
      item.innerHTML = `
        <div style="max-width: 80%;">
          <strong>Q${idx + 1}:</strong> ${escapeHtml(q.prompt)} 
          <span style="color:var(--success); font-size: 0.8rem; margin-left: 0.5rem;">(Correct: ${OPTION_LETTERS[q.correctIndex]})</span>
        </div>
        <button class="btn btn-outline-danger btn-sm btn-del-builder-q" data-idx="${idx}">✕</button>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll('.btn-del-builder-q').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        this.currentQuestions.splice(idx, 1);
        this.renderQuestionsList();
      });
    });
  },

  showInlineForm() {
    const form = document.getElementById('inlineQuestionForm');
    form.style.display = 'flex';
    document.getElementById('qPromptInput').value = '';
    document.getElementById('optInput0').value = '';
    document.getElementById('optInput1').value = '';
    document.getElementById('optInput2').value = '';
    document.getElementById('optInput3').value = '';
    document.getElementById('qExplanationInput').value = '';
    document.getElementById('radio0').checked = true;
  },

  saveInlineQuestion() {
    const prompt = document.getElementById('qPromptInput').value.trim();
    const opt0 = document.getElementById('optInput0').value.trim();
    const opt1 = document.getElementById('optInput1').value.trim();
    const opt2 = document.getElementById('optInput2').value.trim();
    const opt3 = document.getElementById('optInput3').value.trim();
    const explanation = document.getElementById('qExplanationInput').value.trim();

    if (!prompt || !opt0 || !opt1) {
      showToast('Please provide a question and at least 2 options (A & B).');
      return;
    }

    const options = [opt0, opt1];
    if (opt2) options.push(opt2);
    if (opt3) options.push(opt3);

    const checkedRadio = document.querySelector('input[name="correctRadio"]:checked');
    let correctIndex = checkedRadio ? parseInt(checkedRadio.value, 10) : 0;
    if (correctIndex >= options.length) correctIndex = 0;

    this.currentQuestions.push({
      prompt,
      options,
      correctIndex,
      explanation
    });

    document.getElementById('inlineQuestionForm').style.display = 'none';
    this.renderQuestionsList();
    showToast('Question added to builder.');
  },

  saveWholeQuiz() {
    const title = document.getElementById('quizTitleInput').value.trim();
    const desc = document.getElementById('quizDescInput').value.trim();

    if (!title) {
      showToast('Please give your quiz a name!');
      return;
    }

    if (this.currentQuestions.length === 0) {
      showToast('Please add at least 1 question before saving.');
      return;
    }

    const newQuiz = {
      id: `quiz-custom-${Date.now()}`,
      title: title,
      description: desc,
      questions: this.currentQuestions
    };

    state.quizzes.push(newQuiz);
    saveState();
    QuizEngine.renderQuizzesList();
    closeModal('modalQuizBuilder');
    showToast(`Quiz "${title}" created successfully! 🎯`);
  },

  setupListeners() {
    document.getElementById('btnOpenQuizBuilder').addEventListener('click', () => this.open());
    document.getElementById('btnOpenAddQuestionForm').addEventListener('click', () => this.showInlineForm());
    document.getElementById('btnSaveInlineQuestion').addEventListener('click', () => this.saveInlineQuestion());
    document.getElementById('btnCancelInlineQuestion').addEventListener('click', () => {
      document.getElementById('inlineQuestionForm').style.display = 'none';
    });
    document.getElementById('btnSaveWholeQuiz').addEventListener('click', () => this.saveWholeQuiz());
  }
};

// ==========================================
// 8. CARD & DECK MODALS MANAGEMENT
// ==========================================

const DeckAndCardManager = {
  setupListeners() {
    // Open New Deck Modal
    document.getElementById('btnNewDeckModal').addEventListener('click', () => {
      document.getElementById('newDeckNameInput').value = '';
      document.getElementById('newDeckDescInput').value = '';
      openModal('modalNewDeck');
    });

    // Save New Deck Form
    document.getElementById('newDeckForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('newDeckNameInput').value.trim();
      const desc = document.getElementById('newDeckDescInput').value.trim();
      if (!title) return;

      const newDeck = {
        id: `deck-${Date.now()}`,
        title: title,
        description: desc,
        cards: []
      };

      state.decks.push(newDeck);
      state.activeDeckId = newDeck.id;
      saveState();

      FlashcardsEngine.populateDeckSelector();
      FlashcardsEngine.renderCurrentCard();
      closeModal('modalNewDeck');
      showToast(`Deck "${title}" created!`);
    });

    // Open Add Card Modal
    document.getElementById('btnOpenAddCard').addEventListener('click', () => {
      this.openCardEditor();
    });

    document.getElementById('btnAddCardFromManager').addEventListener('click', () => {
      this.openCardEditor();
    });

    // Open Manage Cards Modal
    document.getElementById('btnManageCards').addEventListener('click', () => {
      this.renderManageCardsTable();
      openModal('modalManageCards');
    });

    // Filter cards in manager table
    document.getElementById('cardFilterInput').addEventListener('input', (e) => {
      this.renderManageCardsTable(e.target.value.toLowerCase());
    });

    // Save Card Form
    document.getElementById('cardEditorForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const cardId = document.getElementById('cardEditId').value;
      const front = document.getElementById('cardFrontInput').value.trim();
      const back = document.getElementById('cardBackInput').value.trim();

      if (!front || !back) return;

      const deck = FlashcardsEngine.getActiveDeck();
      if (!deck) return;

      if (cardId) {
        // Edit existing card
        const card = deck.cards.find(c => c.id === cardId);
        if (card) {
          card.front = front;
          card.back = back;
          showToast('Card updated.');
        }
      } else {
        // Add new card
        deck.cards.push({
          id: `card-${Date.now()}`,
          front: front,
          back: back,
          mastered: false
        });
        showToast('Card added to deck!');
      }

      saveState();
      FlashcardsEngine.renderCurrentCard();
      FlashcardsEngine.populateDeckSelector();
      this.renderManageCardsTable();
      closeModal('modalCardEditor');
    });
  },

  openCardEditor(cardId = null) {
    const titleEl = document.getElementById('cardEditorModalTitle');
    const idInput = document.getElementById('cardEditId');
    const frontInput = document.getElementById('cardFrontInput');
    const backInput = document.getElementById('cardBackInput');

    if (cardId) {
      const deck = FlashcardsEngine.getActiveDeck();
      const card = deck?.cards.find(c => c.id === cardId);
      if (card) {
        titleEl.textContent = 'Edit Flashcard';
        idInput.value = card.id;
        frontInput.value = card.front;
        backInput.value = card.back;
      }
    } else {
      titleEl.textContent = 'Add Flashcard';
      idInput.value = '';
      frontInput.value = '';
      backInput.value = '';
    }

    openModal('modalCardEditor');
  },

  renderManageCardsTable(filterQuery = '') {
    const deck = FlashcardsEngine.getActiveDeck();
    document.getElementById('manageDeckNameHeader').textContent = deck ? deck.title : '';
    const tbody = document.getElementById('manageCardsTbody');
    tbody.innerHTML = '';

    if (!deck || deck.cards.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No cards in this deck. Add one above!</td></tr>`;
      return;
    }

    const filtered = deck.cards.filter(c => 
      c.front.toLowerCase().includes(filterQuery) || 
      c.back.toLowerCase().includes(filterQuery)
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:1rem;">No cards match your filter.</td></tr>`;
      return;
    }

    filtered.forEach(card => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(card.front)}</strong></td>
        <td>${escapeHtml(card.back)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm btn-edit-card" data-id="${card.id}" title="Edit">✏️</button>
            <button class="btn btn-outline-danger btn-sm btn-delete-card" data-id="${card.id}" title="Delete">🗑️</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.openCardEditor(e.currentTarget.dataset.id);
      });
    });

    tbody.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cid = e.currentTarget.dataset.id;
        if (confirm('Delete this flashcard?')) {
          deck.cards = deck.cards.filter(c => c.id !== cid);
          saveState();
          FlashcardsEngine.renderCurrentCard();
          FlashcardsEngine.populateDeckSelector();
          this.renderManageCardsTable(document.getElementById('cardFilterInput').value.toLowerCase());
          showToast('Card deleted.');
        }
      });
    });
  }
};

// ==========================================
// 9. SETTINGS, STATS & DATA BACKUP
// ==========================================

function initSettings() {
  const form = document.getElementById('timerSettingsForm');
  const s = state.timerSettings;

  document.getElementById('setWorkMin').value = s.work;
  document.getElementById('setShortBreakMin').value = s.shortBreak;
  document.getElementById('setLongBreakMin').value = s.longBreak;
  document.getElementById('setLongBreakInterval').value = s.longBreakInterval;
  document.getElementById('setAutoStartBreaks').checked = s.autoStartBreaks;
  document.getElementById('setSoundChime').checked = s.soundChime;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.timerSettings.work = parseInt(document.getElementById('setWorkMin').value, 10) || 25;
    state.timerSettings.shortBreak = parseInt(document.getElementById('setShortBreakMin').value, 10) || 5;
    state.timerSettings.longBreak = parseInt(document.getElementById('setLongBreakMin').value, 10) || 15;
    state.timerSettings.longBreakInterval = parseInt(document.getElementById('setLongBreakInterval').value, 10) || 4;
    state.timerSettings.autoStartBreaks = document.getElementById('setAutoStartBreaks').checked;
    state.timerSettings.soundChime = document.getElementById('setSoundChime').checked;

    saveState();
    PomodoroTimer.syncDurations();
    PomodoroTimer.updateDisplay();
    showToast('Timer settings saved!');
  });

  // Sound test button
  document.getElementById('btnTestChime').addEventListener('click', () => {
    audio.playChime();
  });

  // Export JSON
  document.getElementById('btnExportData').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `study_buddy_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Data exported successfully! 💾');
  });

  // Import JSON
  const importInput = document.getElementById('importDataInput');
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.decks && imported.timerSettings) {
          state = imported;
          saveState();
          location.reload();
        } else {
          showToast('Invalid backup file format.');
        }
      } catch (err) {
        showToast('Error reading JSON file.');
      }
    };
    reader.readAsText(file);
  });

  // Reset to Defaults
  document.getElementById('btnResetAllData').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data and stats to factory defaults?')) {
      localStorage.removeItem(STORAGE_KEY);
      state = DEFAULT_STATE;
      saveState();
      location.reload();
    }
  });

  // Focus Goal
  const goalInput = document.getElementById('currentGoalInput');
  const goalDisplay = document.getElementById('goalDisplay');
  if (state.currentGoal) {
    goalDisplay.textContent = `🎯 ${state.currentGoal}`;
    goalInput.value = state.currentGoal;
  }
  document.getElementById('saveGoalBtn').addEventListener('click', () => {
    const val = goalInput.value.trim();
    state.currentGoal = val;
    saveState();
    goalDisplay.textContent = val ? `🎯 ${val}` : 'No target set. Type above to lock in your mission!';
    showToast('Study goal set!');
  });
}

function renderStats() {
  const st = state.stats;
  // Mini stats
  document.getElementById('statsPomosCount').textContent = st.pomosToday;
  const todayMins = Math.floor(st.focusSecondsToday / 60);
  document.getElementById('statsFocusMinutes').textContent = `${todayMins}m`;
  document.getElementById('statsCardsCount').textContent = st.totalCardsStudied;

  // Settings full stats
  document.getElementById('totalPomosStat').textContent = st.totalPomos;
  const totalHrs = (st.totalFocusSeconds / 3600).toFixed(1);
  document.getElementById('totalTimeStat').textContent = `${totalHrs} hrs`;
  document.getElementById('totalCardsStudiedStat').textContent = st.totalCardsStudied;
  document.getElementById('totalQuizzesTakenStat').textContent = st.totalQuizzesTaken;
}

// ==========================================
// 10. AMBIENT SOUND CHIPS & THEME TOGGLE
// ==========================================

function initAmbientAndTheme() {
  // Ambient chips
  document.querySelectorAll('.ambient-chips .chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.ambient-chips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      audio.setAmbient(chip.dataset.sound);
    });
  });

  const volSlider = document.getElementById('ambientVolume');
  volSlider.addEventListener('input', (e) => {
    audio.setAmbientVolume(e.target.value / 100);
  });

  // Dark/Light theme
  const themeBtn = document.getElementById('themeToggleBtn');
  const sunIcon = themeBtn.querySelector('.icon-sun');
  const moonIcon = themeBtn.querySelector('.icon-moon');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'inline';
    } else {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
      sunIcon.style.display = 'inline';
      moonIcon.style.display = 'none';
    }
  }

  applyTheme(state.theme);

  themeBtn.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveState();
    applyTheme(state.theme);
  });

  // Buddy avatar click interaction
  const buddyAvatar = document.getElementById('miniBuddyAvatar');
  buddyAvatar.addEventListener('click', () => {
    setBuddyMood('idle');
    showToast('Pixel waves hello! 👋');
  });
}

// ==========================================
// 11. TAB NAVIGATION & MODALS UTILITIES
// ==========================================

function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = `tab-${tab.dataset.tab}`;
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });

  // Modal close triggers
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.dataset.close;
      closeModal(modalId);
    });
  });

  // Close modal when clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>💬</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2700);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// ==========================================
// 12. HIGH SCORE CELEBRATION CONFETTI
// ==========================================

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 120;
  const particles = [];
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  for (let i = 0; i < confettiCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleInc: Math.random() * 0.08 + 0.04,
      tiltAngle: 0
    });
  }

  let animationFrame;
  let start = Date.now();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let remaining = false;

    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleInc;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) * 1.5;
      p.x += Math.sin(p.d) * 1.5;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      if (p.y < canvas.height) {
        remaining = true;
      }

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });

    if (remaining && Date.now() - start < 4500) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  draw();
}

// ==========================================
// 13. BOOTSTRAP APPLICATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  PomodoroTimer.init();
  FlashcardsEngine.init();
  QuizEngine.init();
  QuizBuilder.setupListeners();
  DeckAndCardManager.setupListeners();
  initSettings();
  renderStats();
  initAmbientAndTheme();
  setBuddyMood('idle');
});
