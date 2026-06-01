// Компонент күйі мен әсерлер
import { useState, useEffect } from 'react';
// Ішкі сілтемелер
import { Link } from 'react-router-dom';
// Markdown көрсету
import ReactMarkdown from 'react-markdown';
// Сызба үшін Chart.js
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
// Сызықтық диаграмма
import { Line } from 'react-chartjs-2';
// Иконалар
import {
  Smile, Zap, Moon, Battery, Target,
  CheckSquare, Brain, MessageSquare, Users,
  ArrowRight, CalendarDays, Sparkles, AlertTriangle, Loader2, X,
  Star, ShieldCheck, ChevronRight,
} from 'lucide-react';
// Локализацияланған күн форматтағыш
import { formatDate } from '@/lib/dateUtils';
// Аударма хук
import { useTranslation } from 'react-i18next';
// HTTP сұраныстар
import { api } from '../../api/client';
// Ағымдағы қолданушы
import { useAuth } from '../../context/AuthContext';
// shadcn/ui компоненттері
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Chart.js тіркеу
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Метрика → икона
const METRIC_ICONS = { mood: Smile, stress: Zap, sleep: Moon, energy: Battery, productivity: Target };
// Метрика → түс
const METRIC_COLORS = { mood: '#60a5fa', stress: '#f87171', sleep: '#a78bfa', energy: '#fbbf24', productivity: '#818cf8' };
// Сызба жол түстері
const CHART_COLORS = ['#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#818cf8'];
// Сызба штрих үлгілері
const CHART_DASH = [[], [], [], [], []];

// Стресс, көңіл-күй, ұйқы бойынша ескертулерді есептейді
function computeAlerts(checkIns, weeklyAverages) {
  const alerts = [];
  if (!checkIns || checkIns.length === 0) return alerts;

  const lastDate = new Date(checkIns[checkIns.length - 1]?.date);
  const daysSinceLast = Math.floor((Date.now() - lastDate) / 86400000);

  // Соңғы 3 check-in жоғары стресс болса ескерту
  const recent = [...checkIns].reverse().slice(0, 3);
  if (recent.length >= 3 && recent.every(c => c.stress >= 4)) {
    alerts.push({ type: 'highStress' });
  }

  // Апталық орташа көңіл-күй төмен болса ескерту
  const avgMood = parseFloat(weeklyAverages?.avg_mood || 0);
  if (avgMood > 0 && avgMood < 2.5) {
    alerts.push({ type: 'lowMood' });
  }

  // Апталық орташа ұйқы төмен болса ескерту
  const avgSleep = parseFloat(weeklyAverages?.avg_sleep || 0);
  if (avgSleep > 0 && avgSleep < 2.5) {
    alerts.push({ type: 'lowSleep' });
  }

  return alerts;
}

// Студент бақылау тақтасы
export default function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  // Серверден алынған статистика
  const [stats, setStats] = useState(null);
  // Жүктелу күйі
  const [loading, setLoading] = useState(true);
  // Сызбада белсенді метрикалар
  const [activeMetrics, setActiveMetrics] = useState(['mood', 'stress', 'sleep']);
  // AI-инсайт мәтіні
  const [insight, setInsight] = useState(null);
  // Инсайт жүктелу күйі
  const [insightLoading, setInsightLoading] = useState(false);
  // Инсайт қатесі
  const [insightError, setInsightError] = useState(null);
  // Ұсынылған top-3 психолог
  const [recommendations, setRecommendations] = useState([]);

  const METRIC_KEYS = ['mood', 'stress', 'sleep', 'energy', 'productivity'];

  // Бет жүктелгенде статистиканы алу
  useEffect(() => {
    api.get('/student/stats').then(setStats).finally(() => setLoading(false));
    // Ұсыныстарды қатар жүктеу (UI тілін беру)
    api.get(`/student/recommendations?lang=${i18n.language}`)
      .then((data) => setRecommendations(data?.recommendations || []))
      .catch(() => {});
  }, [i18n.language]);

  // AI-инсайт жүктеу
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

  // Жүктелу кезінде скелет экраны
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

  // Check-in тізімі
  const checkIns = stats?.checkIns || [];
  // X осіндегі күн белгілері
  const labels = checkIns.map((c) =>
    formatDate(c.date, i18n.language, { month: 'short', day: 'numeric' })
  );

  // Белсенді метрикалар бойынша сызба деректері
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

  // Сызба визуал параметрлері
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#0f172a',
        bodyColor: '#475569',
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 11 } } },
      y: { min: 1, max: 5, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', stepSize: 1, font: { size: 11 } } },
    },
  };

  // Апталық орташа мәндер
  const avgs = stats?.weeklyAverages || {};
  // Кездесу санақтары
  const appts = stats?.appointments || {};
  // Есептелген ескертулер
  const alerts = computeAlerts(checkIns, avgs);

  // Жылдам сілтемелер
  const QUICK_ACTIONS = [
    { label: t('student.dashboard.actions.checkin'), href: '/student/checkin', icon: CheckSquare, primary: true },
    { label: t('student.dashboard.actions.screening'), href: '/student/screening', icon: Brain },
    { label: t('student.dashboard.actions.aiChat'), href: '/student/chat', icon: MessageSquare },
    { label: t('student.dashboard.actions.bookPsych'), href: '/student/psychologists', icon: Users },
  ];

  return (
    <div className="fade-in space-y-6">
      {/* Тақырып пен сәлемдесу */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 tracking-tight">
          {user?.name?.split(' ')[0] || t('nav.roles.student')}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">{t('student.dashboard.subtitle')}</p>
      </div>

      {/* Ескертулер блогы */}
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

      {/* Апталық орташа метрикалар */}
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
                {/* Орташа мән мен прогресс жолағы */}
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

      {/* Динамика сызбасы */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('student.dashboard.moodChart')}</CardTitle>
            {/* Метрика қосу/өшіру батырмалары */}
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
          {/* Check-in болса сызба, болмаса бос күй */}
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

      {/* AI инсайт */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              {t('student.dashboard.aiInsight')}
            </CardTitle>
            {/* Жабу батырмасы */}
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
          {/* Инсайт жоқ кезде сұрау батырмасы */}
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
          {/* AI инсайт мәтіні (markdown) */}
          {insight && (
            <div className="prose prose-sm prose-invert max-w-none text-zinc-300 [&_strong]:text-zinc-100 [&_ul]:text-zinc-400 [&_li]:marker:text-zinc-600">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ұсынылған top-3 маман */}
      {recommendations.length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <CardTitle className="text-sm font-medium text-zinc-300">
                {t('student.dashboard.recommendations.title')}
              </CardTitle>
            </div>
            <Link
              to="/student/psychologists"
              className="text-xs text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-0.5 transition-colors"
            >
              {t('student.dashboard.recommendations.viewAll')}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 mb-3">{t('student.dashboard.recommendations.subtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {recommendations.map((p) => {
                const reasonKeys = (p.reasons || []).map((r) => r.key);
                return (
                  <Link
                    key={p.id}
                    to="/student/psychologists"
                    className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-3 hover:border-zinc-600 hover:bg-zinc-800 transition-colors group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0">
                        {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <div className="font-medium text-zinc-100 text-sm truncate">{p.name}</div>
                          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        </div>
                        {p.specialization && (
                          <div className="text-[11px] text-zinc-500 truncate mt-0.5">{p.specialization}</div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-zinc-500">
                          {Number(p.rating_count) > 0 && (
                            <span className="inline-flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              {Number(p.avg_rating).toFixed(1)}
                            </span>
                          )}
                          {p.has_free_slots && (
                            <span className="text-emerald-400/80">{t('student.dashboard.recommendations.freeSlots')}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {reasonKeys.slice(0, 2).map((rk) => (
                            <span
                              key={rk}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400"
                            >
                              {t(`student.dashboard.recommendations.reasons.${rk}`)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Төменгі қатар: жылдам әрекеттер мен статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Жылдам сілтемелер */}
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

        {/* Кездесу мен check-in санақтары */}
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
