import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BrainCircuit,
  CalendarCheck,
  BarChart3,
  MessageSquare,
  Clock,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const FEATURE_ICONS = [BrainCircuit, CalendarCheck, BarChart3, ShieldCheck, MessageSquare, Clock];

export default function Landing() {
  const { t } = useTranslation();

  const features = t('landing.features.items', { returnObjects: true });
  const steps = t('landing.steps.items', { returnObjects: true });
  const roles = t('landing.roles.items', { returnObjects: true });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Nav */}
      <header className="border-b border-zinc-800 sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-zinc-50 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-zinc-900" />
            </div>
            <span className="font-semibold text-sm tracking-tight">MindSpace</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">{t('landing.nav.login')}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/login">{t('landing.nav.register')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            {t('landing.hero.badge')}
          </div>

          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-6 text-zinc-50">
            {t('landing.hero.title')}
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex items-center gap-3">
            <Button size="lg" asChild>
              <Link to="/login" className="flex items-center gap-2">
                {t('landing.hero.cta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#features">{t('landing.hero.login')}</a>
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-zinc-800 max-w-2xl">
          {(t('landing.stats', { returnObjects: true }) || []).map((s) => (
            <div key={s.label} className="bg-zinc-900 px-8 py-6">
              <div className="text-2xl font-bold text-zinc-50 mb-1">{s.val}</div>
              <div className="text-sm text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50">
            {t('landing.features.title')}
          </h2>
        </div>

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

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50">
            {t('landing.steps.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Array.isArray(steps) ? steps : []).map((step, i) => (
            <div key={i} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
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

      {/* Roles */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50">
            {t('landing.roles.title')}
          </h2>
        </div>

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

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-10 py-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-zinc-50">
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

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center">
              <BrainCircuit className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-sm text-zinc-500">MindSpace</span>
          </div>
          <p className="text-sm text-zinc-600">{t('landing.footer.description')}</p>
        </div>
      </footer>
    </div>
  );
}
