# Migrating to TypeScript — Incremental Strategy

The goal is to migrate the codebase from JavaScript to TypeScript in small, independently verifiable steps. Each step should leave the project in a working state: tests pass, bundle builds, app runs.

---

## Guiding principles

- Never migrate more than one file per step (during the file-by-file phase)
- Each step is independently committable and reversible
- `npm test` must pass after every step
- `npm run bundle` must succeed after every step
- Prefer enabling strictness gradually over doing it all at once

---

## Phase 1 — Scaffold TypeScript (no file changes)

Goal: TypeScript tooling is installed and configured, but no JS files are touched.

**Steps:**

1. Install dependencies:
   ```
   npm install --save-dev typescript tsify @types/jest @types/node
   ```
   - `tsify` is a Browserify plugin that compiles TypeScript before bundling

2. Add `tsconfig.json` with permissive settings to start:
   ```json
   {
     "compilerOptions": {
       "target": "ES2017",
       "module": "CommonJS",
       "allowJs": true,
       "checkJs": false,
       "strict": false,
       "noEmit": true,
       "esModuleInterop": true,
       "outDir": "dist"
     },
     "include": ["src/**/*", "spec/**/*"]
   }
   ```
   - `allowJs: true` means `.js` files are valid inputs — no forced migration
   - `checkJs: false` means no type errors on existing JS yet
   - `noEmit: true` means the compiler only type-checks; Browserify still handles bundling

3. Update `bundle.js` to use `tsify`:
   ```js
   browserify(...).plugin(require('tsify'))...
   ```
   This lets Browserify handle `.ts` files when they are introduced later.

4. Update Jest config in `package.json` to support TypeScript test files when ready:
   ```json
   "jest": {
     "transform": { "^.+\\.(ts|js)$": "ts-jest" }
   }
   ```
   Install `ts-jest`: `npm install --save-dev ts-jest`

5. Add a `tsc` script for type-checking:
   ```json
   "typecheck": "tsc --noEmit"
   ```

**Verify:** `npm test`, `npm run bundle`, and `npm run typecheck` all pass.

---

## Phase 2 — Enable JS type checking one file at a time

Goal: Catch real type issues in existing JS code before migrating. This surfaces problems early and cheaply, with no impact on runtime behaviour.

**Steps:**

1. Add `// @ts-check` as the first line of one source file.
2. Run `npm run typecheck`. Fix any reported errors in that file (add JSDoc types or correct the code).
3. Commit. Move to the next file.

**Suggested order:** start with pure utility files that have no dependencies:
`percentile.js` → `range.js` → `generator.js` → `Colors.js` → `parsing.js` → `stats.js` → and so on up the dependency tree.

This phase is entirely optional — you can skip it and go straight to Phase 3 — but it reduces the amount of type-fixing work during migration.

---

## Phase 3 — Migrate files to TypeScript, leaf-first

Goal: Rename `.js` files to `.ts` and add types, one at a time.

**For each file:**

1. Rename `src/foo.js` → `src/foo.ts`
2. Run `npm run typecheck`. Address type errors.
3. Run `npm test` and `npm run bundle`. Fix any issues.
4. Commit.

**Recommended order** (dependencies first, so each migrated file can import already-typed modules):

| Order | File | Rationale |
|-------|------|-----------|
| 1 | `percentile.js` | Pure math, no deps |
| 2 | `range.js` | Pure utility |
| 3 | `generator.js` | Pure utility |
| 4 | `Colors.js` | Pure utility |
| 5 | `parsing.js` | Utility, likely few deps |
| 6 | `stats.js` | Depends on lower utilities |
| 7 | `strategies.js` | Logic module |
| 8 | `worker-stats.js` | Depends on stats |
| 9 | `timeAdjustments.js` | Utility logic |
| 10 | `worker.js` | Core simulation entity |
| 11 | `board.js` | Core simulation entity |
| 12 | `boardFactory.js` | Depends on board/worker |
| 13 | `scenario.js` | Depends on board |
| 14 | `scenarios.js` | Depends on scenario |
| 15 | `cfd.js` | Chart data logic |
| 16 | `crosshair.js` | Chart helper |
| 17 | `HistogramChart.js` | Chart component |
| 18 | `CumulativeFlowDiagram.js` | Chart component |
| 19 | `charts.js` | Orchestrates charts |
| 20 | `dom-manipulation.js` | UI layer |
| 21 | `form-helper.js` | UI layer |
| 22 | `animation.js` | UI layer |
| 23 | `setup.js` | App entry point |

**Tips per file:**
- Use `any` freely at first to get it compiling, then tighten types in a follow-up step
- Extract shared interfaces to a `src/types.ts` file as they emerge (e.g., `Worker`, `Board`, `Story`)
- When a module has a corresponding test in `/spec/`, check the test still passes without migrating it yet — imports across `.js`/`.ts` boundaries work fine with `allowJs: true`

---

## Phase 4 — Migrate test files

Goal: Rename spec files to `.ts` and leverage types in tests.

Same process as Phase 3. Migrate one test file per commit. Jest handles `.ts` files via `ts-jest`.

Suggested order: mirror the order of the source files they test.

---

## Phase 5 — Tighten TypeScript config

Goal: Enable stricter checks now that the codebase is fully typed.

Do each of these as a separate commit, fixing any errors that surface:

1. Set `"checkJs": false` is now irrelevant (no more `.js` files); remove it
2. Enable `"strict": true` — this enables `strictNullChecks`, `noImplicitAny`, etc.
3. Enable `"noUncheckedIndexedAccess": true`
4. Enable `"exactOptionalPropertyTypes": true`
5. Review and remove any `any` types introduced as shortcuts in Phase 3

---

## Phase 6 — Optional: modernise the build

With TypeScript in place, it becomes easier to swap the bundler. This is optional and can be done later, but TypeScript codebases often benefit from moving from Browserify to a modern tool like **esbuild** or **Vite**, which have native TypeScript support (no plugin needed) and are significantly faster.

This is a separate project from the migration itself and should be planned independently.

---

## Checkpoints summary

| After Phase | What works |
|-------------|------------|
| 1 | TypeScript installed; all existing tests and bundle pass unchanged |
| 2 | JS files have `@ts-check`; type issues are surfaced and fixed |
| 3 | All source files are `.ts`; types describe the domain |
| 4 | All test files are `.ts` |
| 5 | Strict mode enabled; no `any` |
| 6 | Modern bundler (optional) |
