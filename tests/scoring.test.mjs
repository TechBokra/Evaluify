import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scoreAssessment } from '../src/domain/assessment/scoring.ts';

const question = (id, type, correctAnswer, points = 5) => ({
  id, type, correctAnswer, points,
  ownerId: 'teacher-test', text: 'Synthetic test question',
  category: 'Demo', subCategory: 'Demo', tags: [],
});

test('grades objective questions and ignores multi-select ordering', () => {
  const questions = [
    question('mc', 'multiple-choice', 'B', 4),
    question('ms', 'multiple-select', ['A', 'C'], 6),
    question('tf', 'true-false', 'False', 2),
  ];
  const result = scoreAssessment(questions, { mc: 'B', ms: ['C', 'A'], tf: 'True' });
  assert.equal(result.awardedPoints, 10);
  assert.equal(result.totalPoints, 12);
  assert.equal(result.pendingReviewPoints, 0);
  assert.equal(result.status, 'final');
  assert.deepEqual(result.items.map(item => item.status), ['correct', 'correct', 'incorrect']);
});

test('does not award a duplicated selection or an incorrectly ordered answer', () => {
  const result = scoreAssessment([
    question('ms', 'multiple-select', ['A', 'B']),
    question('ord', 'ordering', ['first', 'second']),
  ], { ms: ['A', 'A'], ord: ['second', 'first'] });
  assert.equal(result.awardedPoints, 0);
  assert.deepEqual(result.items.map(item => item.status), ['incorrect', 'incorrect']);
});

test('leaves subjective answers pending human review, even if text matches model answer', () => {
  const result = scoreAssessment([
    question('short', 'short-answer', 'Cairo', 3),
    question('essay', 'essay', 'Ideal essay', 10),
    question('justified', 'true-false-justification', {selection: 'True', justification: 'Because'}, 2),
  ], { short: 'Cairo', essay: 'Ideal essay', justified: {selection: 'True', justification: 'Because'} });
  assert.equal(result.awardedPoints, 0);
  assert.equal(result.pendingReviewPoints, 15);
  assert.equal(result.status, 'needs-review');
  assert.ok(result.items.every(item => item.status === 'needs-review'));
});

test('unanswered questions award zero and do not create a pending review', () => {
  const result = scoreAssessment([
    question('mc', 'multiple-choice', 'A'), question('essay', 'essay', 'Example')
  ], { mc: null, essay: ' ' });
  assert.equal(result.awardedPoints, 0);
  assert.equal(result.pendingReviewPoints, 0);
  assert.deepEqual(result.items.map(item => item.status), ['unanswered', 'unanswered']);
});

test('rejects invalid points and duplicate question identifiers', () => {
  assert.throws(() => scoreAssessment([question('x', 'true-false', 'True', -1)], {}), /Invalid points/);
  assert.throws(() => scoreAssessment([question('x', 'true-false', 'True'), question('x', 'true-false', 'False')], {}), /Duplicate question/);
});

test('uses independent scoring for mixed objective and subjective questions', () => {
  const result = scoreAssessment([
    question('q1', 'true-false', 'True', 4),
    question('q2', 'essay', 'Example', 10),
  ], { q1: 'True', q2: 'Needs review' });
  assert.equal(result.awardedPoints, 4);
  assert.equal(result.totalPoints, 14);
  assert.equal(result.pendingReviewPoints, 10);
  assert.equal(result.status, 'needs-review');
});
