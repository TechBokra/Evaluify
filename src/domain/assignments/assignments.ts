import type { Exam, ExamResult, Question, StudentAnswer } from '../../types.ts';
import type { PublishedQuiz } from '../assessment/publication.ts';
import { createAttemptService, MemoryAttemptRepository } from '../assessment/attempts.ts';

/**
 * Local teacher → group → published quiz assignment prototype.
 * This enforces demo policies only; frontend role switching is NOT authorization.
 */
export interface DemoGroup {
  id: string;
  ownerId: string;
  name: string;
  studentIds: string[];
}
export interface QuizAssignment {
  id: string;
  ownerId: string;
  groupId: string;
  quizId: string;
  quizVersion: number;
  opensAt: string;
  closesAt: string;
  maxAttempts: number;
  createdAt: string;
  quizSnapshot: PublishedQuiz;
}
export type StudentQuestion = Pick<Question,
  'id' | 'type' | 'text' | 'options' | 'prompts' | 'points' | 'category' | 'subCategory'>;
export interface StudentQuiz {
  assignmentId: string;
  quizId: string;
  version: number;
  title: string;
  duration: number;
  questions: StudentQuestion[];
}
export interface StudentAssignmentSummary {
  assignmentId: string;
  title: string;
  quizVersion: number;
  opensAt: string;
  closesAt: string;
  maxAttempts: number;
  submittedAttempts: number;
}
export interface AssignedSubmission {
  assignmentId: string;
  attemptId: string;
  studentId: string;
  studentName: string;
  answers: StudentAnswer;
}
export interface AssignmentServiceOptions {
  now?: () => Date;
  newId?: () => string;
}

const clone = <T>(value: T): T => structuredClone(value);
const requireIdentity = (value: string, label: string) => {
  if (!value.trim()) throw new Error(label + ' is required');
};
const validIsoDate = (value: string) => Number.isFinite(Date.parse(value));

export function createDemoAssignmentService(options: AssignmentServiceOptions = {}) {
  const now = options.now ?? (() => new Date());
  const groups = new Map<string, DemoGroup>();
  const assignments = new Map<string, QuizAssignment>();
  const attempted = new Map<string, Set<string>>();
  const repository = new MemoryAttemptRepository();
  const attempts = createAttemptService(repository, {now, newId: options.newId});

  const ensureStudent = (assignment: QuizAssignment, studentId: string) => {
    const group = groups.get(assignment.groupId);
    if (!group || !group.studentIds.includes(studentId)) {
      throw new Error('Student is not a member of the assigned group');
    }
  };
  const withinWindow = (assignment: QuizAssignment) => {
    const time = now().getTime();
    if (time < Date.parse(assignment.opensAt) || time > Date.parse(assignment.closesAt)) {
      throw new Error('Assignment is outside its access window');
    }
  };
  const studentScope = (assignmentId: string, studentId: string) =>
    JSON.stringify([assignmentId, studentId]);

  return {
    createGroup(input: DemoGroup): DemoGroup {
      requireIdentity(input.id, 'Group ID');
      requireIdentity(input.ownerId, 'Owner ID');
      requireIdentity(input.name, 'Group name');
      if (groups.has(input.id)) throw new Error('Group already exists');
      if (input.studentIds.some(id => !id.trim()) ||
          new Set(input.studentIds).size !== input.studentIds.length) {
        throw new Error('Invalid or duplicate student IDs');
      }
      const group = clone(input);
      groups.set(group.id, group);
      return clone(group);
    },

    assignQuiz(input: {
      id: string; groupId: string; ownerId: string; quiz: PublishedQuiz;
      opensAt: string; closesAt: string; maxAttempts: number;
    }): QuizAssignment {
      requireIdentity(input.id, 'Assignment ID');
      const group = groups.get(input.groupId);
      if (!group || input.ownerId !== group.ownerId || input.quiz.ownerId !== group.ownerId) {
        throw new Error('Group and published quiz must belong to the same teacher');
      }
      if (assignments.has(input.id)) throw new Error('Assignment already exists');
      if (!Number.isInteger(input.quiz.version) || input.quiz.version < 1) {
        throw new Error('A published quiz version is required');
      }
      if (!Number.isInteger(input.maxAttempts) || input.maxAttempts < 1 || input.maxAttempts > 10) {
        throw new Error('Attempt limit must be between 1 and 10');
      }
      if (!validIsoDate(input.opensAt) || !validIsoDate(input.closesAt) ||
          Date.parse(input.closesAt) <= Date.parse(input.opensAt)) {
        throw new Error('Invalid assignment access window');
      }
      const assigned: QuizAssignment = {
        id: input.id, groupId: input.groupId, ownerId: input.ownerId,
        quizId: input.quiz.id, quizVersion: input.quiz.version,
        quizSnapshot: clone(input.quiz), opensAt: input.opensAt, closesAt: input.closesAt,
        maxAttempts: input.maxAttempts, createdAt: now().toISOString(),
      };
      assignments.set(assigned.id, clone(assigned));
      return clone(assigned);
    },

    getTeacherAssignment(assignmentId: string, ownerId: string): QuizAssignment | null {
      const assigned = assignments.get(assignmentId);
      return assigned && assigned.ownerId === ownerId ? clone(assigned) : null;
    },

    listStudentAssignments(studentId: string): StudentAssignmentSummary[] {
      return [...assignments.values()].filter(a => groups.get(a.groupId)?.studentIds.includes(studentId))
        .map(assignment => ({
          assignmentId: assignment.id, title: assignment.quizSnapshot.title,
          quizVersion: assignment.quizVersion, opensAt: assignment.opensAt,
          closesAt: assignment.closesAt, maxAttempts: assignment.maxAttempts,
          submittedAttempts: attempted.get(studentScope(assignment.id, studentId))?.size ?? 0,
        }));
    },

    /** Never return answer keys or model answers to a student-facing client. */
    getStudentQuiz(assignmentId: string, studentId: string): StudentQuiz {
      const assignment = assignments.get(assignmentId);
      if (!assignment) throw new Error('Assignment not found');
      ensureStudent(assignment, studentId);
      withinWindow(assignment);
      return {
        assignmentId, quizId: assignment.quizId, version: assignment.quizVersion,
        title: assignment.quizSnapshot.title, duration: assignment.quizSnapshot.duration,
        questions: assignment.quizSnapshot.questions.map(question => ({
          id: question.id, type: question.type, text: question.text,
          options: question.options ? [...question.options] : undefined,
          prompts: question.prompts ? [...question.prompts] : undefined,
          points: question.points, category: question.category, subCategory: question.subCategory,
        })),
      };
    },

    submit(command: AssignedSubmission): ExamResult {
      const assignment = assignments.get(command.assignmentId);
      if (!assignment) throw new Error('Assignment not found');
      requireIdentity(command.attemptId, 'Attempt ID');
      requireIdentity(command.studentId, 'Student ID');
      requireIdentity(command.studentName, 'Student name');
      const scopedAttemptId = [assignment.id, assignment.quizVersion, command.attemptId].join(':');
      const existingKey = JSON.stringify([assignment.quizId, command.studentId, scopedAttemptId]);
      const previous = repository.getByKey(existingKey);

      // Permit identical retries of an already accepted attempt even after deadline,
      // while the existing attempt service rejects changed answers under the same ID.
      if (!previous) {
        ensureStudent(assignment, command.studentId);
        withinWindow(assignment);
        const scope = studentScope(assignment.id, command.studentId);
        const keys = attempted.get(scope) ?? new Set<string>();
        if (keys.size >= assignment.maxAttempts) throw new Error('Assignment attempt limit reached');
      }

      // Convert a frozen versioned snapshot into a private mutable assessment copy.
      // Never take a live reference to the question bank or a client-supplied answer key.
      const exam: Exam = {
        ...clone(assignment.quizSnapshot),
        questions: assignment.quizSnapshot.questions.map(question => clone(question) as Question),
      };
      const record = attempts.submit({
        exam, attemptId: scopedAttemptId, userId: command.studentId,
        userName: command.studentName, answers: clone(command.answers),
      });
      if (!previous) {
        const scope = studentScope(assignment.id, command.studentId);
        const keys = attempted.get(scope) ?? new Set<string>();
        keys.add(scopedAttemptId);
        attempted.set(scope, keys);
      }
      return clone(record.result);
    },
  };
}
