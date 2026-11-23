import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseQuestionsCsv } from '../src/domain/content/questionCsv.ts';

const header = 'text,type,correct_answer,options,points,category,sub_category,rights_basis,source_title,tags,skills';
const row = 'What is 2 plus 2?,multiple-choice,4,3|4|5,5,Math,Arithmetic,original,,addition|practice,addition';

test('imports a synthetic multiple-choice question with provenance', () => {
  const [q] = parseQuestionsCsv(header + '\n' + row);
  assert.equal(q.text, 'What is 2 plus 2?');
  assert.equal(q.correctAnswer, '4');
  assert.deepEqual(q.skillTags, ['addition']);
  assert.equal(q.rightsBasis, 'original');
});

test('handles BOM, quoted commas, escaped quotes, and CRLF', () => {
  const source = '\uFEFF' + header + '\r\n' +
    '"How many are ""two, two""?",multiple-choice,4,3|4|5,5,Math,Arithmetic,original,,numbers,arithmetic\r\n';
  const [q] = parseQuestionsCsv(source);
  assert.equal(q.text, 'How many are "two, two"?');
});

test('does not split quoted multiline question text into extra records', () => {
  const source = header + '\n' +
    '"What is the result of\n2+2?",multiple-choice,4,3|4|5,5,Math,Arithmetic,original,,demo,arithmetic\n';
  const [q] = parseQuestionsCsv(source);
  assert.match(q.text, /\n/);
});

test('supports ordered-independent multiple-select answers and true-false', () => {
  const result = parseQuestionsCsv(header + '\n' +
    'Choose two correct items,multiple-select,B|A,A|B|C,4,Math,Logic,licensed,Sample permission,,logic\n' +
    'The sun is a star,true-false,True,,2,Science,Astronomy,original,,,\n');
  assert.deepEqual(result[0].correctAnswer, ['B', 'A']);
  assert.deepEqual(result[1].options, ['True', 'False']);
});

test('rejects malformed answers, sources, headers, and quoted fields', () => {
  assert.throws(() => parseQuestionsCsv(header + '\n' + row.replace('3|4|5','3|5|6')), /answer must match/);
  assert.throws(() => parseQuestionsCsv(header + '\n' + row.replace('original','licensed')), /source_title/);
  assert.throws(() => parseQuestionsCsv(header + '\n' + row.replace('original','unknown')), /rights basis/);
  assert.throws(() => parseQuestionsCsv('text,wrong\nhello,wrong'), /header|Missing/);
  assert.throws(() => parseQuestionsCsv(header + '\n"missing end'), /Unclosed CSV quote/);
});

test('rejects suspicious field counts and duplicate choices', () => {
  assert.throws(() => parseQuestionsCsv(header + '\n' + row + ',extra'), /number of fields/);
  assert.throws(() => parseQuestionsCsv(header + '\n' + row.replace('3|4|5','3|4|4')), /unique options/);
});

test('rejects invalid point values and batches exceeding 50 questions', () => {
  assert.throws(() => parseQuestionsCsv(header + '\n' + row.replace(',5,Math',',0,Math')), /points/);
  assert.throws(() => parseQuestionsCsv(header + '\n' + Array(51).fill(row).join('\n')), /at most 50/);
});
