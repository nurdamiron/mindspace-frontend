import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler
} from 'chart.js';
import { ArrowLeft, CalendarDays, CheckCircle2, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const RISK_CONFIG = {
  low: { label: 'Низкий', variant: 'success' },
  moderate: { label: 'Умеренный', variant: 'warning' },
  high: { label: 'Высокий', variant: 'destructive' },
};

const METRICS = [
  { key: 'mood', label: 'Настроение', color: '#e4e4e7', dash: [] },
  { key: 'stress', label: 'Стресс', color: '#a1a1aa', dash: [6, 3] },
  { key: 'sleep', label: 'Сон', color: '#71717a', dash: [3, 3] },
  { key: 'energy', label: 'Энергия', color: '#d4d4d8', dash: [8, 4, 2, 4] },
];

export default function StudentCard() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    api.get(`/psychologist/students/${id}`).then(setData).finally(() => setLoading(false));
  }, [id]);

  async function loadAiSummary() {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.post(`/psychologist/students/${id}/ai-summary`, {});
      setAiSummary(res.summary);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="font-medium text-zinc-300">Студент не найден</p>
      <Button variant="secondary" asChild>
        <Link to="/psychologist/schedule">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Назад
        </Link>
      </Button>
    </div>
  );

  const { student, checkIns, appointments, surveys } = data;
  const labels = checkIns.map((c) =>
    new Date(c.date).toLocaleDateString('ru', { month: 'short', day: 'numeric' })
  );

  const chartData = {
    labels,
    datasets: METRICS.map((m) => ({
      label: m.label,
      data: checkIns.map((c) => c[m.key]),
      borderColor: m.color,
      backgroundColor: m.color + '10',
      borderDash: m.dash,
      tension: 0.4,
      fill: false,
      pointRadius: 2,
      pointBackgroundColor: m.color,
      borderWidth: 1.5,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#71717a', boxWidth: 12, font: { size: 11 } } },
      tooltip: { backgroundColor: '#27272a', borderColor: '#3f3f46', borderWidth: 1, cornerRadius: 6 },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', font: { size: 10 } } },
      y: { min: 1, max: 5, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', stepSize: 1, font: { size: 10 } } },
    },
  };

  const latestSurvey = surveys[0];
  const completedAppts = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/psychologist/schedule" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Назад
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
            Карточка студента #{student.id}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {student.faculty || 'Факультет не указан'}
            {student.course && ` · ${student.course} курс`}
            {student.gender && ` · ${student.gender === 'male' ? 'М' : 'Ж'}`}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
          <TabsTrigger value="surveys">Скрининг</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI-сводка
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: CalendarDays, label: 'Сессий всего', value: appointments.length },
              { icon: CheckCircle2, label: 'Завершено', value: completedAppts.length },
              {
                icon: AlertTriangle,
                label: 'Риск (скрининг)',
                value: latestSurvey ? (
                  <Badge variant={RISK_CONFIG[latestSurvey.risk_level]?.variant || 'default'}>
                    {RISK_CONFIG[latestSurvey.risk_level]?.label || '—'}
                  </Badge>
                ) : '—',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="border-zinc-800 bg-zinc-900">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">{s.label}</span>
                      <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-zinc-50">{s.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-300">Динамика за 30 дней</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-56">
                {checkIns.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-zinc-600">
                    Нет данных чек-инов
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-zinc-600">Нет прошлых сессий</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <Card key={a.id} className="border-zinc-800 bg-zinc-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-zinc-100">
                        {new Date(a.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <Badge variant={a.status === 'completed' ? 'success' : 'default'}>
                        {a.status === 'completed' ? 'Проведено' : 'Запланировано'}
                      </Badge>
                    </div>
                    {a.reason && (
                      <p className="text-xs text-zinc-600 mb-2">{a.reason}</p>
                    )}
                    {a.session_notes && (
                      <div className="rounded-md bg-zinc-800 p-3 text-xs space-y-1.5 mt-2">
                        <div className="text-zinc-400">
                          Состояние:{' '}
                          <span className="text-zinc-300 font-medium">{a.condition_before}/10</span>
                          {' → '}
                          <span className="text-zinc-200 font-medium">{a.condition_after}/10</span>
                        </div>
                        {a.tags && <div className="text-zinc-500">{a.tags}</div>}
                        {a.session_notes && (
                          <p className="text-zinc-400 leading-relaxed">{a.session_notes}</p>
                        )}
                        {a.recommend_followup && (
                          <p className="text-zinc-300">Рекомендована повторная встреча</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Surveys */}
        <TabsContent value="surveys">
          {surveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-zinc-600">Скрининги не проходил</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {surveys.map((s, i) => (
                <Card key={i} className="border-zinc-800 bg-zinc-900">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-zinc-100">
                        Скрининг {new Date(s.created_at).toLocaleDateString('ru')}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">Балл: {s.score}/25</div>
                    </div>
                    <Badge variant={RISK_CONFIG[s.risk_level]?.variant || 'default'}>
                      {RISK_CONFIG[s.risk_level]?.label || s.risk_level}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        {/* AI Summary */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-300">
                  Предсессионная AI-сводка
                </CardTitle>
                {!aiSummary && !aiLoading && (
                  <Button size="sm" variant="secondary" onClick={loadAiSummary} className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Сгенерировать
                  </Button>
                )}
                {aiSummary && (
                  <Button size="sm" variant="ghost" onClick={loadAiSummary} disabled={aiLoading} className="text-xs text-zinc-500">
                    Обновить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!aiSummary && !aiLoading && !aiError && (
                <p className="text-sm text-zinc-500">
                  Gemini AI проанализирует чек-ины, историю сессий и скрининги студента и составит краткую сводку для подготовки к встрече.
                </p>
              )}
              {aiLoading && (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                  <span className="text-sm text-zinc-500">Анализирую данные студента...</span>
                </div>
              )}
              {aiError && (
                <p className="text-sm text-red-400">{aiError}</p>
              )}
              {aiSummary && (
                <div className="prose prose-sm prose-invert max-w-none text-zinc-300 [&_strong]:text-zinc-100 [&_ul]:text-zinc-400 [&_li]:marker:text-zinc-600">
                  <ReactMarkdown>{aiSummary}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
