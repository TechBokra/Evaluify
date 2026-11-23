import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAttemptService, MemoryAttemptRepository } from '../src/domain/assessment/attempts.ts';
import { getDisplayScore, getVerifiedPercentage, getDisplayItemStatus } from '../src/domain/assessment/resultPresentation.ts';

const exam = () => ({
  id: 'test-exam', ownerId: 'demo-teacher', title: 'Synthetic practice',
  description: '', duration: 10, difficulty: 'Easy', questionCount: 2,
  questions: [
    { id: 'a', ownerId: 'demo-teacher', text: 'Choice?', type: 'multiple-choice',
      category: 'Demo', subCategory: 'Demo', correctAnswer: 'B', points: 4, tags: [] },
    { id: 'b', ownerId: 'demo-teacher', text: 'Explain?', type: 'essay',
      category: 'Demo', subCategory: 'Demo', correctAnswer: 'Model answer', points: 6, tags: [] },
  ],
});

const setup = () => {
  let nextId = 0;
  const repository = new MemoryAttemptRepository();
  const service = createAttemptService(repository, {
    newId: () => String(++nextId),
    now: () => new Date('2026-11-23T12:00:00.000Z'),
  });
  return { repository, service };
};
const command = (overrides = {}) => ({
  attemptId: 'attempt-1', exam: exam(), userId: 'student-a', userName: 'Synthetic Student',
  answers: { a: 'B', b: 'Some explanation' }, proctoringEvents: [], ...overrides,
});

test('marks subjective work pending and never publishes a final percentage', () => {
  const { service } = setup();
  const { result } = service.submit(command());
  assert.equal(result.score, 4);
  assert.equal(result.totalPoints, 10);
  assert.equal(result.pendingReviewPoints, 6);
  assert.equal(result.gradingStatus, 'needs-review');
  assert.equal(getVerifiedPercentage(result), null);
  assert.match(getDisplayScore(result), /Awaiting teacher review/);
  assert.equal(getDisplayItemStatus(result, 'b'), 'needs-review');
});

test('retry of identical submission is idempotent and retains the same identity and time', () => {
  const { service } = setup();
  const first = service.submit(command());
  const second = service.submit(command({ answers: { b: 'Some explanation', a: 'B' } }));
  assert.equal(first.result.id, second.result.id);
  assert.equal(first.result.submittedAt.toISOString(), second.result.submittedAt.toISOString());
  assert.equal(service.findByResultId(first.result.id)?.result.id, first.result.id);
});

test('reuse of same attempt with different answers is rejected', () => {
  const { service } = setup();
  service.submit(command());
  assert.throws(() => service.submit(command({ answers: { a: 'A', b: 'Some explanation' } })), /already submitted/);
});

test('distinct students and attempt identifiers create independent attempts', () => {
  const { service } = setup();
  const a = service.submit(command());
  const b = service.submit(command({ userId: 'student-b' }));
  const c = service.submit(command({ attemptId: 'attempt-2' }));
  assert.equal(new Set([a.result.id, b.result.id, c.result.id]).size, 3);
});

test('repository isolates snapshots from subsequent edits to draft and fetched records', () => {
  const { service } = setup();
  const input = command();
  const first = service.submit(input);
  input.exam.questions[0].text = 'Mutated after submission';
  input.answers.a = 'A';
  first.examSnapshot.questions[0].text = 'Mutated caller response';
  first.result.answers.a = 'A';
  const stored = service.findByResultId(first.result.id);
  assert.equal(stored.examSnapshot.questions[0].text, 'Choice?');
  assert.equal(stored.result.answers.a, 'B');
});

test('objective-only submission is verified final', () => {
  const { service } = setup();
  const input = command();
  input.exam.questions = [input.exam.questions[0]];
  input.answers = { a: 'B' };
  const { result } = service.submit(input);
  assert.equal(result.gradingStatus, 'final');
  assert.equal(getVerifiedPercentage(result), 100);
  assert.equal(getDisplayItemStatus(result, 'a'), 'correct');
});

test('legacy results are clearly marked as unverified demo data', () => {
  const legacy = { score: 10, totalPoints: 20, answers: {} };
  assert.equal(getVerifiedPercentage(legacy), null);
  assert.equal(getDisplayItemStatus(legacy, 'q1'), 'unverified-demo');
  assert.equal(getDisplayScore(legacy), 'Unverified demo result');
});

test('rejects missing identity and invalid question data', () => {
  const { service } = setup();
  assert.throws(() => service.submit(command({ userId: '' })), /identity/);
  const invalid = command();
  invalid.exam.questions[0].points = -4;
  assert.throws(() => service.submit(invalid), /Invalid points/);
});
