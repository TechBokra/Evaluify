# Live-site verification and public-copy corrections — 2026-11-23

Site checked: https://evaluify.vercel.app/#/ (React hash-router demo).

## Confirmed in isolated live browser session
- Site loads and role switcher works. Teacher nav includes **Publish & Assign** and **Teacher Reviews**.
- Teacher chose existing **European Geography** and published synthetic group assignment **v1**, with visible confirmation.
- In the same session, Student role sees the assigned version **0/1** with a Start Assessment link.
- Student answered the synthetic question **Paris**, and the result correctly remained **Awaiting teacher review — auto-scored 0/5**, with no model answer shown in the student exam page.
- The review page displays the pending question, the original response and model rubric. A browser automation attempt to submit after filling fields returned 'Enter points and feedback for each pending answer'; this may reflect simulated typing not updating React controlled state and needs a separate human/browser E2E reproduction before marking as a confirmed application bug.

## Verified public-copy problems
- Home page claimed live Gemini proctoring, secure exam browser, speech analysis, adaptive testing and personalized AI study guides, none demonstrated as functional production features.
- Home page showed fabricated-style institutional trust logos and positive testimonials, including unsubstantiated 70% savings.
- Customers page showed case studies and partnerships without validation.
- Pricing page advertised unapproved USD monthly prices, support/AI tiers and a 14-day trial without commercial readiness.
- Call-to-action buttons on the original landing page had no handlers.

## Changes introduced
- Replace homepage wording with prelaunch, teacher-first Egypt education prototype positioning, explicit synthetic data and conditional capabilities.
- Remove unsupported customer logos and testimonials; replace those panels with explicit research and validation steps.
- Wire homepage **Explore Teacher Demo** and **See How It Works** controls to actual local demo/scroll actions.
- Replace customer case studies with a truthful prelaunch status page.
- Replace unapproved pricing with a pricing-under-validation page (no invented terms).

## Remaining work
- Browser regression after Vercel serves the new commit (this step does not alter deployment configuration).
- Validate real human typing and completion of teacher review; fix any confirmed app-level failures.
- Add automated browser E2E for teacher → student → review in a controlled local environment.
- Audit legacy About, Products, Why Evaluify, Integrations, Privacy and Terms pages for unsupported claims and inaccurate current capabilities.
- Keep the existing GitHub CI test/build gate and record exact coverage; do not call the app production-ready.
