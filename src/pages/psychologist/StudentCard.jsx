import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler
} from 'chart.js';
import { ArrowLeft, CalendarDays, CheckCircle2, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Chart.js компоненттерін тіркеу
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// Метрика сызықтарының түстері мен стильдері
const METRIC_COLORS = {
  mood:       { color: '#60a5fa', dash: [] },
  stress:     { color: '#f87171', dash: [] },
  sleep:      { color: '#a78bfa', dash: [] },
  energy:     { color: '#fbbf24', dash: [] },
};

// Студент картасы — толық ақпарат, сеанс тарихы және AI талдауы
export default function StudentCard() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Студент деректерін идентификатор бойынша жүктеу
  useEffect(() => {
    api.get(`/psychologist/students/${id}`).then(setData).finally(() => setLoading(false));
  }, [id]);

  // AI жиынтығын серверден сұрататын функция
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

  // Тәуекел деңгейлерінің белгі конфигурациясы
  const RISK_CONFIG = {
    low: { label: t('risk.low'), variant: 'success' },
    moderate: { label: t('risk.moderate'), variant: 'warning' },
    high: { label: t('risk.high'), variant: 'destructive' },
  };

  // Жүктелу индикаторы
  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );

  // Студент табылмаса қате хабарламасы
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="font-medium text-zinc-300">{t('admin.studentDetail.notFound')}</p>
      <Button variant="secondary" asChild>
        <Link to="/psychologist/schedule">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('common.back')}
        </Link>
      </Button>
    </div>
  );

  const { student, checkIns, appointments, surveys } = data;
  const METRIC_KEYS = ['mood', 'stress', 'sleep', 'energy'];

  // Графиктің X өсі үшін күн белгілері
  const labels = checkIns.map((c) =>
    new Date(c.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })
  );

  // Метрика сызықтық диаграммасының деректері
  const chartData = {
    labels,
    datasets: METRIC_KEYS.map((key) => {
      const m = METRIC_COLORS[key];
      return {
        label: t(`metrics.${key}`),
        data: checkIns.map((c) => c[key]),
        borderColor: m.color,
        backgroundColor: m.color + '10',
        borderDash: m.dash,
        tension: 0.4,
        fill: false,
        pointRadius: 2,
        pointBackgroundColor: m.color,
        borderWidth: 1.5,
      };
    }),
  };

  // Диаграмма стиль баптаулары
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

  // Соңғы сауалнама және аяқталған кездесулер
  const latestSurvey = surveys[0];
  const completedAppts = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="fade-in space-y-5">
      {/* Артқа сілтеме және студент тақырыбы */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/psychologist/schedule" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('common.back')}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
            {t('psychologist.studentCard.title')} #{student.id}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {student.faculty || '—'}
            {student.course && ` · ${student.course} ${t('common.course')}`}
            {student.gender && ` · ${student.gender === 'male' ? t('common.male') : t('common.female')}`}
          </p>
        </div>
      </div>

      {/* Жиынтық, тарих, сауалнамалар және AI қойындылары */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('psychologist.studentCard.tabs.checkins')}</TabsTrigger>
          <TabsTrigger value="history">{t('psychologist.studentCard.tabs.appointments')}</TabsTrigger>
          <TabsTrigger value="surveys">{t('psychologist.studentCard.tabs.surveys')}</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI
          </TabsTrigger>
        </TabsList>

        {/* Жиынтық қойындысы: KPI карточкалары және метрика диаграммасы */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: CalendarDays, label: t('psychologist.studentCard.tabs.appointments'), value: appointments.length },
              { icon: CheckCircle2, label: t('status.completed'), value: completedAppts.length },
              {
                icon: AlertTriangle,
                label: t('psychologist.studentCard.riskLevel'),
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

          {/* Check-in метрикалары сызықтық диаграммасы */}
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-300">{t('admin.studentDetail.chart')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-56">
                {checkIns.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-zinc-600">
                    {t('psychologist.studentCard.noCheckins')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Кездесу тарихы қойындысы */}
        <TabsContent value="history">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-zinc-600">{t('psychologist.studentCard.noAppointments')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <Card key={a.id} className="border-zinc-800 bg-zinc-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-zinc-100">
                        {new Date(a.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <Badge variant={a.status === 'completed' ? 'success' : 'default'}>
                        {a.status === 'completed' ? t('status.completed') : t('status.scheduled')}
                      </Badge>
                    </div>
                    {a.reason && (
                      <p className="text-xs text-zinc-600 mb-2">{a.reason}</p>
                    )}
                    {/* Сеанс жазбасы бар болса, жағдай өзгерісін көрсету */}
                    {a.session_notes && (
                      <div className="rounded-md bg-zinc-800 p-3 text-xs space-y-1.5 mt-2">
                        <div className="text-zinc-400">
                          {t('admin.studentDetail.conditionChange')}:{' '}
                          <span className="text-zinc-300 font-medium">{a.condition_before}/10</span>
                          {' → '}
                          <span className="text-zinc-200 font-medium">{a.condition_after}/10</span>
                        </div>
                        {a.tags && <div className="text-zinc-500">{a.tags}</div>}
                        {a.session_notes && (
                          <p className="text-zinc-400 leading-relaxed">{a.session_notes}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Сауалнамалар қойындысы */}
        <TabsContent value="surveys">
          {surveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-zinc-600">{t('psychologist.studentCard.noSurveys')}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {surveys.map((s, i) => (
                <Card key={i} className="border-zinc-800 bg-zinc-900">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-zinc-100">
                        {new Date(s.created_at).toLocaleDateString(i18n.language)}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">{t('admin.studentDetail.surveyScore', { score: s.score })}</div>
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

        {/* AI жиынтығы қойындысы */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-300">
                  {t('psychologist.studentCard.aiSummary.title')}
                </CardTitle>
                {/* AI жүктелмеген кезде генерациялау батырмасы */}
                {!aiSummary && !aiLoading && (
                  <Button size="sm" variant="secondary" onClick={loadAiSummary} className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('psychologist.studentCard.aiSummary.generate')}
                  </Button>
                )}
                {/* AI нәтижесі бар кезде қайта жасау батырмасы */}
                {aiSummary && (
                  <Button size="sm" variant="ghost" onClick={loadAiSummary} disabled={aiLoading} className="text-xs text-zinc-500">
                    {t('psychologist.studentCard.aiSummary.generate')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Генерация басталмаған бастапқы күй */}
              {!aiSummary && !aiLoading && !aiError && (
                <p className="text-sm text-zinc-500">
                  {t('psychologist.studentCard.aiSummary.info')}
                </p>
              )}
              {/* AI жүктелу индикаторы */}
              {aiLoading && (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                  <span className="text-sm text-zinc-500">{t('psychologist.studentCard.aiSummary.generating')}</span>
                </div>
              )}
              {/* Қате хабарламасы */}
              {aiError && (
                <p className="text-sm text-red-400">{aiError}</p>
              )}
              {/* AI жиынтығын Markdown форматында шығару */}
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
