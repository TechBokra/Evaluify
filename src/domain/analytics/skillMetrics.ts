import type { Exam, ExamResult } from '../../types.ts';

/** Input records must come from a trusted assessment snapshot and score journal. */
export interface ScoredAttemptSnapshot {
  result: Readonly<ExamResult>;
  examSnapshot: Readonly<Exam>;
}

export interface SkillMetric {
  skill: string;
  eligibleAttempts: number;
  distinctStudents: number;
  scoredQuestions: number;
  awardedPoints: number;
  possiblePoints: number;
  /** Descriptive grade share only, not proof of learning or causality. */
  gradeShare: number | null;
  evidenceStatus: 'sufficient' | 'insufficient-evidence';
}

interface MutableAccumulator {
  students: Set<string>;
  attempts: Set<string>;
  questions: number;
  awarded: number;
  possible: number;
}

/**
 * Aggregate only verified final results with explicit question skill tags.
 * Pending-review and unverified demo records cannot enter grade statistics.
 */
export function aggregateSkillMetrics(
  snapshots: readonly ScoredAttemptSnapshot[],
  minDistinctStudents = 3,
): SkillMetric[] {
  if (!Number.isInteger(minDistinctStudents) || minDistinctStudents < 2) {
    throw new Error('Evidence threshold must require at least two students');
  }

  const stats = new Map<string, MutableAccumulator>();
  const seenResultIds = new Set<string>();

  for (const { result, examSnapshot } of snapshots) {
    if (seenResultIds.has(result.id)) throw new Error('Duplicate attempt result: ' + result.id);
    seenResultIds.add(result.id);

    if (result.gradingStatus !== 'final' || !result.itemScores) continue;
    if (result.examId !== examSnapshot.id || !result.userId) continue;
    const questionById = new Map(examSnapshot.questions.map(question => [question.id, question]));

    for (const item of result.itemScores) {
      if (!['correct', 'incorrect', 'unanswered'].includes(item.status)) continue;
      if (!Number.isFinite(item.maxPoints) || item.maxPoints <= 0 ||
          !Number.isFinite(item.awardedPoints) || item.awardedPoints < 0 ||
          item.awardedPoints > item.maxPoints) continue;
      const question = questionById.get(item.questionId);
      if (!question) continue;
      const skillTags = [...new Set((question.skillTags ?? []).map(tag => tag.trim()).filter(Boolean))];
      for (const skill of skillTags) {
        const entry = stats.get(skill) ?? {
          students: new Set<string>(), attempts: new Set<string>(),
          questions: 0, awarded: 0, possible: 0,
        };
        entry.students.add(result.userId);
        entry.attempts.add(result.id);
        entry.questions++;
        entry.awarded += item.awardedPoints;
        entry.possible += item.maxPoints;
        stats.set(skill, entry);
      }
    }
  }

  return [...stats].map(([skill, values]) => ({
    skill,
    eligibleAttempts: values.attempts.size,
    distinctStudents: values.students.size,
    scoredQuestions: values.questions,
    awardedPoints: values.awarded,
    possiblePoints: values.possible,
    gradeShare: values.students.size >= minDistinctStudents && values.possible > 0
      ? values.awarded / values.possible
      : null,
    evidenceStatus: values.students.size >= minDistinctStudents && values.possible > 0
      ? 'sufficient' as const
      : 'insufficient-evidence' as const,
  })).sort((a, b) => a.skill.localeCompare(b.skill));
}
