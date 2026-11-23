import type { Exam, ExamResult, ProctoringEvent, StudentAnswer } from '../../types.ts';
import { scoreAssessment } from './scoring.ts';

/** Local-only attempt service. Final authorization and persistence require a trusted backend. */
export interface SubmitAttemptCommand {
  attemptId: string;
  exam: Exam;
  userId: string;
  userName: string;
  answers: StudentAnswer;
  proctoringEvents?: ProctoringEvent[];
}

export interface AttemptRecord {
  readonly key: string;
  readonly answerFingerprint: string;
  readonly result: ExamResult;
  readonly examSnapshot: Exam;
}

export interface AttemptRepository {
  getByKey(key: string): AttemptRecord | undefined;
  getByResultId(resultId: string): AttemptRecord | undefined;
  insert(record: AttemptRecord): void;
}

const clone = <T>(value: T): T => structuredClone(value);

export class MemoryAttemptRepository implements AttemptRepository {
  private readonly byKey = new Map<string, AttemptRecord>();
  private readonly byResultId = new Map<string, AttemptRecord>();

  getByKey(key: string): AttemptRecord | undefined {
    const found = this.byKey.get(key);
    return found && clone(found);
  }

  getByResultId(resultId: string): AttemptRecord | undefined {
    const found = this.byResultId.get(resultId);
    return found && clone(found);
  }

  insert(record: AttemptRecord): void {
    if (this.byKey.has(record.key) || this.byResultId.has(record.result.id)) {
      throw new Error('Attempt already exists');
    }
    const copy = clone(record);
    this.byKey.set(copy.key, copy);
    this.byResultId.set(copy.result.id, copy);
  }
}

export interface AttemptServiceOptions {
  now?: () => Date;
  newId?: () => string;
}

/** Sorted question keys make retries independent of object property insertion order. */
const fingerprint = (answers: Readonly<StudentAnswer>): string =>
  JSON.stringify(Object.keys(answers).sort().map(id => [id, answers[id]]));

export function createAttemptService(
  repository: AttemptRepository,
  options: AttemptServiceOptions = {},
) {
  const now = options.now ?? (() => new Date());
  const newId = options.newId ?? (() => crypto.randomUUID());

  return {
    submit(command: SubmitAttemptCommand): AttemptRecord {
      const { attemptId, exam, userId, userName, answers, proctoringEvents = [] } = command;
      if (!attemptId.trim() || !exam.id.trim() || !userId.trim() || !userName.trim()) {
        throw new Error('Attempt, exam, and student identity are required');
      }
      const key = JSON.stringify([exam.id, userId, attemptId]);
      const answerFingerprint = fingerprint(answers);
      const previous = repository.getByKey(key);
      if (previous) {
        if (previous.answerFingerprint !== answerFingerprint) {
          throw new Error('Attempt was already submitted with different answers');
        }
        return previous;
      }

      const examSnapshot = clone(exam);
      const frozenAnswers = clone(answers);
      const evaluation = scoreAssessment(examSnapshot.questions, frozenAnswers);
      const result: ExamResult = {
        id: 'res-' + newId(),
        examId: examSnapshot.id,
        examTitle: examSnapshot.title,
        userId,
        userName,
        submittedAt: now(),
        score: evaluation.awardedPoints,
        totalPoints: evaluation.totalPoints,
        answers: frozenAnswers,
        proctoringEvents: clone(proctoringEvents),
        gradingStatus: evaluation.status,
        pendingReviewPoints: evaluation.pendingReviewPoints,
        itemScores: evaluation.items,
      };
      const record: AttemptRecord = { key, answerFingerprint, result, examSnapshot };
      repository.insert(record);
      return clone(record);
    },
    findByResultId(resultId: string): AttemptRecord | undefined {
      return repository.getByResultId(resultId);
    },
  };
}
