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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'ИИ-поддержка 24/7',
    desc: 'Анонимный чат-ассистент, доступный в любое время. Поддержка и первичная помощь без ожидания.',
  },
  {
    icon: CalendarCheck,
    title: 'Запись к психологу',
    desc: 'Просматривайте расписание специалистов и записывайтесь на консультации онлайн или очно.',
  },
  {
    icon: BarChart3,
    title: 'Мониторинг состояния',
    desc: 'Ежедневные чек-ины и визуализация динамики настроения, стресса, сна и энергии.',
  },
  {
    icon: ShieldCheck,
    title: 'Полная конфиденциальность',
    desc: 'Все данные защищены. Информация не передаётся третьим лицам без вашего согласия.',
  },
  {
    icon: MessageSquare,
    title: 'Психологический скрининг',
    desc: 'Быстрая оценка психологического состояния с рекомендациями по дальнейшим шагам.',
  },
  {
    icon: Clock,
    title: 'Аналитика для администраторов',
    desc: 'Сводные данные по факультетам, уровни стресса и мониторинг активности студентов.',
  },
];

const STEPS = [
  { num: '01', title: 'Зарегистрируйтесь', desc: 'Создайте аккаунт как студент, психолог или администратор.' },
  { num: '02', title: 'Заполните чек-ин', desc: 'Оцените своё состояние по пяти показателям за несколько секунд.' },
  { num: '03', title: 'Получите поддержку', desc: 'Пообщайтесь с ИИ или запишитесь к квалифицированному специалисту.' },
];

export default function Landing() {
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
              <Link to="/login">Войти</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/login">Начать</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Психологическая поддержка студентов
          </div>

          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-6 text-zinc-50">
            Ваше психологическое
            <br />
            <span className="text-zinc-400">благополучие важно</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl">
            MindSpace — платформа психологической поддержки для университетов.
            Анонимная помощь, запись к специалистам и мониторинг состояния — всё в одном месте.
          </p>

          <div className="flex items-center gap-3">
            <Button size="lg" asChild>
              <Link to="/login" className="flex items-center gap-2">
                Начать работу
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#features">Узнать больше</a>
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-zinc-800 max-w-2xl">
          {[
            { val: '24/7', label: 'ИИ-поддержка' },
            { val: '100%', label: 'Конфиденциально' },
            { val: '3 мин', label: 'Скрининг' },
          ].map((s) => (
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
          <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">Возможности</p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50">
            Всё необходимое для поддержки
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
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
          <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">Как это работает</p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50">
            Три шага к поддержке
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                  {step.num}
                </div>
                {i < STEPS.length - 1 && (
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
          <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">Для кого</p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50">
            Платформа для каждой роли
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              role: 'Студент',
              desc: 'Чек-ины, скрининг, ИИ-помощник, запись к психологу, история консультаций.',
              features: ['Ежедневный мониторинг', 'Анонимный ИИ-чат', 'Онлайн-запись'],
            },
            {
              role: 'Психолог',
              desc: 'Управление расписанием, карточки студентов, заметки и статистика нагрузки.',
              features: ['Расписание сессий', 'Карточки клиентов', 'Аналитика работы'],
            },
            {
              role: 'Администратор',
              desc: 'Сводная статистика по факультетам, управление психологами и слотами.',
              features: ['Дашборд университета', 'Управление персоналом', 'Экспорт отчётов'],
            },
          ].map((r) => (
            <div key={r.role} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="font-semibold text-zinc-100 mb-2">{r.role}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-5">{r.desc}</p>
              <ul className="space-y-2">
                {r.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <ChevronRight className="w-3 h-3 text-zinc-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-10 py-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-zinc-50">
            Начните сегодня
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
            Войдите в систему и получите доступ ко всем инструментам психологической поддержки.
          </p>
          <Button size="lg" asChild>
            <Link to="/login" className="flex items-center gap-2 mx-auto w-fit">
              Войти в платформу
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
          <p className="text-sm text-zinc-600">Психологическая поддержка студентов</p>
        </div>
      </footer>
    </div>
  );
}
