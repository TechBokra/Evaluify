import SitePageLayout from '../components/SitePageLayout';
import { useLanguage } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AboutUsPage = () => {
  const {lang}=useLanguage(); const ar=lang==='ar';
  return <SitePageLayout><main className="min-h-[65vh]">
    <header className="bg-white dark:bg-slate-900 py-20"><div className="container mx-auto px-4 max-w-3xl text-center">
      <p className="text-sm uppercase tracking-widest font-semibold text-primary-600 dark:text-primary-300">{ar?'تحت الإنشاء':'UNDER CONSTRUCTION'}</p>
      <h1 className="mt-4 text-4xl font-bold">{ar?'عن مشروع Evaluify':'About Evaluify'}</h1>
      <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{ar
        ? 'Evaluify مشروع تكنولوجيا تعليمية في مرحلة البحث والتطوير، يختبر كيف يمكن أن تتحول نتائج الاختبارات إلى قرارات تعليمية عملية للمدرسين ومراكز الدروس في مصر.'
        : 'Evaluify is an Egypt-first EdTech project in research and development, exploring how assessment results can support practical teaching decisions for independent educators and tutoring centers.'}</p>
    </div></header>
    <section className="bg-slate-50 dark:bg-slate-950 py-16"><div className="container mx-auto px-4 max-w-3xl">
      <h2 className="text-2xl font-bold">{ar?'المهمة التي نختبرها':'Our Hypothesis'}</h2>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{ar
        ? 'توفير رحلة متكاملة تبدأ بإنشاء السؤال والتكليف، مرورًا بالإجابة والتصحيح بمراجعة المدرس، وصولًا إلى تحليل المهارات وتخطيط التدخل وإعادة التقييم. لم نتحقق بعد من جدوى المنتج أو أثره التعليمي.'
        : 'Build a coherent workflow from question creation and assignment to responding, teacher-reviewed evaluation, skill analysis and follow-up. Product-market fit and educational impact are not yet established.'}</p>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{ar
        ? 'الأسماء والحسابات الموجودة في النسخة التجريبية اصطناعية، ولا تمثل فريقًا معلنًا أو عملاء فعليين.'
        : 'Names and accounts in the demo are synthetic and do not represent a public leadership team or real customers.'}</p>
      <Link to="/" className="mt-8 inline-block rounded-lg bg-primary-600 text-white px-5 py-3 font-semibold">
        {ar?'العودة للنموذج الأولي':'Explore the prototype'}
      </Link>
    </div></section>
  </main></SitePageLayout>;
};
export default AboutUsPage;
