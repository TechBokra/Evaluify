import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { SparklesIcon, DesktopIcon, MicIcon, LightbulbIcon, ShieldCheckIcon, Wand2Icon } from '../components/icons';
// FIX: Update import path for useLanguage and useTheme hooks to use the centralized AuthContext.
import { useLanguage, useTheme } from '../contexts/AuthContext';
import SitePageLayout from '../components/SitePageLayout';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const getTranslations = (platformName: string) => ({
    en: {
        heroTitle: "From Assessment to Better Teaching",
        heroSubtitle: `${platformName} is an early-stage educational assessment prototype for teachers and tutoring centers in Egypt. Explore a simulated assessment workflow, review answers and discover what needs attention.`,
        getStarted: "Explore Teacher Demo",
        requestDemo: "See How It Works",
        trustedBy: "EARLY-STAGE PROJECT · NOT YET LAUNCHED",
        featuresTitle: "What We Are Building",
        featuresSubtitle: "Core assessment workflows are being tested with synthetic data. The features below are prototype capabilities or planned workflows, not production services.",
        smartProctoring: "Teacher-Reviewed Evaluation",
        smartProctoringDesc: "Objective questions use deterministic scoring; written answers await a teacher's decision.",
        dynamicQuestions: "Question Bank and Drafts",
        dynamicQuestionsDesc: "Create and import question drafts, check their content source, and approve them before use.",
        secureBrowser: "Versioned Assessments",
        secureBrowserDesc: "Publish a snapshot of approved questions so later edits do not silently change assigned tests.",
        adaptiveTesting: "Assignments and Attempts",
        adaptiveTestingDesc: "Try a synthetic student group, an assignment window and per-student attempt limits in the demo.",
        speechAnalysis: "Evidence-Aware Analysis",
        speechAnalysisDesc: "Explore how verified results could reveal learning gaps without overstating small samples.",
        personalizedGuides: "Teacher-Led Improvement",
        personalizedGuidesDesc: "The proposed loop connects results to teacher interventions and follow-up assessments.",
        howItWorksTitle: "The Assessment-to-Action Workflow",
        step1Title: "Create",
        step1Desc: "Prepare questions and publish a teacher-approved assessment version.",
        step2Title: "Assign & Respond",
        step2Desc: "Assign a test to a synthetic student group and collect answers.",
        step3Title: "Evaluate & Improve",
        step3Desc: "Review written answers, analyze finalized results and plan the next learning intervention.",
        testimonialsTitle: "What Is Still Being Validated",
        testimonial1: "Teacher interviews and limited pilots will determine which assessment tasks genuinely save time.",
        testimonial1Name: "Research priority",
        testimonial1Role: "No customer testimonials or performance claims yet",
        testimonial2: "AI quality, teacher review time, privacy safeguards and paid demand must be tested before launch.",
        testimonial2Name: "Product decision gate",
        testimonial2Role: "No production AI or real learner records connected",
        finalCtaTitle: "Explore the Prototype",
        finalCtaDesc: "This demo is for product development only. Use the role switcher and synthetic content; no live accounts or paid plans are offered.",
    },
    ar: {
        heroTitle: "من التقييم إلى تحسين التعليم",
        heroSubtitle: `${platformName} نموذج أولي لمنصة تقييمات تعليمية قيد التطوير، يستهدف المدرسين ومراكز الدروس في مصر. استكشف رحلة الاختبار والتصحيح والمتابعة باستخدام بيانات تجريبية فقط.`,
        getStarted: "جرّب واجهة المدرس",
        requestDemo: "تعرّف على مراحل العمل",
        trustedBy: "مشروع تحت الإنشاء · لم يُطلق تجاريًا بعد",
        featuresTitle: "ماذا نبني في Evaluify؟",
        featuresSubtitle: "نجرب وظائف التقييم الأساسية ببيانات اصطناعية. ما يلي نموذج أولي أو وظائف مخطط لها، وليس خدمات إنتاجية جاهزة.",
        smartProctoring: "تصحيح بمراجعة المدرس",
        smartProctoringDesc: "تصحيح حتمي للأسئلة الموضوعية، ومراجعة بشرية للإجابات المقالية قبل اعتماد النتيجة.",
        dynamicQuestions: "بنك أسئلة ومسودات",
        dynamicQuestionsDesc: "إنشاء الأسئلة واستيرادها ومراجعة مصدرها، ثم اعتمادها قبل استخدامها.",
        secureBrowser: "نسخ اختبارات ثابتة",
        secureBrowserDesc: "نشر نسخة معتمدة لا تتغير عند تعديل السؤال الأصلي في بنك الأسئلة.",
        adaptiveTesting: "تكليفات ومحاولات",
        adaptiveTestingDesc: "تجربة مجموعة طلاب افتراضية، وفترة إتاحة للاختبار، وحدود للمحاولات.",
        speechAnalysis: "تحليل يستند إلى الأدلة",
        speechAnalysisDesc: "قياس المهارات من النتائج النهائية فقط، مع إظهار عدم كفاية العينة عند الحاجة.",
        personalizedGuides: "تحسين يقوده المدرس",
        personalizedGuidesDesc: "ربط نتائج التقييم بخطوات تدخل تعليمي واختبار متابعة قابل للمقارنة.",
        howItWorksTitle: "رحلة التقييم إلى الإجراء",
        step1Title: "أنشئ",
        step1Desc: "أعد أسئلتك وانشر نسخة اختبار معتمدة.",
        step2Title: "كلّف وأجب",
        step2Desc: "كلّف مجموعة تجريبية واجمع الإجابات.",
        step3Title: "صحّح وحسّن",
        step3Desc: "راجع الإجابات الكتابية وحلّل النتائج النهائية وحدد الخطوة التعليمية التالية.",
        testimonialsTitle: "ما الذي ما زلنا نختبره؟",
        testimonial1: "المقابلات مع المدرسين والتجارب المحدودة ستحدد المهام التي توفّر وقتًا بالفعل.",
        testimonial1Name: "أولوية البحث",
        testimonial1Role: "لا توجد شهادات عملاء أو نتائج تشغيل فعلية بعد",
        testimonial2: "يجب قياس جودة AI ووقت مراجعة المدرس وحماية البيانات والرغبة في الدفع قبل الإطلاق.",
        testimonial2Name: "بوابة قرار المنتج",
        testimonial2Role: "لا يوجد AI إنتاجي أو بيانات طلاب حقيقية متصلة",
        finalCtaTitle: "استكشف النموذج الأولي",
        finalCtaDesc: "هذه النسخة للتطوير فقط. استخدم الأدوار والبيانات التجريبية؛ لا توجد حسابات إنتاجية أو اشتراكات مدفوعة.",
    }
});

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-lg hover:shadow-primary-500/10 transition-shadow duration-300 border border-slate-200 dark:border-slate-800 transform hover:-translate-y-1">
        <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 rounded-xl mb-4">
            <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{children}</p>
    </div>
);

const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });

    return (
        <div ref={ref} className={`fade-in-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}>
            {children}
        </div>
    );
};


const LandingPage: React.FC = () => {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();
    const t = getTranslations(theme.platformName)[lang];
    const openDemo = () => { login(UserRole.Teacher); navigate('/teacher/assignments'); };
    const jumpToWorkflow = () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });

    return (
        <SitePageLayout>
            {/* Hero Section */}
            <section className="relative py-28 md:py-40 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/50 via-transparent to-transparent dark:from-slate-950/50"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-50 dark:to-slate-400 leading-tight tracking-tighter">
                        {t.heroTitle}
                    </h1>
                    <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                         {t.heroSubtitle}
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <button type="button" onClick={openDemo} className="bg-primary-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-600 transition-transform transform hover:scale-105 shadow-lg">
                            {t.getStarted}
                        </button>
                         <button type="button" onClick={jumpToWorkflow} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                            {t.requestDemo}
                        </button>
                    </div>
                </div>
            </section>
            
            {/* Trusted By Section */}
            <div className="py-8 bg-slate-50 dark:bg-slate-950/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-widest">{t.trustedBy}</p>

                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900">
                <AnimatedSection>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.featuresTitle}</h2>
                            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard icon={ShieldCheckIcon} title={t.smartProctoring}>{t.smartProctoringDesc}</FeatureCard>
                            <FeatureCard icon={SparklesIcon} title={t.dynamicQuestions}>{t.dynamicQuestionsDesc}</FeatureCard>
                            <FeatureCard icon={DesktopIcon} title={t.secureBrowser}>{t.secureBrowserDesc}</FeatureCard>
                            <FeatureCard icon={Wand2Icon} title={t.adaptiveTesting}>{t.adaptiveTestingDesc}</FeatureCard>
                            <FeatureCard icon={MicIcon} title={t.speechAnalysis}>{t.speechAnalysisDesc}</FeatureCard>
                            <FeatureCard icon={LightbulbIcon} title={t.personalizedGuides}>{t.personalizedGuidesDesc}</FeatureCard>
                        </div>
                    </div>
                </AnimatedSection>
            </section>

             {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950">
                <AnimatedSection>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.howItWorksTitle}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="p-6">
                                <div className="text-4xl font-bold text-primary-400 mb-2">1</div>
                                <h3 className="text-xl font-bold mb-2">{t.step1Title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{t.step1Desc}</p>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl font-bold text-primary-400 mb-2">2</div>
                                <h3 className="text-xl font-bold mb-2">{t.step2Title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{t.step2Desc}</p>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl font-bold text-primary-400 mb-2">3</div>
                                <h3 className="text-xl font-bold mb-2">{t.step3Title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{t.step3Desc}</p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </section>
            
            {/* Testimonials Section */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <AnimatedSection>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.testimonialsTitle}</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-xl">
                                <p className="text-slate-700 dark:text-slate-300 italic">{t.testimonial1}</p>
                                <div className="mt-4 font-semibold">{t.testimonial1Name}</div>
                                <div className="text-sm text-slate-500">{t.testimonial1Role}</div>
                            </div>
                             <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-xl">
                                <p className="text-slate-700 dark:text-slate-300 italic">{t.testimonial2}</p>
                                <div className="mt-4 font-semibold">{t.testimonial2Name}</div>
                                <div className="text-sm text-slate-500">{t.testimonial2Role}</div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </section>
            
            {/* Final CTA */}
             <section className="py-20 bg-primary-500/10 dark:bg-primary-500/5">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{t.finalCtaTitle}</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">{t.finalCtaDesc}</p>
                     <div className="mt-6">
                        <button type="button" onClick={openDemo} className="bg-primary-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-600 transition-transform transform hover:scale-105 shadow-lg">
                            {t.getStarted}
                        </button>
                    </div>
                </div>
            </section>

        </SitePageLayout>
    );
};

export default LandingPage;