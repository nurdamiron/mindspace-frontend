// useState, useEffect — компонент күйі мен жанама әсерлер үшін
import { useState, useEffect } from 'react';
// Link — ішкі сілтемелер үшін
import { Link } from 'react-router-dom';
// ReactMarkdown — Markdown мәтінін HTML форматында көрсету үшін
import ReactMarkdown from 'react-markdown';
// Chart.js компоненттері — сызықтық диаграмма үшін
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
// Line — сызықтық диаграмма компоненті
import { Line } from 'react-chartjs-2';
// Lucide иконалары — метрикалар, іс-әрекеттер және интерфейс үшін
import {
  Smile, Zap, Moon, Battery, Target,
  CheckSquare, Brain, MessageSquare, Users,
  ArrowRight, CalendarDays, Sparkles, AlertTriangle, Loader2, X,
} from 'lucide-react';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../../api/client';
// useAuth — ағымдағы пайдаланушы деректерін алу үшін
import { useAuth } from '../../context/AuthContext';
// shadcn/ui компоненттері — карта, батырма, бөлгіш, скелет
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Chart.js компоненттерін тіркеу
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// METRIC_ICONS — метрика атауын иконаға сәйкестендіретін объект
const METRIC_ICONS = { mood: Smile, stress: Zap, sleep: Moon, energy: Battery, productivity: Target };
// METRIC_COLORS — метрика атауын диаграмма түсіне сәйкестендіретін объект
const METRIC_COLORS = { mood: '#60a5fa', stress: '#f87171', sleep: '#a78bfa', energy: '#fbbf24', productivity: '#34d399' };
// CHART_COLORS — диаграмма жолдарының реттелген түстер массиві
const CHART_COLORS = ['#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399'];
// CHART_DASH — диаграмма жолдарының штрих үлгілері
const CHART_DASH = [[], [], [], [], []];

// computeAlerts — стресс, көңіл-күй және ұйқы деңгейіне байланысты ескертулерді есептейді
function computeAlerts(checkIns, weeklyAverages) {
  const alerts = [];
  if (!checkIns || checkIns.length === 0) return alerts;

  const lastDate = new Date(checkIns[checkIns.length - 1]?.date);
  const daysSinceLast = Math.floor((Date.now() - lastDate) / 86400000);

  // Соңғы 3 check-in де жоғары стресс болса ескертеді
  const recent = [...checkIns].reverse().slice(0, 3);
  if (recent.length >= 3 && recent.every(c => c.stress >= 4)) {
    alerts.push({ type: 'highStress' });
  }

  // Апталық орташа көңіл-күй төмен болса ескертеді
  const avgMood = parseFloat(weeklyAverages?.avg_mood || 0);
  if (avgMood > 0 && avgMood < 2.5) {
    alerts.push({ type: 'lowMood' });
  }

  // Апталық орташа ұйқы төмен болса ескертеді
  const avgSleep = parseFloat(weeklyAverages?.avg_sleep || 0);
  if (avgSleep > 0 && avgSleep < 2.5) {
    alerts.push({ type: 'lowSleep' });
  }

  return alerts;
}

// StudentDashboard — студент бақылау тақтасының негізгі компоненті
export default function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  // stats — серверден алынған статистика деректері
  const [stats, setStats] = useState(null);
  // loading — деректер жүктелу күйі
  const [loading, setLoading] = useState(true);
  // activeMetrics — диаграммада көрсетілетін белсенді метрикалар
  const [activeMetrics, setActiveMetrics] = useState(['mood', 'stress', 'sleep']);
  // insight — AI-инсайт мәтіні
  const [insight, setInsight] = useState(null);
  // insightLoading — AI инсайт жүктелу күйі
  const [insightLoading, setInsightLoading] = useState(false);
  // insightError — AI инсайт қате хабарламасы
  const [insightError, setInsightError] = useState(null);

  const METRIC_KEYS = ['mood', 'stress', 'sleep', 'energy', 'productivity'];

  // Бет жүктелгенде студент статистикасын серверден алады
  useEffect(() => {
    api.get('/student/stats').then(setStats).finally(() => setLoading(false));
  }, []);

  // loadInsight — AI-инсайт жүктеу функциясы
  async function loadInsight() {
    setInsightLoading(true);
    setInsightError(null);
    try {
      const res = await api.post('/student/ai-insight', {});
      setInsight(res.insight);
    } catch (err) {
      setInsightError(err.message);
    } finally {
      setInsightLoading(false);
    }
  }

  // Деректер жүктелу кезінде скелет жүктеу экранын көрсетеді
  if (loading) return (
    <div className="fade-in space-y-6">
      <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-64" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-80" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-52" /><Skeleton className="h-52" />
      </div>
    </div>
  );

  // checkIns — check-in тізімін дайындайды
  const checkIns = stats?.checkIns || [];
  // labels — диаграмма X осіндегі күн белгілері
  const labels = checkIns.map((c) =>
    new Date(c.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })
  );

  // chartData — сызба үшін деректер жиынын белсенді метрикалар бойынша құрады
  const chartData = {
    labels,
    datasets: activeMetrics.map((key, i) => {
      const idx = METRIC_KEYS.indexOf(key);
      return {
        label: t(`metrics.${key}`),
        data: checkIns.map((c) => c[key]),
        borderColor: CHART_COLORS[idx],
        backgroundColor: CHART_COLORS[idx] + '12',
        borderDash: CHART_DASH[idx],
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: CHART_COLORS[idx],
        borderWidth: 1.5,
      };
    }),
  };

  // chartOptions — сызбаның визуалды параметрлері
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#27272a',
        borderColor: '#3f3f46',
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', font: { size: 11 } } },
      y: { min: 1, max: 5, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', stepSize: 1, font: { size: 11 } } },
    },
  };

  // avgs — апталық орташа мәндер
  const avgs = stats?.weeklyAverages || {};
  // appts — кездесу санақтары
  const appts = stats?.appointments || {};
  // alerts — есептелген ескертулер тізімі
  const alerts = computeAlerts(checkIns, avgs);

  // QUICK_ACTIONS — жылдам сілтемелер тізімі
  const QUICK_ACTIONS = [
    { label: t('student.dashboard.actions.checkin'), href: '/student/checkin', icon: CheckSquare, primary: true },
    { label: t('student.dashboard.actions.screening'), href: '/student/screening', icon: Brain },
    { label: t('student.dashboard.actions.aiChat'), href: '/student/chat', icon: MessageSquare },
    { label: t('student.dashboard.actions.bookPsych'), href: '/student/psychologists', icon: Users },
  ];

  return (
    <div className="fade-in space-y-6">
      {/* Бет тақырыбы мен сәлемдесу */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
          {user?.name?.split(' ')[0] || t('nav.roles.student')}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">{t('student.dashboard.subtitle')}</p>
      </div>

      {/* Ақылды ескертулер блогы */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3"
            >
              <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-200">{t(`student.dashboard.alerts.${alert.type}.title`)}</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{t(`student.dashboard.alerts.${alert.type}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Апталық орташа метрика карталары */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['mood', 'stress', 'sleep', 'energy'].map((key) => {
          const Icon = METRIC_ICONS[key];
          const val = parseFloat(avgs[`avg_${key}`] || 0);
          const pct = (val / 5) * 100;
          return (
            <Card key={key} className="border-zinc-800 bg-zinc-900">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
                    {t(`metrics.${key}`)}
                  </span>
                  <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
                {/* Орташа мән және прогресс жолағы */}
                <div className="text-2xl font-bold text-zinc-50 mb-3">
                  {val || '—'}
                  <span className="text-xs text-zinc-600 font-normal ml-1">/5</span>
                </div>
                <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-zinc-400 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Динамика сызбасы картасы */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('student.dashboard.moodChart')}</CardTitle>
            {/* Белсенді метрикаларды қосу/өшіру батырмалары */}
            <div className="flex gap-1.5 flex-wrap">
              {METRIC_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() =>
                    setActiveMetrics((prev) =>
                      prev.includes(key)
                        ? prev.filter((k) => k !== key)
                        : [...prev, key]
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                    activeMetrics.includes(key)
                      ? 'bg-zinc-700 border-zinc-600 text-zinc-200'
                      : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {t(`metrics.${key}`)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Check-in деректері болса сызба, болмаса бос күй */}
          <div className="chart-container h-64">
            {checkIns.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-sm text-zinc-600">{t('student.dashboard.noCheckins')}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/student/checkin">{t('student.dashboard.actions.checkin')}</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI инсайт картасы */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              {t('student.dashboard.aiInsight')}
            </CardTitle>
            {/* Инсайтты жабу батырмасы */}
            {insight && (
              <button
                onClick={() => setInsight(null)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Инсайт жүктелмеген кезде сұрау батырмасы */}
          {!insight && !insightLoading && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-zinc-500">
                {t('student.dashboard.insightInfo')}
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={loadInsight}
                disabled={checkIns.length === 0}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('student.dashboard.getInsight')}
              </Button>
              {checkIns.length === 0 && (
                <p className="text-xs text-zinc-600">{t('student.dashboard.noCheckinsHint')}</p>
              )}
            </div>
          )}
          {/* Жүктелу индикаторы */}
          {insightLoading && (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
              <span className="text-sm text-zinc-500">{t('student.dashboard.loadingInsight')}</span>
            </div>
          )}
          {/* Қате хабарламасы */}
          {insightError && (
            <p className="text-sm text-red-400">{insightError}</p>
          )}
          {/* Markdown форматында AI инсайт мәтіні */}
          {insight && (
            <div className="prose prose-sm prose-invert max-w-none text-zinc-300 [&_strong]:text-zinc-100 [&_ul]:text-zinc-400 [&_li]:marker:text-zinc-600">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Төменгі қатар: жылдам әрекеттер және сеанс статистикасы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Жылдам сілтемелер картасы */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('student.dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  to={a.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors group ${
                    a.primary
                      ? 'bg-zinc-50 text-zinc-900 hover:bg-zinc-200'
                      : 'border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="font-medium">{a.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70 transition-opacity" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Кездесу және check-in санақтары картасы */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('student.appointments.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: t('student.appointments.title'), value: appts.total || 0, icon: CalendarDays },
                { label: t('status.completed'), value: appts.completed || 0, icon: CheckSquare },
                { label: t('status.scheduled'), value: appts.scheduled || 0, icon: ArrowRight },
                { label: t('student.checkIn.title'), value: checkIns.length, icon: Target },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Icon className="w-3.5 h-3.5" />
                        {s.label}
                      </div>
                      <span className="text-sm font-semibold text-zinc-200">{s.value}</span>
                    </div>
                    {i < 3 && <Separator className="bg-zinc-800/60" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
