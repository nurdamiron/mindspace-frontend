import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Smile, Zap, Moon, Battery, Target,
  CheckSquare, Brain, MessageSquare, Users,
  ArrowRight, CalendarDays, Sparkles, AlertTriangle, Loader2, X,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const METRICS = [
  { key: 'mood', label: 'Настроение', icon: Smile, color: '#a1a1aa' },
  { key: 'stress', label: 'Стресс', icon: Zap, color: '#71717a' },
  { key: 'sleep', label: 'Сон', icon: Moon, color: '#52525b' },
  { key: 'energy', label: 'Энергия', icon: Battery, color: '#3f3f46' },
  { key: 'productivity', label: 'Продуктивность', icon: Target, color: '#27272a' },
];

// Distinct shades + dash patterns for monochromatic chart readability
const CHART_COLORS = ['#e4e4e7', '#a1a1aa', '#71717a', '#d4d4d8', '#52525b'];
const CHART_DASH = [[], [6, 3], [3, 3], [8, 4, 2, 4], [5, 2]];

const QUICK_ACTIONS = [
  { label: 'Заполнить чек-ин', href: '/student/checkin', icon: CheckSquare, primary: true },
  { label: 'Пройти скрининг', href: '/student/screening', icon: Brain },
  { label: 'ИИ-помощник', href: '/student/chat', icon: MessageSquare },
  { label: 'Записаться к психологу', href: '/student/psychologists', icon: Users },
];

function computeAlerts(checkIns, weeklyAverages) {
  const alerts = [];
  if (!checkIns || checkIns.length === 0) return alerts;

  // No check-in for 3+ days
  const lastDate = new Date(checkIns[checkIns.length - 1]?.date);
  const daysSinceLast = Math.floor((Date.now() - lastDate) / 86400000);
  if (daysSinceLast >= 3) {
    alerts.push({ type: 'warning', text: `Последний чек-ин был ${daysSinceLast} дня назад. Не забывайте отслеживать своё состояние.` });
  }

  // High stress for 3+ consecutive days (most recent)
  const recent = [...checkIns].reverse().slice(0, 3);
  if (recent.length >= 3 && recent.every(c => c.stress >= 4)) {
    alerts.push({ type: 'warning', text: 'Высокий уровень стресса уже несколько дней подряд. Рекомендуем поговорить с психологом.' });
  }

  // Low mood average this week
  const avgMood = parseFloat(weeklyAverages?.avg_mood || 0);
  if (avgMood > 0 && avgMood < 2.5) {
    alerts.push({ type: 'info', text: 'Среднее настроение на этой неделе ниже нормы. ИИ-помощник готов выслушать.' });
  }

  return alerts;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState(['mood', 'stress', 'sleep']);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(null);

  useEffect(() => {
    api.get('/student/stats').then(setStats).finally(() => setLoading(false));
  }, []);

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

  const checkIns = stats?.checkIns || [];
  const labels = checkIns.map((c) =>
    new Date(c.date).toLocaleDateString('ru', { month: 'short', day: 'numeric' })
  );

  const chartData = {
    labels,
    datasets: activeMetrics.map((key, i) => {
      const m = METRICS.find((m) => m.key === key);
      const idx = METRICS.findIndex((m) => m.key === key);
      return {
        label: m.label,
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

  const avgs = stats?.weeklyAverages || {};
  const appts = stats?.appointments || {};
  const alerts = computeAlerts(checkIns, avgs);

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
          Привет, {user?.name?.split(' ')[0] || 'Студент'}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Вот как у тебя дела за последние 30 дней</p>
      </div>

      {/* Smart alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3"
            >
              <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300 leading-relaxed">{alert.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.slice(0, 4).map((m) => {
          const Icon = m.icon;
          const val = parseFloat(avgs[`avg_${m.key}`] || 0);
          const pct = (val / 5) * 100;
          return (
            <Card key={m.key} className="border-zinc-800 bg-zinc-900">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
                    {m.label}
                  </span>
                  <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
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

      {/* Chart */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-medium text-zinc-300">Динамика показателей</CardTitle>
            <div className="flex gap-1.5 flex-wrap">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() =>
                    setActiveMetrics((prev) =>
                      prev.includes(m.key)
                        ? prev.filter((k) => k !== m.key)
                        : [...prev, m.key]
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                    activeMetrics.includes(m.key)
                      ? 'bg-zinc-700 border-zinc-600 text-zinc-200'
                      : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="chart-container h-64">
            {checkIns.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-sm text-zinc-600">Нет данных. Заполни чек-ин!</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/student/checkin">Заполнить</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              AI-анализ состояния
            </CardTitle>
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
          {!insight && !insightLoading && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-zinc-500">
                Gemini AI проанализирует ваши чек-ины и даст персональные рекомендации.
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={loadInsight}
                disabled={checkIns.length === 0}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Получить анализ
              </Button>
              {checkIns.length === 0 && (
                <p className="text-xs text-zinc-600">Нужен хотя бы один чек-ин</p>
              )}
            </div>
          )}
          {insightLoading && (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
              <span className="text-sm text-zinc-500">Анализирую данные...</span>
            </div>
          )}
          {insightError && (
            <p className="text-sm text-red-400">{insightError}</p>
          )}
          {insight && (
            <div className="prose prose-sm prose-invert max-w-none text-zinc-300 [&_strong]:text-zinc-100 [&_ul]:text-zinc-400 [&_li]:marker:text-zinc-600">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick actions */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">Быстрые действия</CardTitle>
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

        {/* Sessions summary */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">Мои записи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Всего записей', value: appts.total || 0, icon: CalendarDays },
                { label: 'Проведено сессий', value: appts.completed || 0, icon: CheckSquare },
                { label: 'Предстоит', value: appts.scheduled || 0, icon: ArrowRight },
                { label: 'Чек-инов заполнено', value: checkIns.length, icon: Target },
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
