# Evaluify — Local Teacher → Student → Review Smoke Test

**Status:** proposed manual acceptance test, **not yet executed in an automated browser**.
All accounts, content, group membership and results are artificial, transient data.

## Prerequisites
- Node.js 22; `npm ci`; `npm run dev`.
- Open the Vite localhost URL. This app uses **hash-based routing**, so paths below follow `/#/`.
- Do **not** upload actual pupil names, licensed questions without permission, private records or AI API keys.
- Keep the **same browser tab and running application instance** throughout: mock data and assignments disappear after a full reload.

## Journey A — Publishing and assigning

1. Use the demo role switcher to enter the **Teacher** account (synthetic account ID `user1`).
2. Open **Publish & Assign** at `/#/teacher/assignments`.
3. Select **European Geography**. This existing synthetic quiz uses the teacher-owned approved short-answer item. Other old example quizzes may fail validation because they combine ownership or incomplete content metadata.
4. Set the availability start at the current local time, the closing date after today, and attempt limit to **1**.
5. Publish. Confirm that a group assignment appears with an immutable **version number**. Its group is the synthetic `demo-group-1`, containing user `user2`.
6. Optionally publish another version of the same quiz, then confirm the old assignment still points to its original version.

**Expected:** unapproved/foreign-owned questions cannot be published via the new workflow; the published version is not a live pointer to the mutable question bank.

## Journey B — Student attempt

1. Without refreshing the page, switch to the synthetic **Examinee** (`user2`).
2. Open **My Assignments** at `/#/examinee/assignments`.
3. Select the new group assignment and click **Start assessment**.
4. The student-facing assignment preview must contain question text and response fields, **not** the correct-answer key or rubric.
5. Enter an answer and submit. The result should show **pending teacher review**, not a final score or a verified grade percentage.
6. Return to My Assignments; the used-attempt count should now be **1/1** and a second distinct attempt should not be offered.

**Expected:** the submission is tied to the assigned quiz version. Repeating the same submit request must not create a second attempt. These are client-side demonstration rules, not production anti-cheating controls.

## Journey C — Teacher review and student result

1. Without refreshing, switch back to **Teacher**.
2. Open **Teacher Reviews** at `/#/teacher/reviews`.
3. Select the newly submitted result. The teacher can see the stored submitted answer and the rubric, while the student cannot see the model answer before finalization.
4. Enter a permitted score (between **0** and the question maximum), feedback and a review rationale, then save.
5. Confirm the review history records reviewer, time, score decision and revision, and the result becomes **final** only after every pending item is reviewed.
6. Switch back to **Examinee** and open **My Results**. The finalized percentage and **Reviewed by teacher** status should be visible.

**Expected:** submitted answers and the published quiz snapshot do not change when the original draft is edited later. The review journal is only held in memory.

## Regression checks (not yet browser-verified)
- Test Arabic/English switching and RTL presentation on mobile and desktop widths.
- Close an assignment window, reject membership, or exhaust the attempt limit, including browser reload behavior.
- Verify double-click submission, browser navigation/back, slow connection, timer expiry and retry handling.
- Confirm old seeded historical results are always marked *unverified demo*, never falsely treated as audited grades.
- Verify that an essay with the exact model-answer text still requires human review.
- Verify the public student-facing assignment preview never contains `correctAnswer`.
- Check PDF status labels, uploaded CSV drafts, and teacher question approval path.

## Engineering evidence and known limitations
- TypeScript/Vite build and pure-domain tests run in GitHub Actions on every push.
- There is **no automated E2E browser test** yet. This document is an acceptance checklist, not proof these clicks all work.
- The app is a React/Vite mock prototype with no trusted API, secure multi-tenant identity, durable storage, real student enrollment, consent management or commercial launch.
- The synthetic owner code `teacher-1` and demo accounts `user1`/`user2` are **not security credentials**.
- Real AI, Neon, Vercel, production billing and real learner data remain excluded until separate decision gates.
