import type { Answer, Question, StudentAnswer } from '../../types.ts';

export type ItemScoreStatus = 'correct' | 'incorrect' | 'unanswered' | 'needs-review';

export interface ItemScore {
  questionId: string;
  status: ItemScoreStatus;
  awardedPoints: number;
  maxPoints: number;
}

export interface AssessmentScore {
  /** Only automatically awarded points; not a finalized score while review is pending. */
  awardedPoints: number;
  totalPoints: number;
  pendingReviewPoints: number;
  status: 'final' | 'needs-review';
  items: ItemScore[];
}

const requiresHumanReview = (type: Question['type']): boolean =>
  type === 'short-answer' || type === 'essay' || type === 'true-false-justification';

const isAnswered = (answer: Answer | undefined): boolean => {
  if (answer == null) return false;
  if (typeof answer === 'string') return answer.trim().length > 0;
  if (Array.isArray(answer)) return answer.length > 0;
  return answer.selection !== '' || answer.justification.trim().length > 0;
};

const orderedEquals = (actual: Answer | undefined, expected: Answer): boolean =>
  Array.isArray(actual) && Array.isArray(expected) &&
  actual.length === expected.length &&
  actual.every((value, index) => value === expected[index]);

const unorderedSetEquals = (actual: Answer | undefined, expected: Answer): boolean => {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  if (new Set(actual).size !== actual.length || new Set(expected).size !== expected.length) return false;
  return actual.length === expected.length && actual.every(value => expected.includes(value));
};

const objectiveAnswerIsCorrect = (question: Question, actual: Answer | undefined): boolean => {
  switch (question.type) {
    case 'multiple-choice':
    case 'true-false':
      return typeof actual === 'string' && actual === question.correctAnswer;
    case 'multiple-select':
      return unorderedSetEquals(actual, question.correctAnswer);
    case 'ordering':
    case 'matching':
      return orderedEquals(actual, question.correctAnswer);
    default:
      return false;
  }
};

/**
 * Local, deterministic scoring of objective responses only.
 * Subjective responses are never automatically marked correct by text equality.
 * No database, network, or AI provider is involved.
 */
export function scoreAssessment(questions: readonly Question[], answers: Readonly<StudentAnswer>): AssessmentScore {
  const seenIds = new Set<string>();
  let awardedPoints = 0;
  let totalPoints = 0;
  let pendingReviewPoints = 0;
  const items: ItemScore[] = [];

  for (const question of questions) {
    if (seenIds.has(question.id)) throw new Error('Duplicate question id: ' + question.id);
    seenIds.add(question.id);
    if (!Number.isFinite(question.points) || question.points < 0) {
      throw new Error('Invalid points for question: ' + question.id);
    }

    totalPoints += question.points;
    const answer = answers[question.id];
    let status: ItemScoreStatus;
    let earned = 0;

    if (!isAnswered(answer)) {
      status = 'unanswered';
    } else if (requiresHumanReview(question.type)) {
      status = 'needs-review';
      pendingReviewPoints += question.points;
    } else if (objectiveAnswerIsCorrect(question, answer)) {
      status = 'correct';
      earned = question.points;
    } else {
      status = 'incorrect';
    }

    awardedPoints += earned;
    items.push({ questionId: question.id, status, awardedPoints: earned, maxPoints: question.points });
  }

  return {
    awardedPoints,
    totalPoints,
    pendingReviewPoints,
    status: pendingReviewPoints > 0 ? 'needs-review' : 'final',
    items,
  };
}
