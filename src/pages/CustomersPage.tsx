import SitePageLayout from '../components/SitePageLayout';
import { useLanguage } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const CustomersPage = () => {
  const {lang}=useLanguage();
  const ar=lang==='ar';
  return <SitePageLayout>
    <main className="min-h-[60vh] container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <p className="uppercase tracking-widest text-primary-600 dark:text-primary-300 font-semibold text-sm">
          {ar?'قيد الدراسة والتطوير':'RESEARCH & DEVELOPMENT'}
        </p>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          {ar?'لا توجد دراسات حالة لعملاء حاليًا':'No Customer Case Studies Yet'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          {ar
            ? 'Evaluify مشروع تحت الإنشاء. لم نثبت بعد نتائج تجارب عملاء أو شراكات مؤسسية. نختبر احتياجات المدرسين ومراكز الدروس باستخدام نماذج تجريبية وبيانات اصطناعية.'
            : 'Evaluify is an early-stage project. No institutional partnerships, customer outcomes or case studies have been validated. The teacher and tutoring-center workflow is being tested with synthetic data.'}
        </p>
        <Link to="/" className="inline-block rounded-lg bg-primary-600 text-white font-semibold px-6 py-3">
          {ar?'العودة إلى الصفحة الرئيسية':'Back to the prototype'}
        </Link>
      </div>
    </main>
  </SitePageLayout>;
};
export default CustomersPage;
