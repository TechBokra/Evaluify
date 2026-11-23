# Implementation status — technical prototype

Updated: 2026-11-23. Source of truth is GitHub Actions on `main`; do not treat a green build as product readiness.

| Stage | Current evidence | Not yet complete |
| --- | --- | --- |
| 00 — Foundation | Backup branch, dependency lock, `npm ci`, Vite/TypeScript CI, local Tailwind, unit tests | Browser E2E, visual/RTL regression, remaining legacy placeholder files |
| 01 — Architecture | Pure grading, versioned quiz snapshot, in-memory attempt repository with idempotent submission | Trusted backend, authorization, persistent repositories |
| 02 — Question Bank | Synthetic CSV importer with source/rights basis, Draft → approval workflow, structural validation | Teacher research, real permission verification, editorial audit history, all question formats |
| 03 — Builder | Independent immutable published-quiz contract and its per-version assignment domain | Published version persistence and teacher/learner UI integration |
| 04 — Assign/Respond | Synthetic group membership and assignment-version policy contracts; per-student attempt limits and answer-key-free student preview; legacy demo submission idempotency | Teacher/learner assignment UI, device recovery, secure server-side submission |
| 05 — Evaluate | Objective scoring, review status, teacher review queue and form, revisioned in-memory review journal; final results may include reviewed partial credit | Trusted teacher authorization, persisted audit/correction history and browser E2E |
| 06 — Analyze | Pure skill aggregation filters to final scored evidence, checks minimum distinct students | Verified cohort metadata, teacher dashboard, statistical validation |
| 07 — Improve | Pure teacher decision and noncausal follow-up comparison contracts | UI workflow, verified baseline/cohort linkage, real educator evidence |
| 08 — AI/RaaS | Browser-side live Gemini disabled during local prototype | Provider evaluation, cost controls, safe gateway, managed human review |
| 09 — Handover | Continuous integration and documented known limits | Accessibility, RTL/mobile E2E, real-world trial/security review |

## Current implementation constraints

- No Neon, Vercel, live AI, real student records, payment services or production deployment.
- Mock APIs are in-memory and lose data after refresh, cannot handle secure multi-device users, and must not be used with minors' real data.
- The legacy interface still includes recruitment, proctoring and other deferred demos; simulated historical rows have no grading audit.
- New assignment rules are unit-tested domain contracts, NOT YET connected to the teacher builder or student quiz-taking UI. Student preview intentionally omits answer keys.
- The local question approval action checks a declared rights basis, **not** the real existence or legal sufficiency of a license.
- A passed test confirms only the exercised code path. Mobile behavior, live browser flows and production safety remain unverified.
- The original repository state remains at `backup/main-before-preparation-2026-11-23`.

## Next engineering acceptance batch

1. Bind published quiz snapshots and quiz versions to a testable teacher UI.
2. Introduce local assignment/class contracts and submit idempotency per published version.
3. Implement a teacher-controlled manual review journal with a verified finalization step; never auto-grade essays.
4. Connect finalized attempt evidence to a guarded skill dashboard, then teacher interventions and follow-up comparison.
5. Add browser integration/E2E tests, verify RTL/mobile, and remove remaining misleading legacy product claims.

We intentionally adapt selected **ideas** from Examify (question forms, CSV intake, analytics) without merging repositories or treating mocked AI as implemented. Source file provenance and rights must be reviewed before literal code reuse.

## Teacher review UI — local prototype increment
- `/teacher/reviews` shows only new, reviewable attempts belonging to the synthetic teacher owner `teacher-1`; historical seeded results cannot be graded.
- `/teacher/reviews/:resultId` lets the demo teacher inspect submitted answers and an example rubric, assign 0–max points to pending items, provide feedback and record a revisioned review event.
- An answer becomes `reviewed`; the grade becomes final only after all pending items are processed. Review data is in-memory and cannot serve as a tamper-proof audit log.
- Real teacher authentication, ownership validation, role authorization, durable journaling and concurrent writes require a trusted backend before any external pilot.

## Continued verification contract
- Student result and PDF views now identify manually reviewed subjective items without calling them incorrect or unverified.
- Skill aggregation can include a `reviewed` item only when the enclosing result is final; pending/legacy results remain excluded.
- The assignment module checks group membership, time windows, original published version and per-student attempt limits in memory. It exposes a separate answer-key-free student preview; client-only checks are not security controls.
