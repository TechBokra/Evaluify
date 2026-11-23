# Baseline — 2026-11-23

## Purpose
First code-preparation pass on `main`, with the original state preserved on `backup/main-before-preparation-2026-11-23`.

## Verified by read-only GitHub inspection before work
- Source: `telshafey/Evaluify`, default branch `main`.
- 200 tracked files, of which 69 were zero-byte.
- 88 relative file paths duplicated across repository root and `src/`.
- `index.html` loads `/src/index.tsx`; `tsconfig.json` includes `src`.
- No committed package lock, test suite, or GitHub workflow in the inspected tree.
- Frontend: React, TypeScript and Vite; `src/services/mockApi.ts` uses mutable in-memory data.
- `submitExam` compares serialized answers with serialized answer keys and treats all question types alike; this is not a reliable final-grading method.
- `src/pages/ExamTaker.tsx` simulates random proctoring events. No camera/microphone inference can be inferred from that code.
- `index.html` currently mixes CDN/import-map dependencies and npm dependencies at differing versions.
- `src/services/geminiService.ts` initializes an AI client from a frontend environment reference; no live AI key should ever be configured in client-side code.

## Evidence status
- New deterministic scoring component: unit tests run in a local Node.js 22 environment before upload. This does **not** validate the complete app.
- Full app dependency installation/build is not locally verified because the code-working runtime cannot reach the npm registry. A GitHub Actions workflow is added to gather build evidence remotely.
- No live backend, deployment, tenant isolation, or production identity mechanism has been tested.

## Non-destructive cleanup order
1. Capture the first CI result; classify errors.
2. Fix broken types/imports and package consistency.
3. Generate and commit a reproducible npm lockfile using a network-capable runner.
4. Trace root imports before deleting empty/duplicate files.
5. Remove CDN/import-map assumptions without disrupting the existing styled UI.
6. Strengthen tests and eliminate sensitive or fictitious demo claims.

Only stages that are verified should be marked complete.

## Completed verification — second pass
- GitHub Actions reported green for the first six scoring unit tests and full TypeScript/Vite build after fixing pre-existing build errors.
- A one-time GitHub runner created and committed the dependency lockfile; clean `npm ci`, tests, and build succeeded during lockfile creation.
- Quality CI now uses `npm ci` and caches npm to enforce committed dependency resolution.
- Removed 44 empty root-level placeholder files after confirming the active app loads from `src/` and the build remained green; some also have empty placeholders in `src/`. Nonempty root duplicates remain pending review.
- Cloud services, live AI, and live student data remain out of scope.

## Browser dependency hardening
- The redundant `aistudiocdn.com` import map was removed; Vite handles npm imports.
- The Analytics page now imports Chart.js from npm, not the global Chart.js CDN.
- The deferred Gemini interview boundary explicitly rejects live calls without reading browser credentials; no external AI is configured.
- Tailwind's dev-time CDN and the unrelated Jitsi external script still need a subsequent controlled migration.

## Local CSS build migration
- Removed Tailwind's runtime CDN and inline Tailwind theme configuration from `index.html`.
- Reproduced the existing primary color palette using `tailwind.config.cjs` and moved legacy custom CSS to `src/styles.css`.
- Added a PostCSS configuration, and imported the CSS from the real Vite entry point.
- The safelist protects common color classes composed by older UI components, but visual regression testing is still required.
- The deferred Jitsi script remains external and the legacy UI is not guaranteed offline.
