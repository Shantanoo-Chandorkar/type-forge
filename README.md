# type-forge

Precision typing speed test built on Next.js 16 / React 19 / Tailwind v4.

---

## Project Description

type-forge is a minimalist, keyboard-first typing speed test with no accounts, no servers, and no external dependencies. It runs entirely in the browser and stores all data locally.

**Key features:**

- Real-time WPM, raw WPM, accuracy, error count, and consistency score
- 6 content modes: quotes, words, punctuation, code, academic, and custom text input
- 4 timer lengths: 15, 30, 60, 90, and 120 seconds
- 3 difficulty levels: easy, medium, hard
- Analytics dashboard with WPM trend chart, personal bests table, and per-key error heatmap
- Post-test weakness analysis with targeted drill recommendations
- Dark and light themes with localStorage persistence
- 4 switchable monospace fonts (Share Tech Mono, JetBrains Mono, Fira Code, Courier Prime)
- 3 font sizes, configurable from the settings page

---

## Project Purpose

### The Issue

Most popular typing tests — monkeytype, typeracer, keybr — give you a WPM number and a general accuracy percentage. They do not tell you _which keys_ are slowing you down. They also use only generic prose, which is not useful for developers who type code syntax daily: brackets, semicolons, underscores, operators.

### The Solution

type-forge accumulates per-key error counts across every test you run. After each session, it identifies your weakest characters and recommends targeted drills. A dedicated code content mode serves JS, Python, and general syntax snippets to build real developer muscle memory. All data stays in your browser — no account, no API, no server round-trip.

**Why this approach works:**

- No signup friction: open the browser, start typing
- Full offline capability: no network dependency after first load
- Persistent across sessions: localStorage stores attempt history (20 entries, FIFO) and cumulative key errors indefinitely
- Typography is configurable: font family and size match each user's comfort and screen setup
- Short-burst modes (15s) allow focused repetition without fatigue

---

## Architecture & How It Works

type-forge runs as a single-page Next.js application. All state and logic flows in one direction through a custom hook and two React contexts.

**Processing pipeline:**

1. **Content Selection** — The active `contentMode` (quotes, words, punctuation, code, academic, or custom) combined with the selected `difficulty` key dispatches a lookup against a local JSON file. The resolved string is set as the target passage.

2. **Test Engine (`useTypingTest`)** — On each keystroke, the hook compares the typed character against the expected character at the current index. Correct characters advance the cursor; incorrect characters increment the error counter and log the character to a `keyErrors` map. A `setInterval` fires every second to snapshot current WPM into a `wpmTimelineRef`.

3. **Metrics Calculation** — WPM is calculated as `(correctChars / 5) / (elapsedSeconds / 60)`. Raw WPM uses total typed characters. Consistency is `100 - coefficient of variation` of the per-second WPM timeline, giving a 0–100 score that reflects how steady the pace was.

4. **Results Assembly** — When the timer reaches zero or the passage is completed, the hook reads all mutable refs and assembles a `completedAttempt` object containing every metric, the full WPM timeline, and the character-level breakdown.

5. **Persistence** — The completed attempt is written to localStorage under a 20-entry FIFO array. Personal bests are keyed by `difficulty-timer` pair and updated if the new WPM exceeds the stored record. Cumulative `keyErrors` are merged into a separate localStorage entry that survives across sessions.

6. **Analytics** — The analytics page reads attempt history from localStorage to render a recharts `LineChart` of WPM over time. The keyboard heatmap is an inline SVG where each key's fill intensity maps to its cumulative error count. Keys with the highest error rates surface as drill recommendations below the heatmap.

---

## Installation & Setup

**Prerequisites:**

- Node.js 20+
- npm (bundled with Node.js)

**Steps:**

```bash
# Clone the repository
git clone <repo-url>
cd type-forge

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

No environment variables are required. There is no backend, no database, and no external API to configure.

---

## Analytics Dashboard & Keyboard Heatmap

The analytics page (`/analytics`) is the core feedback loop that separates type-forge from a simple WPM counter.

**Summary cards** at the top of the page show aggregate stats across all stored attempts: total tests completed, all-time best WPM, average accuracy, and average consistency.

**Personal bests table** breaks down your highest WPM per difficulty-timer combination. Each cell in the grid represents a distinct practice context (e.g., hard difficulty at 60 seconds), so you can track progress across specific conditions independently.

**WPM trend chart** plots net WPM across your last 20 attempts in chronological order using a recharts `LineChart`. The trend line makes improvement curves and performance regressions immediately visible.

**Keyboard heatmap** renders a full QWERTY layout as an inline SVG. Each key is shaded from neutral (no errors) to deep red (high error accumulation) based on your total error count across all sessions. The intensity mapping uses a logarithmic scale so that a single high-error key does not wash out the rest of the layout.

**Weakness analysis** reads the top error keys and groups them by finger, row, and hand. Below the heatmap, drill recommendations list the 5 characters with the most accumulated errors and suggest specific practice combinations (e.g., "Practice bigrams containing `;`").

---

## Troubleshooting

| Issue                                 | Cause                                                         | Solution                                                                                              |
| ------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| WPM shows 0 after test                | Timer ended before any correct character was registered       | Type at least one correct character before time expires                                               |
| Custom text modal accepts any input   | No length validation is enforced                              | Paste text under ~500 characters for best experience; very long texts cause the typing area to scroll |
| Font not applying on first load       | The CSS variable is injected by `SettingsContext` after mount | Hard-refresh the page; the `mounted` guard in SettingsContext prevents hydration mismatches           |
| Analytics empty after browser restart | Older versions used sessionStorage, which clears on tab close | Data now uses localStorage — attempt history and key errors persist across sessions                   |
| Keyboard heatmap shows no colour      | No cumulative key errors have been recorded yet               | Complete at least one test; errors accumulate across sessions in localStorage                         |

---

## Future Scope

- Multiplayer race mode via WebSockets — real-time ghost cursor showing opponent progress on the same passage
- Custom word-list import via CSV or TXT file upload — paste your own vocabulary or code token lists
- Exportable performance report as a shareable PNG card or PDF, generated client-side with html2canvas
- Anonymous leaderboard using Vercel KV — opt-in score submission with no account required
- Language packs for non-English typing drills (French, Spanish, German) with locale-specific punctuation handling
- CI performance budget: automated WPM regression alert if the per-second WPM timeline average drops below a configurable threshold across a test suite

---

## Real-World Use Cases

**Developer muscle memory training** — Code mode serves real JS and Python snippets including operators, brackets, and underscores. Regular sessions in code mode reduce the cognitive overhead of typing syntax, leaving more attention for problem-solving during actual coding or live technical interviews.

**Touch typing learners building finger independence** — The 15-second timer combined with easy difficulty gives short, focused reps with minimal fatigue. After several sessions, the keyboard heatmap identifies which fingers are consistently slow or error-prone, allowing drills to be targeted rather than generic.

**Interview preparation under pressure** — Typing under a visible countdown timer with live accuracy tracking mirrors the time-pressure conditions of coding interviews. Practising accuracy at speed in short bursts builds the habit of deliberate, confident typing when it matters.

---

## License

MIT
