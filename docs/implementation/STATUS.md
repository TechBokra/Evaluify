# Implementation status — technical prototype

Updated: 2026-11-23. Source of truth is GitHub Actions on `main`; do not treat a green build as product readiness.

| Stage | Current evidence | Not yet complete |
| --- | --- | --- |
| 00 — Foundation | Backup branch, dependency lock, `npm ci`, Vite/TypeScript CI, local Tailwind, unit tests | Browser E2E, visual/RTL regression, remaining legacy placeholder files |
| 01 — Architecture | Pure grading, versioned quiz snapshot, in-memory attempt repository with idempotent submission | Trusted backend, authorization, persistent repositories |
| 02 — Question Bank | Synthetic CSV importer with source/rights basis, Draft → approval workflow, structural validation | Teacher research, real permission verification, editorial audit history, all question formats |
| 03 — Builder | Versioned published quiz snapshot plus teacher-facing Publish & Assign demo UI | Persistent publication history, editor workflow/rights audit, secure authorization |
| 04 — Assign/Respond | Synthetic group + published-version assignment API/UI; student assignment list, key-free question preview, version-bound submission and per-student attempt limits | Real group management, device recovery, browser E2E and server-enforced authorization |
| 05 — Evaluate | Objective scoring, review status, teacher review queue and form, revisioned in-memory review journal; final results may include reviewed partial credit | Trusted teacher authorization, persisted audit/correction history and browser E2E |
| 06 — Analyze | Pure skill aggregation filters to final scored evidence, checks minimum distinct students | Verified cohort metadata, teacher dashboard, statistical validation |
| 07 — Improve | Pure teacher decision and noncausal follow-up comparison contracts | UI workflow, verified baseline/cohort linkage, real educator evidence |
| 08 — AI/RaaS | Browser-side live Gemini disabled during local prototype | Provider evaluation, cost controls, safe gateway, managed human review |
| 09 — Handover | Continuous integration and documented known limits | Accessibility, RTL/mobile E2E, real-world trial/security review |

## Current implementation constraints

- No Neon, Vercel, live AI, real student records, payment services or production deployment.
- Mock APIs are in-memory and lose data after refresh, cannot handle secure multi-device users, and must not be used with minors' real data.
- The legacy interface still includes recruitment, proctoring and other deferred demos; simulated historical rows have no grading audit.
- The assignment policy is now connected to **local teacher/learner demo pages**. Student previews omit answer keys, but all data and enforcement still live in the browser; this is not secure multi-device service.
- The local question approval action checks a declared rights basis, **not** the real existence or legal sufficiency of a license.
- A passed test confirms only the exercised code path. Mobile behavior, live browser flows and production safety remain unverified.
- The original repository state remains at `backup/main-before-preparation-2026-11-23`.

## Next engineering acceptance batch

1. Execute the documented **local Teacher → Student → Review** browser smoke test and fix observed flow defects.
2. Add automated E2E coverage for assignment expiry, versioning, repeat submission, teacher review and RTL/mobile.
3. Connect finalized attempt evidence to a teacher-facing guarded skill dashboard and the noncausal Improve workflow.
4. Design real group ownership, secure identity and a trusted API/storage boundary before any external pilot.
5. Remove/disable remaining misleading legacy recruitment, proctoring and other deferred product claims.

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

## Local click-path acceptance checklist
See [Local Teacher → Student → Review smoke test](LOCAL_DEMO_WALKTHROUGH.md). The end-to-end flow is now connected in code, but is **not yet browser-verified**; green CI is only the unit/build gate.
