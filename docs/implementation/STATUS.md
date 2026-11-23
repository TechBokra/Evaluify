# Implementation status — technical prototype

Updated: 2026-11-23. Source of truth is GitHub Actions on `main`; do not treat a green build as product readiness.

| Stage | Current evidence | Not yet complete |
| --- | --- | --- |
| 00 — Foundation | Backup branch, dependency lock, `npm ci`, Vite/TypeScript CI, local Tailwind, unit tests | Browser E2E, visual/RTL regression, remaining legacy placeholder files |
| 01 — Architecture | Pure grading, versioned quiz snapshot, in-memory attempt repository with idempotent submission | Trusted backend, authorization, persistent repositories |
| 02 — Question Bank | Synthetic CSV importer with source/rights basis, Draft → approval workflow, structural validation | Teacher research, real permission verification, editorial audit history, all question formats |
| 03 — Builder | Independent immutable published-quiz contract | Published version persistence, UI integration, assignment authorization |
| 04 — Assign/Respond | Demo exam submission receives synthetic student identity and attempt ID; repeat submit uses same result | Class/assignment model, device recovery, durable submission idempotency |
| 05 — Evaluate | Deterministic objective scoring and needs-review status; student/admin lists, detail and PDF display honest status | Teacher manual grading and verified corrections journal; server-side security |
| 06 — Analyze | Pure skill aggregation filters to final scored evidence, checks minimum distinct students | Verified cohort metadata, teacher dashboard, statistical validation |
| 07 — Improve | Pure teacher decision and noncausal follow-up comparison contracts | UI workflow, verified baseline/cohort linkage, real educator evidence |
| 08 — AI/RaaS | Browser-side live Gemini disabled during local prototype | Provider evaluation, cost controls, safe gateway, managed human review |
| 09 — Handover | Continuous integration and documented known limits | Accessibility, RTL/mobile E2E, real-world trial/security review |

## Current implementation constraints

- No Neon, Vercel, live AI, real student records, payment services or production deployment.
- Mock APIs are in-memory and lose data after refresh, cannot handle secure multi-device users, and must not be used with minors' real data.
- The legacy interface still includes recruitment, proctoring and other deferred demos; simulated historical rows have no grading audit.
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
