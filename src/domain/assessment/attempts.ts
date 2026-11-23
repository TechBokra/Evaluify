import type { Answer, Exam, StudentAnswer } from '../../types.ts';
import { scoreAssessment, type AssessmentScore } from './scoring.ts';

/**
 * Local prototype submission contract. This is deliberately NOT an authorization layer:
 * trusted tenant/student authorization and durable storage remain future backend work.
 */
export interface AttemptSubmission {
  submissionKey: string;
  userId: string;
  userName: string;
  answers: Readonly<StudentAnswer>;
}
export interface SubmittedAttempt {
  id: string;
  submissionKey: string;
  examId: string;
  userId: string;
  userName: string;
  submittedAt: string;
  answers: StudentAnswer;
  examSnapshot: Exam;
  grading: AssessmentScore;
}

export interface AttemptRepository {
  find(examId: string, userId: string, submissionKey: string): SubmittedAttempt | undefined;
  findById(id: string): SubmittedAttempt | undefined;
  save(attempt: SubmittedAttempt): void;
}

const clone = <T>(value: T): T => structuredClone(value);
const scopedKey = (examId: string, userId: string, submissionKey: string) =>
  JSON.stringify([examId, userId, submissionKey]);

/** Ephemeral in-memory adapter for single-session demonstrations only. */
export function createInMemoryAttemptRepository(): AttemptRepository {
  const byScope = new Map<string, SubmittedAttempt>();
  const byId = new Map<string, SubmittedAttempt>();
  return {
    find(examId, userId, submissionKey) {
      const found = byScope.get(scopedKey(examId, userId, submissionKey));
      return found ? clone(found) : undefined;
    },
    findById(id) {
      const found = byId.get(id);
      return found ? clone(found) : undefined;
    },
    save(attempt) {
      const key = scopedKey(attempt.examId, attempt.userId, attempt.submissionKey);
      if (byScope.has(key) || byId.has(attempt.id)) {
        throw new Error('Attempt was already submitted');
      }
      const saved = clone(attempt);
      byScope.set(key, saved);
      byId.set(saved.id, saved);
    },
  };
}

/**
 * First successful submit for (exam, student, submissionKey) wins.
 * Retrying that key returns the original frozen-in-time answers and evaluation.
 * No client-supplied score is accepted.
 */
export function submitAssessmentAttempt(
  exam: Readonly<Exam>,
  submission: AttemptSubmission,
  repository: AttemptRepository,
  options: { now?: () => Date; newId?: () => string } = {},
): SubmittedAttempt {
  if (!exam.id.trim() || !submission.userId.trim() || !submission.submissionKey.trim()) {
    throw new Error('Missing submission identity');
  }
  const previous = repository.find(exam.id, submission.userId, submission.submissionKey);
  if (previous) return previous;

  const examSnapshot = clone(exam);
  const answers = clone(submission.answers);
  const grading = scoreAssessment(examSnapshot.questions, answers);
  const attempt: SubmittedAttempt = {
    id: (options.newId ?? (() => crypto.randomUUID()))(),
    submissionKey: submission.submissionKey,
    examId: exam.id,
    userId: submission.userId,
    userName: submission.userName,
    submittedAt: (options.now ?? (() => new Date()))().toISOString(),
    answers,
    examSnapshot,
    grading,
  };
  repository.save(attempt);
  return clone(attempt);
}
