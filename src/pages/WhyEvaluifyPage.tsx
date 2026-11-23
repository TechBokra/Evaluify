import SitePageLayout from '../components/SitePageLayout';
import { useLanguage } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const WhyEvaluifyPage = () => {
  const {lang}=useLanguage();const ar=lang==='ar';
  const pillars=ar?[
    ['الدورة الكاملة','من إنشاء السؤال إلى التكليف ثم الإجابة والتصحيح والتحليل وخطة التحسين.'],
    ['القرار للمدرس','مراجعة بشرية للإجابات الذاتية وإتاحة رفض أو تعديل التدخلات المقترحة.'],
    ['الأدلة أولًا','نميّز النتائج المؤكدة من البيانات التجريبية والعينات غير الكافية.'],
    ['التطوير بصورة واقعية','نختبر احتياجات المدرسين وجودة الذكاء الاصطناعي والتكلفة قبل التوسع.'],
  ]:[
    ['One coherent workflow','From question creation to assignment, response, scoring, analysis and improvement.'],
    ['Teacher accountability','Human review for subjective answers and control over suggested interventions.'],
    ['Evidence before claims','Distinguishing audited outcomes from demos and statistically weak samples.'],
    ['Responsible development','Validating teacher needs, AI quality and costs before scaling.'],
  ];
  return <SitePageLayout><main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <header className="text-center max-w-3xl mx-auto">
      <p className="text-sm font-semibold text-primary-600 dark:text-primary-300 tracking-widest uppercase">{ar?'فرضية منتج قيد الاختبار':'PRODUCT HYPOTHESIS'}</p>
      <h1 className="text-4xl font-bold mt-3">{ar?'لماذا نبني Evaluify؟':'Why Build Evaluify?'}</h1>
      <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{ar
        ? 'نعتقد أن القيمة الحقيقية ليست الاختبار نفسه، بل تحويل نتائجه إلى إجراء تعليمي قابل للمتابعة. هذه فرضية قيد البحث، وليست ميزة تنافسية مثبتة.'
        : 'We believe assessment can be more useful when it guides the next teaching action. This is a product hypothesis, not yet a proven competitive advantage.'}</p>
    </header>
    <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">{pillars.map(([title,desc])=>
      <section key={title} className="rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h2 className="text-xl font-bold">{title}</h2><p className="mt-3 text-slate-600 dark:text-slate-300">{desc}</p>
      </section>)}</div>
    <p className="text-center mt-10 text-sm text-slate-500">{ar?'النموذج الحالي غير مخصص لطلاب حقيقيين ولا يحتوي على مراقبة AI فعالة أو ضمانات أمان إنتاجية.':'Current demo has no production security, live AI proctoring or real student accounts.'}</p>
    <div className="mt-8 text-center"><Link to="/" className="inline-block rounded-lg bg-primary-600 text-white px-6 py-3 font-semibold">{ar?'استكشف النموذج':'Explore the prototype'}</Link></div>
  </main></SitePageLayout>;
};
export default WhyEvaluifyPage;
