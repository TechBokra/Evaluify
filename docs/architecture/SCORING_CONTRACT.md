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

## Attempt submission contract — in-memory v0
- `src/domain/assessment/attempts.ts` accepts a submission key, demo student identity, answers, and quiz; it calculates the score itself.
- Repeated `(examId, userId, submissionKey)` returns the first saved attempt and its original answer and exam snapshots, even when a retry supplies different answers.
- A new submission key is a new simulated attempt; this is **not** a real eligibility policy or authorization check.
- The in-memory repository is not durable across reloads, is not multi-device, and must not be trusted for real users. Final server-side enforcement and attempts-per-assignment rules remain mandatory for a pilot.
- `ExamResult.gradingStatus` is `final`, `needs-review`, or `unverified-demo` (for legacy seeded results). While review is pending, any number is an automatically awarded **provisional subtotal**, never a final grade or final percentage.
