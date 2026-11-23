import type { SkillMetric } from '../analytics/skillMetrics.ts';

export type TeacherDecisionKind = 'accept' | 'modify' | 'reject';

export interface TeacherIntervention {
  id: string;
  teacherId: string;
  skill: string;
  decision: TeacherDecisionKind;
  description: string;
  decidedAt: string;
  baseline: Readonly<SkillMetric>;
}

export interface FollowUpComparison {
  skill: string;
  status: 'descriptive-only' | 'not-comparable';
  baselineGradeShare: number | null;
  followUpGradeShare: number | null;
  changePercentagePoints: number | null;
  causalAttribution: false;
  reason: string;
}

export function recordTeacherIntervention(
  evidence: Readonly<SkillMetric>,
  input: {
    id: string;
    teacherId: string;
    decision: TeacherDecisionKind;
    description: string;
    decidedAt: string;
  },
): TeacherIntervention {
  if (!input.id.trim() || !input.teacherId.trim()) throw new Error('Teacher and decision ID are required');
  if (!Number.isFinite(Date.parse(input.decidedAt))) throw new Error('Invalid decision date');
  if (!['accept','modify','reject'].includes(input.decision)) throw new Error('Unsupported teacher decision');
  if (!evidence.skill.trim()) throw new Error('Skill is required');
  if (evidence.evidenceStatus !== 'sufficient' && input.decision !== 'reject') {
    throw new Error('Evidence is insufficient to accept or modify a generated recommendation');
  }
  if (input.decision !== 'reject' && !input.description.trim()) {
    throw new Error('An intervention description is required');
  }
  const record: TeacherIntervention = {
    id: input.id, teacherId: input.teacherId, skill: evidence.skill,
    decision: input.decision, description: input.description.trim(),
    decidedAt: input.decidedAt, baseline: structuredClone(evidence),
  };
  Object.freeze(record.baseline);
  return Object.freeze(record);
}

/**
 * This comparison is descriptive only. Matching cohort labels are supplied by
 * the caller and are not evidence of randomized treatment or causation.
 */
export function compareTeacherFollowUp(
  intervention: Readonly<TeacherIntervention>,
  followUp: Readonly<SkillMetric>,
  baselineCohortId: string,
  followUpCohortId: string,
): FollowUpComparison {
  if (intervention.decision === 'reject') throw new Error('A rejected intervention has no follow-up action');
  if (intervention.skill !== followUp.skill) throw new Error('Cannot compare different skills');

  const baseline = intervention.baseline;
  const comparable = baseline.evidenceStatus === 'sufficient' &&
    followUp.evidenceStatus === 'sufficient' &&
    baseline.gradeShare !== null && followUp.gradeShare !== null &&
    !!baselineCohortId.trim() && baselineCohortId === followUpCohortId;

  return {
    skill: intervention.skill,
    status: comparable ? 'descriptive-only' : 'not-comparable',
    baselineGradeShare: comparable ? baseline.gradeShare : null,
    followUpGradeShare: comparable ? followUp.gradeShare : null,
    changePercentagePoints: comparable
      ? Math.round((followUp.gradeShare! - baseline.gradeShare!) * 1000) / 10
      : null,
    causalAttribution: false,
    reason: comparable
      ? 'Observed score difference within a labeled cohort; no causal attribution'
      : 'Cohort mismatch, missing evidence, or unverified scores',
  };
}
