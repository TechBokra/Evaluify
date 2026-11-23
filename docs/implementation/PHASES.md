# Evaluify — Code-first development phases

**Status:** Engineering preparation authorized, not approval for a commercial MVP.

## Scope and permanent decisions
- Target market to validate: Egypt, independent teachers and tutoring centers before schools.
- AI-first means AI-assisted drafts/analysis, with deterministic facts and teacher authority; never automatic final marking of subjective answers.
- Prototype value loop: **Create → Assign → Respond → Evaluate → Analyze → Improve**.
- RaaS is a hypothesis to validate, not a guaranteed improvement in marks.
- No Neon, Vercel, live provider AI, payments, or student personal data during this work phase.
- Evaluify is the canonical repository; Examify is reviewed for selective components only.

## Engineering gates
| Stage | Implementation | Done when |
| --- | --- | --- |
| 00 — Baseline | backup ref; audit; gitignore; test runner; CI; build issues; reproducible package install | CI tests and build green, blockers documented |
| 01 — Architecture | organize domain logic, repositories, service boundaries; distinguish demo UI from actual service | app runs; key domain contracts covered by tests |
| 02 — Question Bank | content origin, skill tags, item versions, editorial states, import review | teacher edits, approves, and traces every synthetic item |
| 03 — Builder | quiz draft, frozen published version, assignments prepared | historical versions survive edits |
| 04 — Assign/Respond | class and simulated student identity, assignment, attempt, idempotent submit | repeated submission does not duplicate attempts |
| 05 — Evaluate | deterministic objective grading and explicitly pending human review | audit-friendly score revisions; no fake final result |
| 06 — Analyze | skill/question/class metrics with minimum-evidence guards | numbers trace to eligible finalized attempts |
| 07 — Improve | teacher decision, intervention, reassessment, comparison | intervention and follow-up are traceable |
| 08 — AI/RaaS simulator | provider-independent contracts, draft review, optional human-service flow | mock AI cannot change scores or make autonomous teacher decisions |
| 09 — Handover | accessibility, RTL/mobile, integration tests, documentation | technical prototype accepted with limitations listed |

## Explicitly excluded from the present implementation
Production authentication, managed PostgreSQL, hosting, payments, proctoring, recruitment/CV analysis, AI-powered student profiling, live student records, and promises of learning improvement.

## Code review and verification rules
- Work may commit to `main` under owner authorization. Preserve a recovery ref; avoid force pushes.
- Fix an observed failure before describing it as fixed.
- Use synthetic data and objective tests. Keep AI output labeled mock/draft.
- Do not couple a future database vendor to the domain layer.
- Moving to an external pilot requires a separate privacy, security, cost, and customer-validation decision based on F03/F06 and the integrated memo.
