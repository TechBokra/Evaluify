import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asQuestionDraft, approveQuestionDraft, validateQuestionForApproval } from '../src/domain/questions/editorial.ts';

const makeQuestion = (overrides = {}) => ({
  id: 'item-1', ownerId: 'teacher-1', text: 'Synthetic example',
  type: 'multiple-choice', category: 'Demo', subCategory: 'Numbers',
  options: ['One','Two'], correctAnswer: 'Two', points: 2,
  tags: ['math'], status: 'approved', ...overrides,
});

test('new or edited questions become draft without mutating source', () => {
  const original = makeQuestion();
  const changed = asQuestionDraft(original);
  assert.equal(changed.status, 'draft');
  assert.equal(original.status, 'approved');
  changed.options[0] = 'Changed';
  assert.equal(original.options[0], 'One');
});

test('valid manual review transitions a draft to approved without mutating it', () => {
  const original = asQuestionDraft(makeQuestion());
  const approved = approveQuestionDraft(original, 'teacher-1');
  assert.equal(approved.status, 'approved');
  assert.equal(original.status, 'draft');
  assert.deepEqual(validateQuestionForApproval(original), []);
});

test('approval fails for missing required fields or incorrect MCQ answer', () => {
  const question = makeQuestion({correctAnswer: 'Three', points: 0});
  const errors = validateQuestionForApproval(question).join(' ');
  assert.match(errors, /Points/);
  assert.match(errors, /Multiple-choice/);
  assert.throws(() => approveQuestionDraft(question, 'teacher-1'), /Points/);
});

test('review rejects duplicate choices and duplicate multi-select answers', () => {
  const question = makeQuestion({type: 'multiple-select', options: ['A','B'], correctAnswer: ['A','A']});
  assert.ok(validateQuestionForApproval(question).length);
  question.correctAnswer = ['B','A'];
  assert.deepEqual(validateQuestionForApproval(question), []);
});

test('subjective items must have a model rubric but remain human-graded', () => {
  assert.ok(validateQuestionForApproval(makeQuestion({type:'essay',correctAnswer:''})).length);
  const approved = approveQuestionDraft(makeQuestion({type:'essay',correctAnswer:'Review rubric'}), 'teacher-1');
  assert.equal(approved.status, 'approved');
});

test('approval refuses cross-owner requests', () => {
  assert.throws(() => approveQuestionDraft(makeQuestion(), 'teacher-2'), /owner mismatch/);
});

test('ordering and matching answer keys require complete structures', () => {
  assert.deepEqual(validateQuestionForApproval(makeQuestion({
    type:'ordering',options:['first','second'],correctAnswer:['first','second']
  })),[]);
  assert.ok(validateQuestionForApproval(makeQuestion({
    type:'matching',prompts:['A','B'],options:['1','2'],correctAnswer:['1']
  })).length);
  assert.deepEqual(validateQuestionForApproval(makeQuestion({
    type:'matching',prompts:['A','B'],options:['1','2'],correctAnswer:['1','2']
  })),[]);
});
