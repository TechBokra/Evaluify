import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useNavLinks from '../hooks/useNavLinks';
import { useAuth, useLanguage } from '../contexts/AuthContext';
import { getStudentDemoAssignments } from '../services/mockApi';
import type { StudentAssignmentSummary } from '../domain/assignments/assignments';

const StudentAssignmentsPage = () => {
  const navLinks = useNavLinks();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const [assignments, setAssignments] = useState<StudentAssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) { setLoading(false); return; }
    const load = async () => {
      try {
        const list = await getStudentDemoAssignments(user.id);
        if (active) setAssignments(list);
      } catch(e) {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load assignments');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [user?.id]);

  return <DashboardLayout navLinks={navLinks} pageTitle={ar ? 'تكليفاتي' : 'My Assignments'}>
    <div className="max-w-5xl space-y-4">
      <p className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm">
        {ar ? 'التكليفات الحالية تجريبية وتُحفظ في الذاكرة فقط. لا تستخدم بيانات طلاب حقيقية.'
          : 'Local synthetic assignments only. Data disappears on page reload; never enter real student details.'}
      </p>
      {error && <p role="alert" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 rounded-lg p-3">{error}</p>}
      {loading ? <LoadingSpinner /> : assignments.length === 0 ?
        <p className="rounded-xl bg-white dark:bg-slate-800 p-5">{ar ? 'لا توجد تكليفات مرتبطة بالحساب التجريبي حاليًا.' : 'No assignments for this demo account. Assign a quiz using the teacher role first.'}</p> :
        <div className="grid md:grid-cols-2 gap-4">
          {assignments.map(item => {
            const time = Date.now();
            const isOpen = time >= Date.parse(item.opensAt) && time <= Date.parse(item.closesAt);
            const hasAttempts = item.submittedAttempts < item.maxAttempts;
            return <section key={item.assignmentId} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 space-y-2">
              <h2 className="font-semibold text-lg">{item.title}</h2>
              <p className="text-sm text-slate-500">{ar ? 'النسخة' : 'Version'}: {item.quizVersion}</p>
              <p className="text-sm text-slate-500">{ar ? 'المحاولات المستعملة' : 'Attempts used'}: {item.submittedAttempts}/{item.maxAttempts}</p>
              <p className="text-xs text-slate-500">{item.opensAt} — {item.closesAt}</p>
              {isOpen && hasAttempts ?
                <Link className="inline-block rounded-lg bg-primary-600 text-white px-4 py-2 font-semibold"
                  to={`/examinee/assignment/${item.assignmentId}`}>
                  {ar ? 'بدء الاختبار' : 'Start assessment'}
                </Link> :
                <p className="text-amber-600 dark:text-amber-300 text-sm">
                  {hasAttempts ? (ar ? 'الاختبار خارج وقت الإتاحة' : 'Outside access window') :
                    (ar ? 'انتهى عدد المحاولات المسموح' : 'Attempt limit reached')}
                </p>}
            </section>;
          })}
        </div>}
    </div>
  </DashboardLayout>;
};
export default StudentAssignmentsPage;
