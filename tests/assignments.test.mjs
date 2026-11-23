import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publishQuiz } from '../src/domain/assessment/publication.ts';
import { createDemoAssignmentService } from '../src/domain/assignments/assignments.ts';

const fixture = () => {
  const base = {
    id:'quiz-1',ownerId:'teacher-1',title:'Synthetic fractions quiz',
    description:'Demo',duration:20,difficulty:'Easy',questionCount:2,
    questions:[
      {id:'q1',ownerId:'teacher-1',text:'What is 1 + 1?',type:'multiple-choice',
       category:'Math',subCategory:'Numbers',points:4,tags:[],status:'approved',
       options:['1','2','3'],correctAnswer:'2'},
      {id:'q2',ownerId:'teacher-1',text:'Explain your reasoning',type:'essay',
       category:'Math',subCategory:'Numbers',points:6,tags:[],status:'approved',
       correctAnswer:'A rubric for the teacher'},
    ],
  };
  const quiz=publishQuiz(base,2,'2026-11-23T10:00:00.000Z');
  const service=createDemoAssignmentService({
    now:()=>new Date('2026-11-23T12:00:00.000Z'),
    newId:(()=>{let i=0;return ()=>String(++i)})(),
  });
  service.createGroup({id:'group-1',ownerId:'teacher-1',name:'Demo group',studentIds:['student-a','student-b']});
  const data={id:'assignment-1',groupId:'group-1',ownerId:'teacher-1',quiz,
    opensAt:'2026-11-23T11:00:00Z',closesAt:'2026-11-24T11:00:00Z',maxAttempts:1};
  service.assignQuiz(data);
  return {base,quiz,service,data};
};
const attempt=(overrides={})=>({
  assignmentId:'assignment-1',attemptId:'request-1',studentId:'student-a',
  studentName:'Demo',answers:{q1:'2',q2:'An explanation'},...overrides,
});
test('assignment retains original approved version and teacher scope',()=>{
  const {base,service}=fixture();
  base.questions[0].text='Edited after publication';
  assert.equal(service.getTeacherAssignment('assignment-1','teacher-1')?.quizSnapshot.questions[0].text,'What is 1 + 1?');
  assert.equal(service.getTeacherAssignment('assignment-1','other'),null);
});
test('student preview never leaks correct answers or model rubrics',()=>{
  const {service}=fixture();
  const view=service.getStudentQuiz('assignment-1','student-a');
  assert.equal(view.version,2);
  assert.equal(view.questions.length,2);
  assert.ok(!('correctAnswer' in view.questions[0]));
  assert.ok(!JSON.stringify(view).includes('A rubric for the teacher'));
  assert.ok(!JSON.stringify(view).includes('correctAnswer'));
});
test('only members can receive or submit an assigned quiz',()=>{
  const {service}=fixture();
  assert.throws(()=>service.getStudentQuiz('assignment-1','stranger'),/not a member/);
  assert.throws(()=>service.submit(attempt({studentId:'stranger'})),/not a member/);
  assert.equal(service.listStudentAssignments('stranger').length,0);
});
test('max attempts applies per student, but identical retries remain idempotent',()=>{
  const {service}=fixture();
  const first=service.submit(attempt());
  const retry=service.submit(attempt());
  assert.equal(retry.id,first.id);
  assert.equal(first.gradingStatus,'needs-review');
  assert.equal(first.score,4);
  assert.equal(service.listStudentAssignments('student-a')[0].submittedAttempts,1);
  assert.throws(()=>service.submit(attempt({attemptId:'request-2'})),/limit/);
  assert.throws(()=>service.submit(attempt({answers:{q1:'3',q2:'An explanation'}})),/different answers/);
  assert.equal(service.submit(attempt({studentId:'student-b',attemptId:'request-2'})).score,4);
});
test('rejects invalid owners, version, attempt limit and assignment window',()=>{
  const {quiz,service,data}=fixture();
  assert.throws(()=>service.assignQuiz({...data,id:'foreign',ownerId:'other'}),/same teacher/);
  assert.throws(()=>service.assignQuiz({...data,id:'invalid',maxAttempts:0}),/Attempt limit/);
  assert.throws(()=>service.assignQuiz({...data,id:'bad-window',closesAt:data.opensAt}),/access window/);
  assert.throws(()=>service.assignQuiz({...data,id:'assignment-1'}),/already exists/);
  assert.throws(()=>service.assignQuiz({...data,id:'invalid-version',quiz:{...quiz,version:0}}),/published quiz version/);
});
test('outside access window new submissions are rejected without exposing keys',()=>{
  const base={
    id:'q',ownerId:'teacher-1',title:'Demo',description:'',duration:5,difficulty:'Easy',
    questionCount:1,questions:[{id:'q1',ownerId:'teacher-1',text:'x',type:'true-false',
       correctAnswer:'True',points:2,category:'Demo',subCategory:'Demo',tags:[],status:'approved'}],
  };
  const quiz=publishQuiz(base,1,'2026-11-23T10:00:00Z');
  const service=createDemoAssignmentService({now:()=>new Date('2026-11-23T09:00:00Z')});
  service.createGroup({id:'g',ownerId:'teacher-1',name:'g',studentIds:['student-a']});
  service.assignQuiz({id:'a',groupId:'g',ownerId:'teacher-1',quiz,
    opensAt:'2026-11-23T10:00:00Z',closesAt:'2026-11-24T10:00:00Z',maxAttempts:1});
  assert.throws(()=>service.getStudentQuiz('a','student-a'),/outside/);
  assert.throws(()=>service.submit({assignmentId:'a',studentId:'student-a',studentName:'Demo',
    attemptId:'1',answers:{q1:'True'}}),/outside/);
});
test('prevents duplicate group members and duplicate groups',()=>{
  const {service}=fixture();
  assert.throws(()=>service.createGroup({id:'group-1',ownerId:'teacher-1',name:'duplicate',studentIds:[]}),/already exists/);
  assert.throws(()=>service.createGroup({id:'bad',ownerId:'teacher-1',name:'Demo',studentIds:['a','a']}),/duplicate/);
});
