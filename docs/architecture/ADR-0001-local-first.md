# ADR-0001 — Local-first code preparation with provider-independent domain

- Status: Accepted for **technical prototype preparation only**
- Date: 2026-11-23

## Context
Evaluify is pre-launch. The strategic F03/F06 study recommends a modular-monolith direction and a conditional evidence-led pilot, not a fully funded production rollout. The current UI is React/Vite with in-memory mocks. The owner requested code-only preparation and deferred Neon and Vercel.

## Decision
1. Keep React/TypeScript/Vite as the present UI stack; no speculative rewrite to Next.js.
2. Add independently testable domain functions under `src/domain/`.
3. Keep mock/in-memory adapters separate from domain decisions. Introduce explicit repository interfaces at the point of feature integration.
4. Keep identity and tenant scope as contracts for future implementation; the current client-side role switch is not authorization.
5. Keep grading deterministic for objective items. Subjective grading requires human review and must not be reported as finalized.
6. Introduce an AI gateway interface only after the evaluation criteria exist; never place actual provider secrets in the browser.
7. Do not choose managed database, queue, CDN, storage or deploy provider as part of this gate.

## Consequences
- The existing demo remains available during gradual migration.
- Initially there are two scoring paths: the legacy mock API path and the new tested domain contract. **Do not present the legacy output as verified scoring.**
- The UI cannot yet serve secure multi-device classes.
- Future implementation may use a local API/DB for realistic testing and PostgreSQL/cloud services only behind explicit later gates.

## Follow-up ADRs
- Question/quiz versioning and item rights.
- Student identity and consent for minors.
- Attempt submission/idempotency and grade revisions.
- AI quality/evaluation, cost and provider policy.
- Tenant isolation and backend authorization.

## Versioned publication prototype
- `src/domain/assessment/publication.ts` validates an approved draft and builds a deeply frozen independent versioned quiz snapshot.
- It does not publish to storage, authorize teachers, or verify content ownership. Those are separate service/backend gates.
- Unit tests cover draft changes after publication, invalid versions/points, and editorial approval.
