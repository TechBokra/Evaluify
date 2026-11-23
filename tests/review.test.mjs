import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createReviewCase, recordManualReview } from '../src/domain/assessment/review.ts';
import { getVerifiedPercentage } from '../src/domain/assessment/resultPresentation.ts';

const exam = () => ({
  id:'test', ownerId:'teacher-1', title:'Synthetic', description:'', duration:10,
  difficulty:'Easy', questionCount:3, questions:[
    {id:'a',points:4,text:'Choose',type:'multiple-choice'},
    {id:'b',points:6,text:'Explain',type:'essay'},
    {id:'c',points:5,text:'Short answer',type:'short-answer'},
  ],
});
const result = () => ({
  id:'result-1',examId:'test',examTitle:'Synthetic',userId:'student-1',
  userName:'Demo',submittedAt:new Date('2026-11-23T10:00:00Z'),
  score:4,totalPoints:15,gradingStatus:'needs-review',pendingReviewPoints:11,
  answers:{a:'A',b:'Text',c:'Short'},itemScores:[
    {questionId:'a',status:'correct',awardedPoints:4,maxPoints:4},
    {questionId:'b',status:'needs-review',awardedPoints:0,maxPoints:6},
    {questionId:'c',status:'needs-review',awardedPoints:0,maxPoints:5},
  ],
});
const command = (overrides = {}) => ({
  id:'review-1', expectedRevision:0, ownerId:'teacher-1', reviewerId:'user1',
  recordedAt:'2026-11-23T11:00:00Z', reason:'Reviewed against rubric',
  decisions:[{questionId:'b',awardedPoints:3,feedback:'Partial credit for argument'}],
  ...overrides,
});
test('a partial review retains needs-review and provisional grade',()=>{
  const original=createReviewCase(result(),exam());
  const next=recordManualReview(original,command());
  assert.equal(next.revision,1);
  assert.equal(next.result.score,7);
  assert.equal(next.result.pendingReviewPoints,5);
  assert.equal(next.result.gradingStatus,'needs-review');
  assert.equal(next.result.itemScores[1].status,'reviewed');
  assert.equal(getVerifiedPercentage(next.result),null);
  assert.equal(original.result.score,4);
  assert.equal(original.journal.length,0);
});
test('finalizes only after every pending subjective answer is reviewed',()=>{
  const first=recordManualReview(createReviewCase(result(),exam()),command());
  const second=recordManualReview(first,command({
    id:'review-2',expectedRevision:1,
    decisions:[{questionId:'c',awardedPoints:5,feedback:'Matches rubric'}],
  }));
  assert.equal(second.result.score,12);
  assert.equal(second.result.pendingReviewPoints,0);
  assert.equal(second.result.gradingStatus,'final');
  assert.equal(getVerifiedPercentage(second.result),80);
  assert.equal(second.journal.length,2);
  assert.equal(second.journal[0].decisions[0].awardedPoints,3);
});
test('rejects review on an objective or already-reviewed item',()=>{
  const first=createReviewCase(result(),exam());
  assert.throws(()=>recordManualReview(first,command({
    decisions:[{questionId:'a',awardedPoints:0,feedback:'No'}]
  })),/not pending/);
  const next=recordManualReview(first,command());
  assert.throws(()=>recordManualReview(next,command({
    id:'second',expectedRevision:1
  })),/not pending/);
});
test('prevents invalid points, empty reason, duplicate decisions and blank feedback',()=>{
  const first=createReviewCase(result(),exam());
  assert.throws(()=>recordManualReview(first,command({decisions:[{questionId:'b',awardedPoints:7,feedback:'x'}]})),/range/);
  assert.throws(()=>recordManualReview(first,command({decisions:[{questionId:'b',awardedPoints:-1,feedback:'x'}]})),/range/);
  assert.throws(()=>recordManualReview(first,command({reason:' '})),/reason/);
  assert.throws(()=>recordManualReview(first,command({decisions:[{questionId:'b',awardedPoints:3,feedback:' '}]})),/feedback/);
  assert.throws(()=>recordManualReview(first,command({decisions:[
    {questionId:'b',awardedPoints:3,feedback:'A'},
    {questionId:'b',awardedPoints:4,feedback:'B'},
  ]})),/Duplicate question/);
});
test('enforces review ownership, revision and event uniqueness',()=>{
  const first=createReviewCase(result(),exam());
  assert.throws(()=>recordManualReview(first,command({ownerId:'someone-else'})),/identity/);
  assert.throws(()=>recordManualReview(first,command({expectedRevision:1})),/revision conflict/);
  const next=recordManualReview(first,command());
  assert.throws(()=>recordManualReview(next,command({
    expectedRevision:1,decisions:[{questionId:'c',awardedPoints:2,feedback:'x'}]
  })),/Duplicate review event/);
});
test('never opens review cases for final or forged/mismatched results',()=>{
  assert.throws(()=>createReviewCase({...result(),gradingStatus:'final'},exam()),/awaiting/);
  assert.throws(()=>createReviewCase({...result(),examId:'other'},exam()),/snapshot/);
  const fake=result();fake.itemScores[1].maxPoints=7;
  assert.throws(()=>createReviewCase(fake,exam()),/do not match/);
});
test('returned event history cannot mutate the preceding case',()=>{
  const first=recordManualReview(createReviewCase(result(),exam()),command());
  const second=recordManualReview(first,command({
    id:'review-2',expectedRevision:1,
    decisions:[{questionId:'c',awardedPoints:1,feedback:'x'}],
  }));
  second.journal[0].decisions[0].feedback='edited';
  assert.equal(first.journal[0].decisions[0].feedback,'Partial credit for argument');
});
