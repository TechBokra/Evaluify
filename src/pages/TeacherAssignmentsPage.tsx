import { useEffect, useState, type FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useNavLinks from '../hooks/useNavLinks';
import { useLanguage } from '../contexts/AuthContext';
import { getAssessments, getTeacherDemoAssignments, publishAndAssignDemoQuiz,
  type DemoTeacherAssignmentSummary } from '../services/mockApi';
import type { Exam } from '../types';

const OWNER_ID = 'teacher-1';
const toLocalInput = (date: Date): string =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const TeacherAssignmentsPage = () => {
  const navLinks = useNavLinks();
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<DemoTeacherAssignmentSummary[]>([]);
  const [examId, setExamId] = useState('');
  const [opens, setOpens] = useState(() => toLocalInput(new Date()));
  const [closes, setCloses] = useState(() => toLocalInput(new Date(Date.now() + 7 * 86400000)));
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [rows, assigned] = await Promise.all([
          getAssessments(OWNER_ID), getTeacherDemoAssignments(OWNER_ID),
        ]);
        if (!active) return;
        setExams(rows);
        setExamId(current => current || rows[0]?.id || '');
        setAssignments(assigned);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load demo assignments');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const assigned = await publishAndAssignDemoQuiz({
        examId, ownerId: OWNER_ID, opensAt: new Date(opens).toISOString(),
        closesAt: new Date(closes).toISOString(), maxAttempts,
      });
      setAssignments(prev => [...prev, assigned]);
      setMessage(ar ? 'تم إنشاء التكليف التجريبي ونسخة الاختبار الثابتة.' : 'Published an immutable quiz version and created a synthetic group assignment.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not assign quiz');
    } finally {
      setSaving(false);
    }
  };

  return <DashboardLayout navLinks={navLinks} pageTitle={ar ? 'إسناد الاختبارات' : 'Publish & Assign'}>
    <div className="max-w-5xl space-y-5">
      <p className="border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-lg p-3 text-sm">
        {ar ? 'تجربة محلية ببيانات اصطناعية فقط. المجموعة التجريبية تضم حساب الطالب user2. لا توجد صلاحيات أو تخزين إنتاجي.'
          : 'Local synthetic demo only. The sample group contains student user2. No real authorization or durable persistence.'}
      </p>
      {error && <p role="alert" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg p-3">{error}</p>}
      {message && <p role="status" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 rounded-lg p-3">{message}</p>}
      {loading ? <LoadingSpinner /> : <>
        <form onSubmit={event => void publish(event)} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-xl">{ar ? 'إصدار نسخة ثابتة وتكليف مجموعة' : 'Publish version and assign to group'}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {ar ? 'لن يُسمح بالنشر إلا للأسئلة التي يملكها المدرس وتم اعتمادها مع ذكر أساس حقوق المحتوى.'
              : 'Only approved questions owned by the demo teacher, with declared content rights, can be published.'}
          </p>
          <label className="block font-medium text-sm">{ar ? 'الاختبار' : 'Assessment'}
            <select value={examId} onChange={event => setExamId(event.target.value)} required
              className="mt-1 block w-full rounded-lg border bg-white dark:bg-slate-700 dark:border-slate-600 p-3">
              {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.title} ({exam.questionCount} Q)</option>)}
            </select>
          </label>
          <p className="text-sm">{ar ? 'المجموعة' : 'Group'}: <strong>Synthetic demo students (user2)</strong></p>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="block text-sm font-medium">{ar ? 'متاح من' : 'Available from'}
              <input type="datetime-local" required value={opens} onChange={e=>setOpens(e.target.value)}
                className="mt-1 block w-full rounded-lg border bg-white dark:bg-slate-700 dark:border-slate-600 p-2"/>
            </label>
            <label className="block text-sm font-medium">{ar ? 'متاح حتى' : 'Available until'}
              <input type="datetime-local" required value={closes} onChange={e=>setCloses(e.target.value)}
                className="mt-1 block w-full rounded-lg border bg-white dark:bg-slate-700 dark:border-slate-600 p-2"/>
            </label>
            <label className="block text-sm font-medium">{ar ? 'عدد المحاولات' : 'Attempt limit'}
              <input type="number" required min={1} max={10} value={maxAttempts}
                onChange={e=>setMaxAttempts(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border bg-white dark:bg-slate-700 dark:border-slate-600 p-2"/>
            </label>
          </div>
          <button type="submit" disabled={!examId || saving}
            className="rounded-lg bg-primary-600 text-white px-5 py-3 font-semibold disabled:opacity-50">
            {saving ? (ar ? 'جارٍ الحفظ' : 'Saving') : (ar ? 'نشر النسخة وإسنادها' : 'Publish & Assign')}
          </button>
        </form>
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-xl">{ar ? 'التكليفات التجريبية' : 'Synthetic group assignments'}</h2>
          {assignments.length === 0 ? <p className="text-slate-500">{ar ? 'لم تُنشأ تكليفات بعد.' : 'No assignments yet.'}</p> :
            <ul className="divide-y dark:divide-slate-700">
              {assignments.map(item => <li key={item.id} className="py-3">
                <p className="font-semibold">{item.title} · v{item.version}</p>
                <p className="text-sm text-slate-500">{item.groupName} · {ar ? 'محاولات' : 'Attempts'}: {item.maxAttempts}</p>
                <p className="text-xs text-slate-500">{item.opensAt} — {item.closesAt}</p>
              </li>)}
            </ul>}
        </section>
      </>}
    </div>
  </DashboardLayout>;
};
export default TeacherAssignmentsPage;
