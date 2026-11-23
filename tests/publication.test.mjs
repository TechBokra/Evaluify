import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publishQuiz } from '../src/domain/assessment/publication.ts';

const draftQuiz = () => ({
  id: 'demo-exam', ownerId: 'teacher-demo', title: 'Synthetic quiz',
  description: 'Fixture only', duration: 15, difficulty: 'Easy', questionCount: 1,
  questions: [{
    id: 'q1', ownerId: 'teacher-demo', text: 'Choose both answers', type: 'multiple-select',
    category: 'Math', subCategory: 'Fractions', options: ['A', 'B', 'C'],
    correctAnswer: ['A', 'C'], tags: ['fractions'], points: 2, status: 'approved',
  }],
});

test('publishes a frozen snapshot with a recorded version and correct count', () => {
  const draft = draftQuiz();
  draft.questionCount = 99;
  const published = publishQuiz(draft, 2, '2026-11-23T12:00:00.000Z');
  assert.equal(published.version, 2);
  assert.equal(published.questionCount, 1);
  assert.equal(published.questions[0].text, draft.questions[0].text);
  assert.ok(Object.isFrozen(published));
  assert.ok(Object.isFrozen(published.questions[0].correctAnswer));
});

test('changes to draft question and option arrays cannot rewrite a published quiz', () => {
  const draft = draftQuiz();
  const published = publishQuiz(draft, 1, '2026-11-23T12:00:00.000Z');
  draft.questions[0].text = 'Changed later';
  draft.questions[0].options[0] = 'Changed option';
  draft.questions[0].correctAnswer[0] = 'Changed answer';
  draft.questions[0].tags.push('later');
  assert.equal(published.questions[0].text, 'Choose both answers');
  assert.deepEqual(published.questions[0].options, ['A', 'B', 'C']);
  assert.deepEqual(published.questions[0].correctAnswer, ['A', 'C']);
  assert.deepEqual(published.questions[0].tags, ['fractions']);
});

test('rejects unapproved questions and invalid question points', () => {
  const draft = draftQuiz();
  draft.questions[0].status = 'draft';
  assert.throws(() => publishQuiz(draft, 1, '2026-11-23T12:00:00Z'), /Only approved/);
  draft.questions[0].status = 'approved';
  draft.questions[0].points = 0;
  assert.throws(() => publishQuiz(draft, 1, '2026-11-23T12:00:00Z'), /Question points/);
});

test('rejects empty exams and duplicate question identifiers', () => {
  const draft = draftQuiz();
  const clone = { ...draft.questions[0] };
  draft.questions.push(clone);
  assert.throws(() => publishQuiz(draft, 1, '2026-11-23T12:00:00Z'), /duplicate question id/);
  draft.questions = [];
  assert.throws(() => publishQuiz(draft, 1, '2026-11-23T12:00:00Z'), /empty quiz/);
});

test('rejects malformed versions, publication dates, and identities', () => {
  const draft = draftQuiz();
  assert.throws(() => publishQuiz(draft, 0, '2026-11-23T12:00:00Z'), /version/);
  assert.throws(() => publishQuiz(draft, 1.5, '2026-11-23T12:00:00Z'), /version/);
  assert.throws(() => publishQuiz(draft, 1, 'not-a-date'), /date/);
  draft.ownerId = '';
  assert.throws(() => publishQuiz(draft, 1, '2026-11-23T12:00:00Z'), /identity/);
});
