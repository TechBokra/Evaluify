# Examify reuse shortlist — decision log v0

Source inspected: public `tamerelshafey/Examify` (read-only access). Evaluify remains the canonical implementation repository.

| Source path in Examify | Potential use | Decision |
| --- | --- | --- |
| `components/QuestionFormModal.tsx` | question type editor and Arabic/English form ideas | REWORK in Evaluify during Stage 02 |
| `components/QuestionBankComponent.tsx` | filtering/classification/CSV concepts | EXTRACT features, not a 45 KB monolithic component |
| `pages/AIImportFromTextPage.tsx` | parse-review-approve UI pattern | REWORK UI; no real AI claims |
| `components/AnalyticsComponent.tsx` | visualization ideas for finalized attempts | REWORK calculations and evidence guards |
| `components/PersonalizedLearningPath.tsx` | intervention plan display | DESIGN REFERENCE only; not evidence of efficacy |
| `services/api.ts` | mock flows and scoring test cases | REFERENCE, not a secure backend |
| `services/ai.ts` | AI feature inventory | DO NOT PORT as a real provider; much is mocked |
| `pages/ExamTaker.tsx` | mobile answering UI | REVIEW patterns; exclude camera/microphone proctoring |
| corporate/hiring/proctoring/marketplace flows | outside teacher-first prototype | DEFER |

## Constraints
- No wholesale merge of repositories or dependency sets; Vite/router versions differ.
- No copied code until its use rights and dependencies are checked. Public GitHub visibility does not itself grant a software reuse license.
- Every imported feature must map to a teacher/center JTBD, a user action, and a testable acceptance condition.
- Never mix simulated AI/proctoring results with actual measurements.
- Record each approved extraction with source path, ref, destination, changes, and tests.
