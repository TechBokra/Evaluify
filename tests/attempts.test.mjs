import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInMemoryAttemptRepository, submitAssessmentAttempt } from '../src/domain/assessment/attempts.ts';

const sampleExam = () => ({
  id: 'exam-1', ownerId: 'teacher-demo', title: 'Synthetic demo',
  description: 'Not a live assessment', duration: 20, difficulty: 'Easy', questionCount: 2,
  questions: [
    { id: 'mc', text: 'Example MCQ', ownerId: 'teacher-demo', type: 'multiple-choice',
      category: 'Demo', subCategory: 'Demo', correctAnswer: 'A', options: ['A','B'],
      points: 4, tags: [], status: 'approved' },
    { id: 'essay', text: 'Example essay', ownerId: 'teacher-demo', type: 'essay',
      category: 'Demo', subCategory: 'Demo', correctAnswer: 'Model answer',
      points: 6, tags: [], status: 'approved' },
  ],
});
const submission = (key = 'submit-1', answers = { mc: 'A', essay: 'Model answer' }) =>
  ({ submissionKey: key, userId: 'student-demo', userName: 'Demo Student', answers });

test('submits objective score with review pending for subjective items', () => {
  const store = createInMemoryAttemptRepository();
  const result = submitAssessmentAttempt(sampleExam(), submission(), store, {
    now: () => new Date('2026-11-23T12:00:00.000Z'), newId: () => 'attempt-1',
  });
  assert.equal(result.grading.awardedPoints, 4);
  assert.equal(result.grading.pendingReviewPoints, 6);
  assert.equal(result.grading.status, 'needs-review');
  assert.equal(result.grading.totalPoints, 10);
  assert.equal(result.id, 'attempt-1');
  assert.equal(result.submittedAt, '2026-11-23T12:00:00.000Z');
});

test('retrying one submission key returns the same attempt, even if answers change', () => {
  const store = createInMemoryAttemptRepository();
  const exam = sampleExam();
  const first = submitAssessmentAttempt(exam, submission(), store, {newId: () => 'attempt-1'});
  const retried = submitAssessmentAttempt(exam, submission('submit-1', {mc: 'B'}), store,
    {newId: () => 'attempt-2'});
  assert.equal(retried.id, first.id);
  assert.equal(retried.grading.awardedPoints, 4);
  assert.deepEqual(retried.answers, {mc: 'A', essay: 'Model answer'});
  assert.equal(store.findById('attempt-2'), undefined);
});

test('a distinct submission key permits a distinct local attempt', () => {
  const store = createInMemoryAttemptRepository();
  const exam = sampleExam();
  const a = submitAssessmentAttempt(exam, submission('key-a'), store, {newId: () => 'a'});
  const b = submitAssessmentAttempt(exam, submission('key-b', {mc: 'B'}), store, {newId: () => 'b'});
  assert.notEqual(a.id, b.id);
  assert.equal(b.grading.awardedPoints, 0);
});

test('student and exam scope keep identical request keys distinct', () => {
  const store = createInMemoryAttemptRepository();
  const a = submitAssessmentAttempt(sampleExam(), submission(), store, {newId: () => 'a'});
  const b = submitAssessmentAttempt(sampleExam(), {...submission(), userId: 'another-student'}, store, {newId: () => 'b'});
  const otherExam = {...sampleExam(), id: 'exam-2'};
  const c = submitAssessmentAttempt(otherExam, submission(), store, {newId: () => 'c'});
  assert.deepEqual([a.id,b.id,c.id], ['a','b','c']);
});

test('attempts preserve the exam and answer snapshot despite caller mutations', () => {
  const store = createInMemoryAttemptRepository();
  const exam = sampleExam();
  const answers = {mc: 'A', essay: 'Review this'};
  const saved = submitAssessmentAttempt(exam, submission('save', answers), store, {newId: () => 'saved'});
  exam.questions[0].correctAnswer = 'B';
  answers.mc = 'B';
  saved.answers.mc = 'B';
  assert.equal(store.findById('saved').examSnapshot.questions[0].correctAnswer, 'A');
  assert.equal(store.findById('saved').answers.mc, 'A');
  assert.equal(store.findById('saved').grading.awardedPoints, 4);
});

test('attempt repository rejects overwriting the same stored attempt', () => {
  const store = createInMemoryAttemptRepository();
  const saved = submitAssessmentAttempt(sampleExam(), submission(), store, {newId: () => 'persisted'});
  assert.throws(() => store.save(saved), /already submitted/);
});

test('missing submission key or student identity is rejected', () => {
  const store = createInMemoryAttemptRepository();
  assert.throws(() => submitAssessmentAttempt(sampleExam(), submission(''), store), /identity/);
  assert.throws(() => submitAssessmentAttempt(sampleExam(), {...submission(),userId:''},store), /identity/);
});
