import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useNavLinks from '../hooks/useNavLinks';
import { useAuth, useLanguage } from '../contexts/AuthContext';
import { getTeacherReviewCase, getTeacherReviewQueue, submitTeacherReview } from '../services/mockApi';
import type { ExamResult } from '../types';
import type { ReviewCase, ReviewDecision } from '../domain/assessment/review';

const DEMO_OWNER_ID = 'teacher-1';
type DraftReview = { points: string; feedback: string };
const answerText = (answer: unknown): string => {
  if (answer === null || answer === undefined) return 'No answer';
  if (typeof answer === 'string') return answer || 'No answer';
  return JSON.stringify(answer);
};

const TeacherReviewPage = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navLinks = useNavLinks();
  const [queue, setQueue] = useState<ExamResult[]>([]);
  const [review, setReview] = useState<ReviewCase | null>(null);
  const [draft, setDraft] = useState<Record<string, DraftReview>>({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const ar = lang === 'ar';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setNotice('');
    const load = async () => {
      try {
        if (resultId) {
          const current = await getTeacherReviewCase(resultId, DEMO_OWNER_ID);
          if (active) { setReview(current); setQueue([]); }
        } else {
          const rows = await getTeacherReviewQueue(DEMO_OWNER_ID);
          if (active) { setQueue(rows); setReview(null); }
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load reviews');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [resultId]);

  const pending = review?.result.itemScores?.filter(item => item.status === 'needs-review') ?? [];

  const saveReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !review || saving) return;
    try {
      setSaving(true);
      setError('');
      const decisions: ReviewDecision[] = pending.map(item => {
        const entered = draft[item.questionId];
        if (!entered || !entered.points.trim() || !entered.feedback.trim()) {
          throw new Error(ar ? 'أدخل الدرجة والتعليق لكل إجابة' : 'Enter points and feedback for each pending answer');
        }
        return { questionId: item.questionId, awardedPoints: Number(entered.points), feedback: entered.feedback };
      });
      const updated = await submitTeacherReview({
        resultId: review.result.id, ownerId: DEMO_OWNER_ID, reviewerId: user.id,
        expectedRevision: review.revision, reason, decisions,
      });
      setReview(updated);
      setDraft({});
      setReason('');
      setNotice(updated.result.gradingStatus === 'final'
        ? (ar ? 'اكتملت المراجعة وأصبحت الدرجة نهائية في العرض التجريبي' : 'Review completed; the demo score is finalized')
        : (ar ? 'حُفظت المراجعة الجزئية' : 'Partial review saved'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review could not be saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout navLinks={navLinks} pageTitle={ar ? 'مراجعة إجابات الطلاب' : 'Teacher Answer Review'}>
      <div className="space-y-5 max-w-5xl">
        <p className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-200">
          {ar ? 'نموذج تجريبي ببيانات اصطناعية فقط. هوية المدرس وسجل المراجعة غير مؤمّنين بخادم ولا يبقيان بعد إعادة تحميل التطبيق.'
             : 'Synthetic-data prototype only. Teacher identity and review history are not server-secured or persisted after reload.'}
        </p>
        {error && <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-3">{error}</p>}
        {notice && <p role="status" className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 p-3">{notice}</p>}
        {loading ? <LoadingSpinner /> : !resultId ? (
          <section className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-xl">{ar ? 'نتائج تنتظر مراجعة المدرس' : 'Results awaiting teacher review'}</h2>
            {queue.length === 0 ? <p className="text-slate-500">{ar ? 'لا توجد محاولات تجريبية بانتظار المراجعة. حلّ اختبارًا بحساب الطالب أولًا.' : 'No eligible demo submissions. Submit an assessment as the demo student first.'}</p> :
              <ul className="divide-y dark:divide-slate-700">
                {queue.map(result => (
                  <li key={result.id} className="py-3 flex flex-wrap gap-3 items-center justify-between">
                    <div><p className="font-semibold">{result.examTitle}</p>
                      <p className="text-sm text-slate-500">{result.userName} · {ar ? 'المصحّح تلقائيًا' : 'Auto-scored'} {result.score}/{result.totalPoints}</p></div>
                    <Link className="text-primary-700 dark:text-primary-300 font-semibold underline" to={`/teacher/reviews/${result.id}`}>
                      {ar ? 'فتح المراجعة' : 'Review'}
                    </Link>
                  </li>
                ))}
              </ul>}
          </section>
        ) : !review ? (
          <p className="rounded-lg bg-white dark:bg-slate-800 p-4">
            {ar ? 'تعذّر العثور على مراجعة تخصّ هذا المدرس. النتائج القديمة المعروضة غير موثقة.' :
              'No reviewable submission belongs to this teacher. Legacy seeded results are not eligible.'}
          </p>
        ) : (
          <>
            <Link className="text-primary-700 dark:text-primary-300 underline" to="/teacher/reviews">{ar ? 'العودة لقائمة المراجعة' : 'Back to review queue'}</Link>
            <section className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm space-y-2">
              <h2 className="text-xl font-bold">{review.examSnapshot.title}</h2>
              <p>{review.result.userName} · {ar ? 'المصحّح تلقائيًا/مع مراجعة جزئية' : 'Auto-scored / partially reviewed'}: {review.result.score}/{review.result.totalPoints}</p>
              <p className="text-sm text-slate-500">{ar ? 'النسخة رقم' : 'Review revision'} {review.revision} · {ar ? 'بانتظار' : 'Pending'} {pending.length} {ar ? 'إجابة' : 'answers'}</p>
            </section>
            {pending.length ? (
              <form onSubmit={event => void saveReview(event)} className="space-y-4">
                {pending.map(item => {
                  const question = review.examSnapshot.questions.find(q => q.id === item.questionId);
                  if (!question) return null;
                  return (
                    <section key={item.questionId} className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm space-y-3">
                      <h3 className="font-semibold">{question.text}</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div><p className="text-xs text-slate-500 mb-1">{ar ? 'إجابة الطالب' : 'Student answer'}</p>
                          <p className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3 whitespace-pre-wrap">{answerText(review.result.answers[item.questionId])}</p></div>
                        <div><p className="text-xs text-slate-500 mb-1">{ar ? 'الإجابة النموذجية/معيار التصحيح' : 'Model answer / rubric'}</p>
                          <p className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3 whitespace-pre-wrap">{answerText(question.correctAnswer)}</p></div>
                      </div>
                      <label className="block font-medium text-sm">
                        {ar ? 'الدرجة' : 'Awarded points'} (0–{item.maxPoints})
                        <input type="number" min={0} max={item.maxPoints} step="0.5" required
                          value={draft[item.questionId]?.points ?? ''}
                          onChange={e => setDraft(prev => ({...prev,[item.questionId]:{...prev[item.questionId],points:e.target.value,feedback:prev[item.questionId]?.feedback??''}}))}
                          className="mt-1 block w-28 rounded-lg border p-2 bg-white dark:bg-slate-700 dark:border-slate-600"/>
                      </label>
                      <label className="block font-medium text-sm">
                        {ar ? 'تعليق المدرس' : 'Teacher feedback'}
                        <textarea required rows={2} value={draft[item.questionId]?.feedback ?? ''}
                          onChange={e => setDraft(prev => ({...prev,[item.questionId]:{points:prev[item.questionId]?.points??'',feedback:e.target.value}}))}
                          className="mt-1 block w-full rounded-lg border p-2 bg-white dark:bg-slate-700 dark:border-slate-600"/>
                      </label>
                    </section>
                  );
                })}
                <label className="block font-medium text-sm">
                  {ar ? 'سبب المراجعة' : 'Review rationale'}
                  <textarea required rows={2} value={reason} onChange={e => setReason(e.target.value)}
                    className="mt-1 block w-full rounded-lg border p-2 bg-white dark:bg-slate-700 dark:border-slate-600"/>
                </label>
                <button type="submit" disabled={saving || !user}
                  className="rounded-lg bg-primary-600 hover:bg-primary-700 px-5 py-3 text-white font-semibold disabled:opacity-50">
                  {saving ? (ar ? 'جارٍ الحفظ' : 'Saving') : (ar ? 'اعتماد المراجعة وحفظها' : 'Record teacher review')}
                </button>
              </form>
            ) : <p className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-4">{ar ? 'اكتملت جميع المراجعات لهذه المحاولة التجريبية.' : 'All pending answers have been reviewed for this demo attempt.'}</p>}
            {review.journal.length > 0 && (
              <section className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm space-y-2">
                <h3 className="font-bold">{ar ? 'سجل المراجعة' : 'Review journal'}</h3>
                {review.journal.map(entry => <p key={entry.id} className="border-b dark:border-slate-700 py-2 text-sm">
                  #{entry.revision} · {entry.reviewerId} · {entry.recordedAt} · {entry.reason} · {entry.decisions.length} {ar ? 'قرار' : 'decisions'}
                </p>)}
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
export default TeacherReviewPage;
