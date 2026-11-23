import type { Question, QuestionStatus } from '../../types.ts';

/**
 * Editorial rules for the teacher-first prototype. These are content checks,
 * NOT authentication, curriculum alignment, or a guarantee of correctness.
 */
const draft = 'draft' as QuestionStatus;
const approved = 'approved' as QuestionStatus;

export function asQuestionDraft(question: Readonly<Question>): Question {
  return { ...structuredClone(question), status: draft };
}

const hasUniqueNonBlank = (values: readonly string[] | undefined, minimum: number) =>
  Array.isArray(values) &&
  values.length >= minimum &&
  values.every(value => typeof value === 'string' && value.trim().length > 0) &&
  new Set(values).size === values.length;

/** Validate the *structure* of the answer key, not the academic truth of its content. */
export function validateQuestionForApproval(question: Readonly<Question>): string[] {
  const problems: string[] = [];
  if (!question.text.trim()) problems.push('Question text is required');
  if (!question.category.trim() || !question.subCategory.trim()) problems.push('Question category is required');
  if (!Number.isFinite(question.points) || question.points <= 0) problems.push('Points must be positive');
  if (!question.ownerId.trim() || !question.id.trim()) problems.push('Question identity is required');

  if (!question.rightsBasis || !['original', 'licensed', 'open-license'].includes(question.rightsBasis)) {
    problems.push('Content rights basis is required');
  } else if (question.rightsBasis !== 'original' && !question.sourceTitle?.trim()) {
    problems.push('Third-party content source is required');
  }

  const answer = question.correctAnswer;
  switch (question.type) {
    case 'multiple-choice':
      if (!hasUniqueNonBlank(question.options, 2) || typeof answer !== 'string' || !question.options?.includes(answer)) {
        problems.push('Multiple-choice options and answer key must be valid');
      }
      break;
    case 'multiple-select':
      if (!hasUniqueNonBlank(question.options, 2) || !Array.isArray(answer) ||
          !hasUniqueNonBlank(answer, 1) || !answer.every(value => question.options?.includes(value))) {
        problems.push('Multiple-select answers must be distinct listed options');
      }
      break;
    case 'true-false':
      if (answer !== 'True' && answer !== 'False') problems.push('True/false answer must be selected');
      break;
    case 'true-false-justification':
      if (!answer || Array.isArray(answer) || typeof answer !== 'object' ||
          !['True', 'False'].includes(answer.selection) || !answer.justification.trim()) {
        problems.push('Justification and true/false answer are required');
      }
      break;
    case 'short-answer':
    case 'essay':
      if (typeof answer !== 'string' || !answer.trim()) problems.push('Model answer or rubric is required');
      break;
    case 'ordering':
      if (!hasUniqueNonBlank(question.options, 2) || !Array.isArray(answer) ||
          answer.length !== question.options?.length ||
          !answer.every((option, index) => option === question.options?.[index])) {
        problems.push('Ordering question must have a consistent ordered key');
      }
      break;
    case 'matching':
      if (!hasUniqueNonBlank(question.prompts, 2) || !hasUniqueNonBlank(question.options, 2) ||
          !Array.isArray(answer) || answer.length !== question.prompts?.length ||
          !answer.every(value => question.options?.includes(value))) {
        problems.push('Matching question needs prompts and a complete key');
      }
      break;
    default:
      problems.push('Unsupported question type');
  }
  return problems;
}

/**
 * Teacher acknowledgment that the draft structure was reviewed.
 * Real teacher authorization, content provenance, and rights checks remain
 * backend responsibilities, and are not implied by this local demo action.
 */
export function approveQuestionDraft(question: Readonly<Question>, editorOwnerId: string): Question {
  if (!editorOwnerId || question.ownerId !== editorOwnerId) {
    throw new Error('Question owner mismatch');
  }
  const errors = validateQuestionForApproval(question);
  if (errors.length) throw new Error(errors.join('; '));
  return { ...structuredClone(question), status: approved };
}
