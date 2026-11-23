# Evaluify — Technical Prototype (Pre-launch)

Evaluify is an **under-construction** Egypt-first education assessment concept. The initial users to validate are independent teachers and tutoring centers. This repository contains an existing React interface and mock services; **it is not a production product**.

## Current boundaries

- **Current:** local code preparation, synthetic data, architecture, unit tests, and demo flows.
- **Not connected:** Neon, Vercel, payment processing, real student accounts, managed AI models, or a live backend.
- **Legacy UI:** dashboards for corporate recruitment, interviews, and proctoring remain in the existing code. They are not approved Phase 1 scope or evidence that those features work.
- **Mock data:** role switching and assessment APIs are simulations. The current exam submission UI still uses a legacy mock scoring path; the new deterministic scoring module is **not connected to it yet**.
- **Privacy:** do not input real student information, access tokens, provider secrets, or private copyrighted question banks.

## Getting started (local code only)

Use Node.js 22 and npm:

```sh
npm install
npm run dev
npm run test:unit
npm run build
```

No cloud account or AI API key is needed for the mock prototype. The current HTML still includes third-party CDNs and a Jitsi script, so the UI is **not fully offline**. These dependencies are tracked for removal/normalization during hardening. Never expose AI credentials through client-side Vite variables.

## Source of truth

- App entry point: `index.html` -> `src/index.tsx` -> `src/App.tsx`.
- The real active code is under `src/`; some root-level duplicate/empty files are legacy remnants awaiting dependency-aware cleanup.
- Legacy mock API: `src/services/mockApi.ts` (in-memory, not multi-user or durable).
- New domain experiment: `src/domain/assessment/scoring.ts` (pure objective scoring, human review for subjective items). Its unit tests are under `tests/`.
- The team should not mistake a successful build for security, analytics accuracy, or product-market fit.

## Working documents

- [Baseline and known risks](docs/implementation/BASELINE.md)
- [Code-first phases and gates](docs/implementation/PHASES.md)
- [Architecture decision](docs/architecture/ADR-0001-local-first.md)
- [Scoring contract](docs/architecture/SCORING_CONTRACT.md)
- [Examify reuse inventory](docs/reuse/EXAMIFY_AUDIT.md)

**Research governance:** the project F00–F08 research package and pre-investment decision memo remain the strategic references. Their hypotheses are not customer validation or approval for a full commercial build.
