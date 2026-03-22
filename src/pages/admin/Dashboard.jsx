// useState, useEffect — компонент күйі мен жанама әсерлер үшін
import { useState, useEffect } from 'react';
// Bar, Line — баған және сызықтық диаграмма компоненттері
import { Bar, Line } from 'react-chartjs-2';
// Chart.js компоненттері — барлық диаграмма типтері үшін
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
// Lucide иконалары — пайдаланушылар, белсенділік, күнтізбе, ескерту, жүктеу
import { Users, Activity, CalendarDays, AlertTriangle, Download } from 'lucide-react';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../../api/client';
// shadcn/ui компоненттері — карта, батырма, белгі, скелет, кесте
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

// Chart.js компоненттерін тіркеу
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// CHART_OPTS — барлық диаграммалар үшін ортақ стиль параметрлері
const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#71717a', font: { size: 11 } } },
    tooltip: { backgroundColor: '#27272a', borderColor: '#3f3f46', borderWidth: 1, titleColor: '#fafafa', bodyColor: '#a1a1aa', cornerRadius: 6 },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#52525b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', font: { size: 11 } } },
  },
};

// AdminDashboard — әкімші бақылау тақтасы беті
export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  // data — бақылау тақтасы деректері
  const [data, setData] = useState(null);
  // loading — деректер жүктелу күйі
  const [loading, setLoading] = useState(true);

  // Беттің жүктелуінде бақылу тақтасы деректерін алу
  useEffect(() => {
    api.get('/admin/dashboard').then(setData).finally(() => setLoading(false));
  }, []);

  // Деректер жүктелу кезінде скелет UI көрсету
  if (loading) return (
    <div className="fade-in space-y-6">
      <div className="space-y-2"><Skeleton className="h-7 w-40" /><Skeleton className="h-4 w-56" /></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64" /><Skeleton className="h-64" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );

  // API жауабынан негізгі деректерді шығарып алу
  const {
    totalStudents, activeStudents, sessions, weeklyTrend,
    facultyStats, highStressStudents, avgMetrics, riskByFaculty,
  } = data || {};

  // highStressPct — жоғары стресс деңгейіндегі студенттер үлесін есептеу
  const highStressPct = totalStudents > 0
    ? ((highStressStudents / totalStudents) * 100).toFixed(0)
    : 0;

  // trendChart — апталық сессия трендінің диаграмма деректері
  const trendChart = {
    labels: (weeklyTrend || []).map((w) =>
      new Date(w.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })
    ),
    datasets: [{
      label: t('admin.dashboard.chartLabels.sessions'),
      data: (weeklyTrend || []).map((w) => w.count),
      borderColor: '#71717a',
      backgroundColor: 'rgba(113,113,122,0.1)',
      fill: true, tension: 0.4, pointRadius: 3, borderWidth: 1.5,
    }],
  };

  // facultyChart — факультет бойынша студент және сессия санының диаграмма деректері
  const facultyChart = {
    labels: (facultyStats || []).map((f) => f.faculty),
    datasets: [
      { label: t('admin.dashboard.chartLabels.students'), data: (facultyStats || []).map((f) => f.students), backgroundColor: '#52525b', borderRadius: 4 },
      { label: t('admin.dashboard.chartLabels.sessions'), data: (facultyStats || []).map((f) => f.sessions), backgroundColor: '#3f3f46', borderRadius: 4 },
    ],
  };

  // METRIC_KEYS — орташа метрикалар және олардың кілттері
  const metrics = avgMetrics || {};
  const METRIC_KEYS = [
    { key: 'avg_mood', label: t('metrics.mood') },
    { key: 'avg_stress', label: t('metrics.stress') },
    { key: 'avg_sleep', label: t('metrics.sleep') },
    { key: 'avg_energy', label: t('metrics.energy') },
    { key: 'avg_productivity', label: t('metrics.productivity') },
  ];

  // downloadCSV — факультет тәуекел деректерін CSV файлы ретінде жүктеу
  function downloadCSV() {
    if (!riskByFaculty || riskByFaculty.length === 0) return;
    const headers = t('admin.dashboard.csvHeaders', { returnObjects: true });
    const rows = riskByFaculty.map((r) => {
      const stress = parseFloat(r.avg_stress);
      const risk = stress >= 3.5 ? t('risk.high') : stress >= 2.5 ? t('risk.moderate') : t('risk.low');
      return [r.faculty, r.avg_stress, r.avg_mood, r.active_students, risk];
    });
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mindspace_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="fade-in space-y-6">
      {/* Тақырып және CSV жүктеу батырмасы */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-50 tracking-tight">{t('admin.dashboard.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('admin.dashboard.subtitle')}</p>
        </div>
        <Button
          variant="secondary"
          onClick={downloadCSV}
          disabled={!riskByFaculty || riskByFaculty.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {t('admin.dashboard.downloadReport')}
        </Button>
      </div>

      {/* KPI карточкалары: жалпы, белсенді студенттер, сессиялар, стресс */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Users, label: t('admin.dashboard.kpi.totalStudents'), value: totalStudents || 0 },
          { icon: Activity, label: t('admin.dashboard.kpi.activeStudents'), value: activeStudents || 0 },
          { icon: CalendarDays, label: t('admin.dashboard.kpi.totalSessions'), value: sessions?.total || 0 },
          { icon: AlertTriangle, label: t('admin.dashboard.kpi.highStress'), value: `${highStressPct}%` },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-zinc-800 bg-zinc-900">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wide font-medium leading-tight">{s.label}</span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 ml-1">
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-zinc-50">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Апталық орташа метрикалар прогресс жолақтарымен */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-300">{t('admin.dashboard.weeklyMetrics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {METRIC_KEYS.map((m) => {
              const val = parseFloat(metrics[m.key] || 0);
              return (
                <div key={m.key} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-zinc-100 mb-1">{val || '—'}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wide mb-2">{m.label}</div>
                  {/* 5 балдық шкала бойынша толтыру ені */}
                  <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-500 transition-all duration-700"
                      style={{ width: `${(val / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Тренд және факультет диаграммалары */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('admin.dashboard.trendChart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container h-44 sm:h-52">
              {(weeklyTrend || []).length > 0 ? (
                <Line data={trendChart} options={CHART_OPTS} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-zinc-600">{t('admin.dashboard.noData')}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('admin.dashboard.facultyChart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container h-44 sm:h-52">
              {(facultyStats || []).length > 0 ? (
                <Bar data={facultyChart} options={CHART_OPTS} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-zinc-600">{t('admin.dashboard.noData')}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Факультет бойынша тәуекел кестесі */}
      {(riskByFaculty || []).length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('admin.dashboard.riskTable')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">{t('admin.dashboard.tableHeaders.faculty')}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t('admin.dashboard.tableHeaders.avgStress')}</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('admin.dashboard.tableHeaders.avgMood')}</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('admin.dashboard.tableHeaders.activeStudents')}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t('admin.dashboard.tableHeaders.risk')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskByFaculty.map((r) => {
                  // Стресс деңгейіне қарай тәуекел белгісін анықтау
                  const stress = parseFloat(r.avg_stress);
                  const riskVariant = stress >= 3.5 ? 'destructive' : stress >= 2.5 ? 'warning' : 'success';
                  const riskLabel = stress >= 3.5 ? t('risk.high') : stress >= 2.5 ? t('risk.moderate') : t('risk.low');
                  return (
                    <TableRow key={r.faculty}>
                      <TableCell className="font-medium text-xs sm:text-sm">{r.faculty}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <span className={stress >= 3.5 ? 'text-red-400 font-semibold' : 'text-zinc-300'}>
                          {r.avg_stress}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{r.avg_mood}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{r.active_students}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant={riskVariant}>{riskLabel}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
