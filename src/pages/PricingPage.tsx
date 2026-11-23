import SitePageLayout from '../components/SitePageLayout';
import { useLanguage } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const {lang}=useLanguage();
  const ar=lang==='ar';
  return <SitePageLayout>
    <main className="min-h-[60vh] container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <p className="uppercase tracking-widest text-primary-600 dark:text-primary-300 font-semibold text-sm">
          {ar?'الأسعار قيد الاختبار':'PRICING UNDER VALIDATION'}
        </p>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          {ar?'لا توجد باقات تجارية معتمدة بعد':'No Commercial Plans Are Available Yet'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          {ar
            ? 'Evaluify منصة تحت الإنشاء. ما زلنا نبحث نموذج القيمة والتسعير المناسب للمدرسين ومراكز الدروس في مصر، بما في ذلك احتمالات الدفع لكل تقييم أو مقابل التقرير والخدمة. لا توجد فترة تجريبية مدفوعة أو اشتراك متاح حاليًا.'
            : 'Evaluify is under construction. We are researching pricing for Egyptian teachers and tutoring centers, including per-assessment and results-as-a-service hypotheses. There are no paid subscriptions, trial periods or accepted price commitments at this stage.'}
        </p>
        <Link to="/" className="inline-block rounded-lg bg-primary-600 text-white font-semibold px-6 py-3">
          {ar?'استكشف النموذج الأولي':'Explore the prototype'}
        </Link>
      </div>
    </main>
  </SitePageLayout>;
};
export default PricingPage;
