import assert from 'node:assert/strict';
import { test } from 'node:test';
import { aggregateSkillMetrics } from '../src/domain/analytics/skillMetrics.ts';

const question = (id, skillTags, points = 5) => ({
  id, skillTags, points, ownerId: 'teacher-1', text: 'Demo question',
  category: 'Demo', subCategory: 'Math', type: 'multiple-choice',
  correctAnswer: 'A', tags: [], status: 'approved',
});
const snapshot = (id, userId, status, earned, options = {}) => {
  const exam = {
    id: 'exam-1', ownerId: 'teacher-1', title: 'Synthetic quiz',
    description: '', duration: 10, difficulty: 'Easy',
    questions: [question('item-1', options.skills ?? ['addition'])], questionCount: 1,
  };
  const result = {
    id, examId: exam.id, userId, gradingStatus: status,
    itemScores: [{questionId: 'item-1', status: earned ? 'correct' : 'incorrect', awardedPoints: earned, maxPoints: 5}],
  };
  return {result, examSnapshot:exam};
};

test('requires distinct students and only reveals a share with enough evidence', () => {
  const metrics = aggregateSkillMetrics([
    snapshot('r1','student-a','final',5),
    snapshot('r2','student-b','final',0),
    snapshot('r3','student-c','final',5),
  ]);
  assert.equal(metrics.length, 1);
  assert.equal(metrics[0].distinctStudents, 3);
  assert.equal(metrics[0].eligibleAttempts, 3);
  assert.equal(metrics[0].gradeShare, 10 / 15);
  assert.equal(metrics[0].evidenceStatus, 'sufficient');
});

test('one student taking multiple tests cannot satisfy the evidence threshold', () => {
  const metrics = aggregateSkillMetrics([
    snapshot('r1','student-a','final',5),
    snapshot('r2','student-a','final',0),
    snapshot('r3','student-a','final',5),
  ]);
  assert.equal(metrics[0].eligibleAttempts, 3);
  assert.equal(metrics[0].distinctStudents, 1);
  assert.equal(metrics[0].gradeShare, null);
  assert.equal(metrics[0].evidenceStatus, 'insufficient-evidence');
});

test('excludes pending teacher review and unverified legacy demo results', () => {
  const metrics = aggregateSkillMetrics([
    snapshot('r1','a','final',5),
    snapshot('r2','b','needs-review',5),
    snapshot('r3','c',undefined,0),
  ]);
  assert.equal(metrics[0].eligibleAttempts, 1);
  assert.equal(metrics[0].gradeShare, null);
});

test('cannot infer a skill that was never explicitly tagged', () => {
  assert.deepEqual(aggregateSkillMetrics([snapshot('r1','a','final',5,{skills:[]})]),[]);
});

test('refuses duplicate result IDs and invalid evidence thresholds', () => {
  assert.throws(() => aggregateSkillMetrics([
    snapshot('r1','a','final',5), snapshot('r1','b','final',5)
  ]), /Duplicate/);
  assert.throws(() => aggregateSkillMetrics([],1), /threshold/);
});

test('does not count malformed or mismatched result evidence', () => {
  const bad = snapshot('r1','a','final',5);
  bad.result.itemScores[0].awardedPoints = 7;
  const wrongExam = snapshot('r2','b','final',5);
  wrongExam.result.examId = 'another';
  assert.deepEqual(aggregateSkillMetrics([bad,wrongExam]),[]);
});

test('deduplicates repeated skill tags within a single question', () => {
  const result = aggregateSkillMetrics([
    snapshot('r1','a','final',5,{skills:['addition','addition']}),
    snapshot('r2','b','final',5,{skills:['addition']}),
    snapshot('r3','c','final',5,{skills:['addition']}),
  ]);
  assert.equal(result[0].scoredQuestions,3);
  assert.equal(result[0].possiblePoints,15);
});

test('includes manually reviewed scores only in finalized evidence', () => {
  const pending = snapshot('pending','a','needs-review',3);
  pending.result.itemScores[0].status = 'reviewed';
  pending.result.itemScores[0].awardedPoints = 3;
  const finalized = snapshot('finalized','b','final',3);
  finalized.result.itemScores[0].status = 'reviewed';
  finalized.result.itemScores[0].awardedPoints = 3;
  const metrics = aggregateSkillMetrics([pending, finalized, snapshot('r3','c','final',5)]);
  assert.equal(metrics[0].eligibleAttempts, 2);
  assert.equal(metrics[0].awardedPoints, 8);
  assert.equal(metrics[0].gradeShare, null);
  assert.equal(metrics[0].evidenceStatus, 'insufficient-evidence');
});
