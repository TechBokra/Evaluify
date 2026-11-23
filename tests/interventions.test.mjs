import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recordTeacherIntervention, compareTeacherFollowUp } from '../src/domain/improve/interventions.ts';

const metric = (overrides = {}) => ({
  skill: 'fractions', eligibleAttempts: 4, distinctStudents: 4,
  scoredQuestions: 4, awardedPoints: 12, possiblePoints: 20,
  gradeShare: 0.6, evidenceStatus: 'sufficient', ...overrides,
});
const input = (overrides = {}) => ({
  id: 'intervention-1', teacherId: 'teacher-demo', decision: 'accept',
  description: 'Give a revision exercise', decidedAt: '2026-11-23T14:00:00.000Z',
  ...overrides,
});

test('records an explicit teacher intervention without changing the source evidence', () => {
  const evidence = metric();
  const intervention = recordTeacherIntervention(evidence,input());
  evidence.gradeShare = 0.1;
  assert.equal(intervention.baseline.gradeShare,0.6);
  assert.equal(intervention.decision,'accept');
  assert.ok(Object.isFrozen(intervention));
});

test('never auto-accepts a recommendation backed by insufficient evidence', () => {
  const poor = metric({evidenceStatus:'insufficient-evidence',gradeShare:null,distinctStudents:1});
  assert.throws(() => recordTeacherIntervention(poor,input()), /insufficient/);
  const rejected = recordTeacherIntervention(poor,input({decision:'reject',description:'Not enough data'}));
  assert.equal(rejected.decision,'reject');
});

test('requires teacher identity, a dated decision, and a described accepted action', () => {
  assert.throws(() => recordTeacherIntervention(metric(),input({teacherId:''})), /Teacher/);
  assert.throws(() => recordTeacherIntervention(metric(),input({decidedAt:'no-date'})), /date/);
  assert.throws(() => recordTeacherIntervention(metric(),input({description:' '})), /description/);
});

test('compares labeled follow-up cohorts as descriptive scores only', () => {
  const decision = recordTeacherIntervention(metric(),input());
  const after = metric({gradeShare:0.8, awardedPoints:16});
  const result = compareTeacherFollowUp(decision,after,'cohort-a','cohort-a');
  assert.equal(result.status,'descriptive-only');
  assert.equal(result.changePercentagePoints,20);
  assert.equal(result.causalAttribution,false);
});

test('refuses to produce a progress delta for different cohorts or insufficient results', () => {
  const decision = recordTeacherIntervention(metric(),input());
  const different = compareTeacherFollowUp(decision,metric({gradeShare:0.9}),'cohort-a','cohort-b');
  assert.equal(different.status,'not-comparable');
  assert.equal(different.changePercentagePoints,null);
  const small = compareTeacherFollowUp(decision,metric({gradeShare:null,evidenceStatus:'insufficient-evidence'}),'cohort-a','cohort-a');
  assert.equal(small.changePercentagePoints,null);
});

test('rejects skill mismatch and actions declined by the teacher', () => {
  const accepted = recordTeacherIntervention(metric(),input());
  assert.throws(() => compareTeacherFollowUp(accepted,metric({skill:'geometry'}),'a','a'), /different skills/);
  const declined = recordTeacherIntervention(metric(),input({decision:'reject',description:'Teacher disagrees'}));
  assert.throws(() => compareTeacherFollowUp(declined,metric(),'a','a'), /rejected/);
});
