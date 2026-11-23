import type { Answer, Exam, Question } from '../../types.ts';

/** A published quiz is a snapshot, not a live reference to a mutable bank item. */
export interface PublishedQuiz extends Readonly<Exam> {
  readonly version: number;
  readonly publishedAt: string;
  readonly questions: readonly Readonly<Question>[];
}

function snapshotAnswer(answer: Answer): Answer {
  if (Array.isArray(answer)) return [...answer];
  if (typeof answer === 'object' && answer !== null) return { ...answer };
  return answer;
}

function freezeDeep<T>(object: T): T {
  if (object && typeof object === 'object' && !Object.isFrozen(object)) {
    for (const value of Object.values(object)) freezeDeep(value);
    Object.freeze(object);
  }
  return object;
}

/**
 * Publish a versioned, independent snapshot of a teacher-approved exam.
 *
 * This pure function does not change repository state or provide authorization:
 * a trusted service must verify owner and content rights in a later phase.
 */
export function publishQuiz(draft: Readonly<Exam>, version: number, publishedAt: string): PublishedQuiz {
  if (!Number.isInteger(version) || version < 1) throw new Error('Publication version must be a positive integer');
  if (!Number.isFinite(Date.parse(publishedAt))) throw new Error('Invalid publication date');
  if (!draft.id.trim() || !draft.ownerId.trim() || !draft.title.trim()) throw new Error('Missing required quiz identity');
  if (!Number.isFinite(draft.duration) || draft.duration <= 0) throw new Error('Quiz duration must be positive');
  if (draft.questions.length === 0) throw new Error('Cannot publish an empty quiz');

  const ids = new Set<string>();
  const snapshot = draft.questions.map(question => {
    if (!question.id.trim() || ids.has(question.id)) throw new Error('Invalid or duplicate question id');
    ids.add(question.id);
    if (question.status !== 'approved') throw new Error('Only approved questions may be published');
    if (!question.text.trim()) throw new Error('Question text is required');
    if (!Number.isFinite(question.points) || question.points <= 0) throw new Error('Question points must be positive');

    return {
      ...question,
      options: question.options ? [...question.options] : undefined,
      prompts: question.prompts ? [...question.prompts] : undefined,
      tags: [...question.tags],
      correctAnswer: snapshotAnswer(question.correctAnswer),
    };
  });

  const published: PublishedQuiz = {
    ...draft,
    questions: snapshot,
    questionCount: snapshot.length,
    version,
    publishedAt,
  };
  return freezeDeep(published);
}
