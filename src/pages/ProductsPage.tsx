import SitePageLayout from '../components/SitePageLayout';
import { useLanguage } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ProductsPage = () => {
  const {lang}=useLanguage(); const ar=lang==='ar';
  const features = ar ? [
    ['بنك الأسئلة','إنشاء مسودات، استيراد بيانات اختبار اصطناعية، مراجعة مصدر المحتوى واعتماد الأسئلة.','نموذج تجريبي'],
    ['إنشاء الاختبارات وإسنادها','نشر نسخة اختبار ثابتة وتكليف مجموعة طلاب افتراضية مع تحديد المدة والمحاولات.','نموذج تجريبي'],
    ['التصحيح والمراجعة','تصحيح الأسئلة الموضوعية بقواعد حتمية، مع مراجعة المدرس للإجابات المقالية.','نموذج تجريبي'],
    ['تحليل المهارات','عقود أولية لحساب مؤشرات ترتبط بالأدلة الكافية والنتائج النهائية فقط.','قيد الربط'],
    ['التدخل وإعادة التقييم','سجل قرارات المدرس ومقارنات وصفية للنتائج قبل التدخل وبعده.','قيد التطوير'],
    ['مساعد AI','تصميم أولي لتوليد المسودات والتحليل مع مراجعة بشرية وضوابط جودة وتكلفة.','غير مفعّل'],
  ] : [
    ['Question Bank','Create drafts, import synthetic questions, declare content rights and approve items.','Demo prototype'],
    ['Builder & Assignments','Publish immutable quiz versions for synthetic groups, with windows and attempt limits.','Demo prototype'],
    ['Grading & Review','Deterministically score objective items and require teacher review for written answers.','Demo prototype'],
    ['Skill Analytics','Early contracts for evidence-aware metrics built only on eligible finalized results.','Integration in progress'],
    ['Interventions & Follow-up','Teacher decisions and descriptive before/after comparisons without causal claims.','Under development'],
    ['AI Assistance','Proposed draft-generation and diagnosis support with teacher controls and quality/cost checks.','Not enabled'],
  ];
  return <SitePageLayout><main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <header className="max-w-3xl mx-auto text-center">
      <p className="uppercase tracking-widest text-sm text-primary-600 dark:text-primary-300 font-semibold">{ar?'منتج تحت الإنشاء':'PRE-LAUNCH PRODUCT SCOPE'}</p>
      <h1 className="mt-3 text-4xl font-bold">{ar?'مكوّنات Evaluify التعليمية':'Evaluify Assessment Workflow'}</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{ar
        ? 'نستهدف المدرسين ومراكز الدروس في مصر أولًا. حالات التطوير أدناه توضّح ما يمكن تجربته وما لم يُنفّذ بعد، ولا تعني إطلاق خدمة إنتاجية.'
        : 'Teacher-first assessment for Egypt. Status labels distinguish working synthetic demos from planned work; nothing here constitutes a production service.'}</p>
    </header>
    <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {features.map(([title,desc,status])=><article key={title} className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-6 space-y-3">
        <p className="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">{status}</p>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-slate-600 dark:text-slate-300">{desc}</p>
      </article>)}
    </div>
    <p className="mt-8 text-sm text-slate-500 text-center">{ar?'لا توجد مراقبة بالكاميرا أو متصفح مؤمّن أو تكاملات إنتاجية ضمن هذا النموذج.':'Camera proctoring, secure exam browsers and production integrations are not part of this prototype.'}</p>
    <div className="mt-8 text-center"><Link to="/" className="inline-block rounded-lg bg-primary-600 px-6 py-3 text-white font-semibold">{ar?'استكشف النسخة التجريبية':'Explore the demo'}</Link></div>
  </main></SitePageLayout>;
};
export default ProductsPage;
