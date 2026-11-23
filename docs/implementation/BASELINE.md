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
