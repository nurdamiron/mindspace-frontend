// Link — беттер арасында навигация сілтемелерін жасау үшін
import { Link } from 'react-router-dom';
// useState — ашық FAQ элементін бақылау үшін
import { useState } from 'react';
// Lucide иконалары — функциялар мен мүмкіндіктерді бейнелеу үшін
import {
  ShieldCheck,
  BrainCircuit,
  CalendarCheck,
  BarChart3,
  MessageSquare,
  Clock,
  ArrowRight,
  Lock,
  EyeOff,
  Database,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
// useTranslation, i18n — аударма хуктары және тіл ауыстыру
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';
// Button — shadcn/ui батырма компоненті
import { Button } from '@/components/ui/button';
// Separator — бөлгіш сызық компоненті
import { Separator } from '@/components/ui/separator';

// FEATURE_ICONS — әр мүмкіндікке иконаны сәйкестендіретін массив
const FEATURE_ICONS = [BrainCircuit, CalendarCheck, BarChart3, ShieldCheck, MessageSquare, Clock];
// PRIVACY_ICONS — құпиялылық блогының иконалары
const PRIVACY_ICONS = [UserCheck, EyeOff, Database, Lock];
// LANGS — тіл ауыстырғыш параметрлері
const LANGS = [
  { code: 'ru', label: 'РУС' },
  { code: 'kk', label: 'ҚАЗ' },
  { code: 'en', label: 'ENG' },
];

// Landing — қосымшаның қоғамдық басты беті
export default function Landing() {
  const { t } = useTranslation();
  // openFaq — қазіргі ашық FAQ индексі
  const [openFaq, setOpenFaq] = useState(null);
  // currentLang — ағымдағы тіл коды
  const currentLang = i18n.language?.slice(0, 2) || 'ru';

  // Аудармадан мүмкіндіктер, қадамдар, рөлдер, privacy және faq тізімдерін алу
  const features = t('landing.features.items', { returnObjects: true });
  const steps = t('landing.steps.items', { returnObjects: true });
  const roles = t('landing.roles.items', { returnObjects: true });
  const privacyItems = t('landing.privacy.items', { returnObjects: true });
  const faqItems = t('landing.faq.items', { returnObjects: true });

  // handleLang — тілді ауыстыру
  function handleLang(code) {
    i18n.changeLanguage(code);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Жабысқан навигация тақырыбы */}
      <header className="border-b border-zinc-800 sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Логотип және атауы */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 rounded-md bg-zinc-50 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-zinc-900" />
            </div>
            <span className="font-semibold text-sm tracking-tight">MindSpace</span>
          </div>
          {/* Тіл ауыстырғыш және навигация батырмалары */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Тіл ауыстырғыш */}
            <div className="flex items-center rounded-md border border-zinc-800 overflow-hidden">
              {LANGS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLang(lang.code)}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-medium transition-colors ${
                    currentLang === lang.code
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/login">{t('landing.nav.login')}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/login">{t('landing.nav.register')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero бөлімі — негізгі шақыру блогы */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-3xl">
          {/* Белгі жолағы */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400 mb-6 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            {t('landing.hero.badge')}
          </div>

          {/* Негізгі тақырып */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6 text-zinc-50">
            {t('landing.hero.title')}
          </h1>

          {/* Сипаттама мәтіні */}
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7 sm:mb-10 max-w-xl">
            {t('landing.hero.subtitle')}
          </p>

          {/* Негізгі шақыру батырмалары */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button size="lg" asChild>
              <Link to="/login" className="flex items-center justify-center gap-2">
                {t('landing.hero.cta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#features" className="text-center">{t('landing.hero.login')}</a>
            </Button>
          </div>
        </div>

        {/* Статистика жолағы — 3 негізгі санауыш */}
        <div className="mt-12 sm:mt-20 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-zinc-800 max-w-2xl">
          {(t('landing.stats', { returnObjects: true }) || []).map((s) => (
            <div key={s.label} className="bg-zinc-900 px-4 py-4 sm:px-8 sm:py-6">
              <div className="text-xl sm:text-2xl font-bold text-zinc-50 mb-1">{s.val}</div>
              <div className="text-xs sm:text-sm text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Мүмкіндіктер бөлімі */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
            {t('landing.features.title')}
          </h2>
        </div>

        {/* Мүмкіндіктер торы — иконамен және сипаттамамен */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(features) ? features : []).map((f, idx) => {
            const Icon = FEATURE_ICONS[idx] || BrainCircuit;
            return (
              <div
                key={idx}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-zinc-300" />
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Қалай жұмыс істейді бөлімі */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
            {t('landing.steps.title')}
          </h2>
        </div>

        {/* Нөмірленген қадамдар тізімі */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Array.isArray(steps) ? steps : []).map((step, i) => (
            <div key={i} className="flex gap-5">
              <div className="flex flex-col items-center">
                {/* Қадам нөмірі */}
                <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
                {/* Қадамдар арасындағы тік сызық */}
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-zinc-800 mt-3 min-h-[40px]" />
                )}
              </div>
              <div className="pb-8">
                <h3 className="font-semibold text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Рөлдер бөлімі — студент, психолог, әкімші */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
            {t('landing.roles.title')}
          </h2>
        </div>

        {/* Рөлдер карточкалары */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Array.isArray(roles) ? roles : []).map((r, idx) => (
            <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="font-semibold text-zinc-100 mb-2">{r.role}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-5">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Құпиялылық бөлімі — деректер қауіпсіздігі */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400 mb-4">
            <Lock className="w-3 h-3" />
            {t('landing.privacy.title')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
            {t('landing.privacy.title')}
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 mt-3 max-w-xl leading-relaxed">
            {t('landing.privacy.subtitle')}
          </p>
        </div>

        {/* Құпиялылық кепілдіктері торы */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Array.isArray(privacyItems) ? privacyItems : []).map((item, idx) => {
            const Icon = PRIVACY_ICONS[idx] || Lock;
            return (
              <div key={idx} className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <div className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* FAQ бөлімі — жиі қойылатын сұрақтар */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
            {t('landing.faq.title')}
          </h2>
        </div>

        {/* Аккордеон түріндегі FAQ тізімі */}
        <div className="max-w-2xl space-y-2">
          {(Array.isArray(faqItems) ? faqItems : []).map((item, idx) => (
            <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-zinc-100 hover:bg-zinc-800/50 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 shrink-0 ml-3 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-sm text-zinc-500 leading-relaxed border-t border-zinc-800 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Шақыру блогы — тіркелуге шақыру */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-10 sm:px-10 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-zinc-50">
            {t('landing.cta.title')}
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
            {t('landing.cta.subtitle')}
          </p>
          <Button size="lg" asChild>
            <Link to="/login" className="flex items-center gap-2 mx-auto w-fit">
              {t('landing.cta.button')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Футер — логотип және сипаттама */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center">
              <BrainCircuit className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-sm text-zinc-500">MindSpace</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 text-center">{t('landing.footer.description')}</p>
        </div>
      </footer>
    </div>
  );
}
