// useState, useEffect — компонент күйі мен жанама әсерлер үшін
import { useState, useEffect } from 'react';
// useParams, Link — URL параметрлері мен ішкі сілтемелер үшін
import { useParams, Link } from 'react-router-dom';
// Line — сызықтық диаграмма компоненті
import { Line } from 'react-chartjs-2';
// Chart.js компоненттері — сызықтық диаграмма үшін
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler
} from 'chart.js';
// Lucide иконалары — артқа, күнтізбе, растау, ескерту
import { ArrowLeft, CalendarDays, CheckCircle2, AlertTriangle } from 'lucide-react';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../../api/client';
// shadcn/ui компоненттері — карта, белгі, батырма, қойындылар, скелет
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Chart.js сызықтық диаграмма компоненттерін тіркеу
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// AdminStudentDetail — әкімші студент толық ақпараты беті
export default function AdminStudentDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  // data — студент туралы толық деректер
  const [data, setData] = useState(null);
  // loading — деректер жүктелу күйі
  const [loading, setLoading] = useState(true);

  // RISK_CONFIG — тәуекел деңгейлерінің белгі конфигурациясы
  const RISK_CONFIG = {
    low: { label: t('risk.low'), variant: 'success' },
    moderate: { label: t('risk.moderate'), variant: 'warning' },
    high: { label: t('risk.high'), variant: 'destructive' },
  };

  // METRICS — диаграммада көрсетілетін метрикалар және олардың стильдері
  const METRICS = [
    { key: 'mood', label: t('metrics.mood'), color: '#e4e4e7', dash: [] },
    { key: 'stress', label: t('metrics.stress'), color: '#a1a1aa', dash: [6, 3] },
    { key: 'sleep', label: t('metrics.sleep'), color: '#71717a', dash: [3, 3] },
    { key: 'energy', label: t('metrics.energy'), color: '#d4d4d8', dash: [8, 4, 2, 4] },
  ];

  // Студент деректерін ID бойынша жүктеу
  useEffect(() => {
    api.get(`/admin/students/${id}`).then(setData).finally(() => setLoading(false));
  }, [id]);

  // Жүктелу кезінде скелет UI
  if (loading) return (
    <div className="fade-in space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-72" />
    </div>
  );

  // Студент табылмаса қате хабары
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="font-medium text-zinc-300">{t('admin.studentDetail.notFound')}</p>
      <Button variant="secondary" asChild>
        <Link to="/admin/students"><ArrowLeft className="w-4 h-4 mr-1.5" />{t('common.back')}</Link>
      </Button>
    </div>
  );

  // API жауабынан деректерді шығарып алу
  const { student, checkIns, appointments, surveys } = data;
  const latestSurvey = surveys[0];
  const completedAppts = appointments.filter(a => a.status === 'completed');

  // labels — диаграмма X-осі үшін күн белгілері
  const labels = checkIns.map(c =>
    new Date(c.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })
  );

  // chartData — метрика диаграммасының деректер жиыны
  const chartData = {
    labels,
    datasets: METRICS.map(m => ({
      label: m.label,
      data: checkIns.map(c => c[m.key]),
      borderColor: m.color,
      backgroundColor: m.color + '10',
      borderDash: m.dash,
      tension: 0.4, fill: false, pointRadius: 2,
      pointBackgroundColor: m.color, borderWidth: 1.5,
    })),
  };

  // chartOptions — диаграмма стиль параметрлері
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#71717a', boxWidth: 12, font: { size: 11 } } },
      tooltip: { backgroundColor: '#27272a', borderColor: '#3f3f46', borderWidth: 1, cornerRadius: 6 },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', font: { size: 10 } } },
      y: { min: 1, max: 5, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', stepSize: 1, font: { size: 10 } } },
    },
  };

  return (
    <div className="fade-in space-y-5">
      {/* Артқа батырмасы және студент туралы негізгі ақпарат */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/admin/students" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />{t('common.back')}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{student.name || `#${student.id}`}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {student.email}
            {student.faculty && ` · ${student.faculty}`}
            {student.course && ` · ${student.course} ${t('common.course')}`}
            {student.gender && ` · ${student.gender === 'male' ? t('common.male') : t('common.female')}`}
          </p>
        </div>
      </div>

      {/* Шолу, тарих және сауалнамалар қойындылары */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('admin.studentDetail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="history">{t('admin.studentDetail.tabs.history')}</TabsTrigger>
          <TabsTrigger value="surveys">{t('admin.studentDetail.tabs.surveys')}</TabsTrigger>
        </TabsList>

        {/* Шолу қойындысы: KPI карточкалары және метрика диаграммасы */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: CalendarDays, label: t('admin.studentDetail.kpi.totalSessions'), value: appointments.length },
              { icon: CheckCircle2, label: t('admin.studentDetail.kpi.completed'), value: completedAppts.length },
              {
                icon: AlertTriangle, label: t('admin.studentDetail.kpi.riskFromScreening'),
                value: latestSurvey
                  ? <Badge variant={RISK_CONFIG[latestSurvey.risk_level]?.variant || 'default'}>
                      {RISK_CONFIG[latestSurvey.risk_level]?.label || '—'}
                    </Badge>
                  : '—',
              },
            ].map(s => {
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

          {/* Чекин динамикасының сызықтық диаграммасы */}
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-300">{t('admin.studentDetail.chart')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-56">
                {checkIns.length > 0
                  ? <Line data={chartData} options={chartOptions} />
                  : <div className="flex items-center justify-center h-full text-sm text-zinc-600">{t('admin.studentDetail.noCheckins')}</div>
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Сессиялар тарихы қойындысы */}
        <TabsContent value="history">
          {appointments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-zinc-600">{t('admin.studentDetail.noSessions')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(a => (
                <Card key={a.id} className="border-zinc-800 bg-zinc-900">
                  <CardContent className="p-4">
                    {/* Сессия күні, психолог аты және мәртебесі */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="font-medium text-sm text-zinc-100">
                          {new Date(a.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {a.psychologist_name && (
                          <span className="text-xs text-zinc-500 ml-2">· {a.psychologist_name}</span>
                        )}
                      </div>
                      <Badge variant={a.status === 'completed' ? 'success' : a.status === 'cancelled' ? 'secondary' : 'default'}>
                        {a.status === 'completed' ? t('status.completed') : a.status === 'cancelled' ? t('status.cancelled') : t('status.scheduled')}
                      </Badge>
                    </div>
                    {a.reason && <p className="text-xs text-zinc-600">{a.reason}</p>}
                    {/* Сессия жазбалары және жағдай өзгерісі */}
                    {a.session_notes && (
                      <div className="rounded-md bg-zinc-800 p-3 text-xs space-y-1 mt-2">
                        <div className="text-zinc-400">
                          {t('admin.studentDetail.conditionChange')}:{' '}
                          <span className="text-zinc-300 font-medium">{a.condition_before}/10</span>
                          {' → '}
                          <span className="text-zinc-200 font-medium">{a.condition_after}/10</span>
                        </div>
                        {a.tags && <div className="text-zinc-500">{a.tags}</div>}
                        <p className="text-zinc-400 leading-relaxed">{a.session_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Скрининг сауалнамалары тарихы */}
        <TabsContent value="surveys">
          {surveys.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-zinc-600">{t('admin.studentDetail.noSurveys')}</p>
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
      </Tabs>
    </div>
  );
}
