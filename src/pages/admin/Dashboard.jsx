import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Users, Activity, CalendarDays, AlertTriangle, Download } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).finally(() => setLoading(false));
  }, []);

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

  const {
    totalStudents, activeStudents, sessions, weeklyTrend,
    facultyStats, highStressStudents, avgMetrics, riskByFaculty,
  } = data || {};

  const highStressPct = totalStudents > 0
    ? ((highStressStudents / totalStudents) * 100).toFixed(0)
    : 0;

  const trendChart = {
    labels: (weeklyTrend || []).map((w) =>
      new Date(w.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
    ),
    datasets: [{
      label: 'Сессий',
      data: (weeklyTrend || []).map((w) => w.count),
      borderColor: '#71717a',
      backgroundColor: 'rgba(113,113,122,0.1)',
      fill: true, tension: 0.4, pointRadius: 3, borderWidth: 1.5,
    }],
  };

  const facultyChart = {
    labels: (facultyStats || []).map((f) => f.faculty),
    datasets: [
      { label: 'Студентов', data: (facultyStats || []).map((f) => f.students), backgroundColor: '#52525b', borderRadius: 4 },
      { label: 'Сессий', data: (facultyStats || []).map((f) => f.sessions), backgroundColor: '#3f3f46', borderRadius: 4 },
    ],
  };

  const metrics = avgMetrics || {};
  const METRIC_KEYS = [
    { key: 'avg_mood', label: 'Настроение' },
    { key: 'avg_stress', label: 'Стресс' },
    { key: 'avg_sleep', label: 'Сон' },
    { key: 'avg_energy', label: 'Энергия' },
    { key: 'avg_productivity', label: 'Продуктивность' },
  ];

  function downloadCSV() {
    if (!riskByFaculty || riskByFaculty.length === 0) return;
    const headers = ['Факультет', 'Ср. стресс', 'Ср. настроение', 'Активных студентов', 'Риск'];
    const rows = riskByFaculty.map((r) => {
      const risk = parseFloat(r.avg_stress) >= 3.5 ? 'Высокий'
        : parseFloat(r.avg_stress) >= 2.5 ? 'Умеренный' : 'Низкий';
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Панель управления</h1>
          <p className="text-sm text-zinc-500 mt-1">Агрегированная статистика по университету</p>
        </div>
        <Button
          variant="secondary"
          onClick={downloadCSV}
          disabled={!riskByFaculty || riskByFaculty.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Скачать отчёт (CSV)
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Студентов в системе', value: totalStudents || 0 },
          { icon: Activity, label: 'Активны на неделе', value: activeStudents || 0 },
          { icon: CalendarDays, label: 'Сессий всего', value: sessions?.total || 0 },
          { icon: AlertTriangle, label: 'Высокий стресс', value: `${highStressPct}%` },
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

      {/* Weekly metrics */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-300">Средние показатели за неделю</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {METRIC_KEYS.map((m) => {
              const val = parseFloat(metrics[m.key] || 0);
              return (
                <div key={m.key} className="text-center">
                  <div className="text-2xl font-bold text-zinc-100 mb-1">{val || '—'}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">{m.label}</div>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">Динамика обращений (30 дней)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container h-52">
              {(weeklyTrend || []).length > 0 ? (
                <Line data={trendChart} options={CHART_OPTS} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-zinc-600">Нет данных</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">Распределение по факультетам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container h-52">
              {(facultyStats || []).length > 0 ? (
                <Bar data={facultyChart} options={CHART_OPTS} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-zinc-600">Нет данных</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk table */}
      {(riskByFaculty || []).length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">Уровень стресса по факультетам</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Факультет</TableHead>
                  <TableHead>Ср. стресс</TableHead>
                  <TableHead>Ср. настроение</TableHead>
                  <TableHead>Активных студентов</TableHead>
                  <TableHead>Риск</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskByFaculty.map((r) => {
                  const stress = parseFloat(r.avg_stress);
                  const riskVariant = stress >= 3.5 ? 'destructive' : stress >= 2.5 ? 'warning' : 'success';
                  const riskLabel = stress >= 3.5 ? 'Высокий' : stress >= 2.5 ? 'Умеренный' : 'Низкий';
                  return (
                    <TableRow key={r.faculty}>
                      <TableCell className="font-medium">{r.faculty}</TableCell>
                      <TableCell>
                        <span className={stress >= 3.5 ? 'text-red-400 font-semibold' : 'text-zinc-300'}>
                          {r.avg_stress}
                        </span>
                      </TableCell>
                      <TableCell>{r.avg_mood}</TableCell>
                      <TableCell>{r.active_students}</TableCell>
                      <TableCell>
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
