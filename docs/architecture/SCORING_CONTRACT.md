# Objective scoring contract — prototype v0

Code: `src/domain/assessment/scoring.ts`; tests: `tests/scoring.test.mjs`.

- **Objective:** multiple-choice, true-false, multiple-select (order-independent), ordering and matching (order-sensitive); all-or-nothing marking for the current prototype.
- **Requires review:** short answer, essay, true/false with justification. Exact text equality does not authorize marking an essay correct.
- **Unanswered:** zero points; no human review task is needed for a blank response.
- **Validation:** reject duplicate question identifiers, negative or non-finite points; reject duplicates in multiple-select submissions.
- **Output:** `awardedPoints`, `totalPoints`, `pendingReviewPoints`, `status`, per-item results.
- `awardedPoints` is **not a final score** whenever `status` is `needs-review`.
- For matching, the current answer format is positional. Versioned item IDs and a richer rubric are needed before production usage.
- No automatic partial credit; no AI-generated grade or explanation.

**Integration gate:** Existing `mockApi.submitExam` and result screens do not yet understand review status. Integration must first propagate pending/final status through types, persistence adapter, results UI, and analytics eligibility checks. Until then the new engine is independently tested but not powering the existing UI.

**Security gate:** a frontend calculation is for demos only. Final scores must eventually be computed and recorded by a trusted backend with tenant and attempt authorization, versioned answer keys, idempotency, and audit history.
