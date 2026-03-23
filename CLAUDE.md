# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test                 # Run all Jest unit tests (jsdom environment)
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run Playwright E2E tests (requires port 9173 free)
npm run bundle           # Bundle src/ into dist/index.js via Browserify
npm run bundle:watch     # Watch src/ and auto-rebundle on changes
npm run refactor         # Run tests → bundle → git commit (resets on failure)
```

To run a single test file: `npx jest spec/board.spec.js`

The app is a static site — open `index.html` directly in a browser, or use `npx serve .` during E2E testing.

## Architecture

This is a **kanban flow simulator** that lets users configure team structures and WIP limits, then animates cards moving through columns while computing throughput, cycle time, and WIP metrics.

### Module system

All source files are CommonJS modules in `src/`, bundled by Browserify into `dist/index.js`. No TypeScript, no transpilation — plain ES5-compatible JS.

### Communication: PubSub

Modules communicate almost entirely through PubSub events (via `pubsub-js`) rather than direct calls. Key events:
- `board.ready`, `board.done` — simulation lifecycle
- `workitem.added/started/finished/removed` — card lifecycle
- `worker.working/idle/created` — worker state
- `stats.calculated` — triggers chart updates

### Data flow

```
index.html form → parsing.js → scenario.js → board.js → worker.js
                                                ↓ (PubSub events)
                               animation.js (DOM cards) ← stats.js → charts
```

- **`setup.js`** — wires up the form, creates scenarios, manages chart lifecycle; the main orchestrator
- **`board.js`** — runs the simulation: assigns work items to workers each tick, manages columns, enforces WIP limits
- **`worker.js`** — workers have a skill set; they pull work items matching their skills
- **`scenario.js`** — thin wrapper that holds parsed config and creates the board
- **`parsing.js`** — converts user-entered strings (e.g. `"dev:2, qa:1"`) into config objects
- **`strategies.js`** — pluggable WIP-limiting strategies
- **`stats.js`** — computes throughput, cycle time, WIP per tick; publishes `stats.calculated`
- **`animation.js`** — subscribes to work item events and renders/moves DOM cards
- **`charts.js`**, **`HistogramChart.js`**, **`CumulativeFlowDiagram.js`** — Chart.js v4 wrappers for line chart, histogram, and CFD

### Tests

Unit tests live in `spec/` (Jest + jsdom). E2E tests in `e2e/` (Playwright, Chrome only, served at `localhost:9173`). The Playwright config is in `playwright.config.js`.
