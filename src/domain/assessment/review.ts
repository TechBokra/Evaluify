import type { Exam, ExamResult } from '../../types.ts';

/**
 * Prototype-only manual review journal. The browser cannot authenticate a
 * teacher, prove provenance, or persist immutable audit records across reloads.
 * A trusted service must enforce these rules for a real pilot.
 */
export interface ReviewDecision {
  questionId: string;
  awardedPoints: number;
  feedback: string;
}
export interface ReviewEvent {
  id: string;
  revision: number;
  ownerId: string;
  reviewerId: string;
  recordedAt: string;
  reason: string;
  decisions: ReviewDecision[];
}
export interface ReviewCase {
  revision: number;
  result: ExamResult;
  examSnapshot: Exam;
  journal: ReviewEvent[];
}
export interface ReviewCommand {
  id: string;
  expectedRevision: number;
  ownerId: string;
  reviewerId: string;
  recordedAt: string;
  reason: string;
  decisions: ReviewDecision[];
}

const copy = <T>(value: T): T => structuredClone(value);

export function createReviewCase(result: Readonly<ExamResult>, examSnapshot: Readonly<Exam>): ReviewCase {
  if (result.gradingStatus !== 'needs-review' || !result.itemScores?.some(item => item.status === 'needs-review')) {
    throw new Error('Only submissions awaiting human review may open a review case');
  }
  if (result.examId !== examSnapshot.id || !examSnapshot.ownerId.trim() ||
      new Set(examSnapshot.questions.map(q => q.id)).size !== examSnapshot.questions.length) {
    throw new Error('Exam snapshot does not match the submission');
  }
  const questions = new Map(examSnapshot.questions.map(q => [q.id, q]));
  if (result.itemScores.length !== questions.size ||
      result.itemScores.some(item => !questions.has(item.questionId) ||
        item.maxPoints !== questions.get(item.questionId)?.points)) {
    throw new Error('Grading items do not match the submitted exam snapshot');
  }
  return { revision: 0, result: copy(result), examSnapshot: copy(examSnapshot), journal: [] };
}

/**
 * Only pending subjective items can be reviewed here. Corrections to
 * automatically scored items require a separate audited appeal workflow.
 * Results remain provisional until every pending item has been reviewed.
 */
export function recordManualReview(previous: Readonly<ReviewCase>, command: Readonly<ReviewCommand>): ReviewCase {
  if (previous.revision !== command.expectedRevision) throw new Error('Review revision conflict');
  if (!command.id.trim() || !command.ownerId.trim() || !command.reviewerId.trim() ||
      command.ownerId !== previous.examSnapshot.ownerId) {
    throw new Error('Reviewer/owner identity mismatch');
  }
  if (!Number.isFinite(Date.parse(command.recordedAt))) throw new Error('Invalid review date');
  if (!command.reason.trim() || !command.decisions.length) throw new Error('Review reason and decisions are required');
  if (previous.journal.some(event => event.id === command.id)) throw new Error('Duplicate review event');
  if (previous.result.gradingStatus !== 'needs-review' || !previous.result.itemScores) {
    throw new Error('Review is already finalized');
  }
  const result = copy(previous.result);
  const items = result.itemScores;
  if (!items) throw new Error('Missing review items');
  const seen = new Set<string>();
  for (const decision of command.decisions) {
    if (seen.has(decision.questionId)) throw new Error('Duplicate question in review');
    seen.add(decision.questionId);
    const item = items.find(entry => entry.questionId === decision.questionId);
    if (!item || item.status !== 'needs-review') {
      throw new Error('Question is not pending human review');
    }
    if (!Number.isFinite(decision.awardedPoints) || decision.awardedPoints < 0 ||
        decision.awardedPoints > item.maxPoints) {
      throw new Error('Review points outside question range');
    }
    if (!decision.feedback.trim()) throw new Error('Teacher feedback is required');
    item.awardedPoints = decision.awardedPoints;
    item.status = 'reviewed';
  }
  result.pendingReviewPoints = items
    .filter(item => item.status === 'needs-review')
    .reduce((sum, item) => sum + item.maxPoints, 0);
  result.score = items.reduce((sum, item) => sum + item.awardedPoints, 0);
  result.gradingStatus = result.pendingReviewPoints > 0 ? 'needs-review' : 'final';
  const event: ReviewEvent = {
    id: command.id,
    revision: previous.revision + 1,
    ownerId: command.ownerId,
    reviewerId: command.reviewerId,
    recordedAt: command.recordedAt,
    reason: command.reason.trim(),
    decisions: copy(command.decisions).map(item => ({...item, feedback: item.feedback.trim()})),
  };
  return {
    revision: previous.revision + 1,
    result,
    examSnapshot: copy(previous.examSnapshot),
    journal: [...copy(previous.journal), event],
  };
}
