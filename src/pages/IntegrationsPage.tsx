import SitePageLayout from '../components/SitePageLayout';
import { useLanguage } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const IntegrationsPage = () => {
  const {lang}=useLanguage();const ar=lang==='ar';
  return <SitePageLayout><main className="min-h-[60vh] container mx-auto px-4 py-24 max-w-3xl text-center space-y-6">
    <p className="text-primary-600 dark:text-primary-300 font-semibold uppercase text-sm tracking-widest">{ar?'تكاملات مخطط لها':'INTEGRATION ROADMAP'}</p>
    <h1 className="text-4xl font-bold">{ar?'لا توجد تكاملات خارجية إنتاجية حاليًا':'No Production Integrations Yet'}</h1>
    <p className="text-lg text-slate-600 dark:text-slate-300">{ar
      ? 'يفصل النموذج الحالي منطق التقييم عن تخزين البيانات، تمهيدًا لإضافة API موثوق وتكاملات تعليمية مستقبلًا عند إثبات الحاجة. لم يتم إطلاق موصلات Moodle أو Canvas أو غيرها، ولا توجد واجهة REST API عامة متاحة.'
      : 'The prototype separates assessment rules from storage so a trusted API and education-system integrations can be evaluated later. No Moodle, Canvas, third-party connector or public REST API is currently available.'}</p>
    <p className="text-slate-500 text-sm">{ar?'ربط الأنظمة يعتمد على التحقق من احتياج المستخدمين وخصوصية الطلاب وتحديد بنية الخادم قبل أي إعلان رسمي.':'Integration priorities depend on teacher validation, learner privacy and a trusted backend decision.'}</p>
    <Link to="/" className="inline-block rounded-lg bg-primary-600 text-white px-5 py-3 font-semibold">{ar?'العودة للرئيسية':'Back to prototype'}</Link>
  </main></SitePageLayout>;
};
export default IntegrationsPage;
