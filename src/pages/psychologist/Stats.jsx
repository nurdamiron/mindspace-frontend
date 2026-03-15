import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CalendarDays, CheckCircle2, Users } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PsychStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/psychologist/stats').then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="fade-in space-y-6">
      <div className="space-y-2"><Skeleton className="h-7 w-44" /><Skeleton className="h-4 w-60" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64" /><Skeleton className="h-64" />
      </div>
    </div>
  );

  const { sessions, uniqueStudents, weeklyLoad, tagStats } = stats || {};

  const barData = {
    labels: (weeklyLoad || []).map((w) =>
      new Date(w.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
    ),
    datasets: [{
      label: 'Сессий',
      data: (weeklyLoad || []).map((w) => w.count),
      backgroundColor: '#52525b',
      borderColor: '#71717a',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const barOptions = {
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
        cornerRadius: 6,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#52525b', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', stepSize: 1, font: { size: 11 } } },
    },
  };

  const STAT_CARDS = [
    { icon: CalendarDays, label: 'Всего сессий', value: sessions?.total || 0 },
    { icon: CheckCircle2, label: 'Завершено', value: sessions?.completed || 0 },
    { icon: Users, label: 'Студентов', value: uniqueStudents || 0 },
  ];

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Моя статистика</h1>
        <p className="text-sm text-zinc-500 mt-1">Обзор работы за всё время</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STAT_CARDS.map((s) => {
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
                <div className="text-3xl font-bold text-zinc-50">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">Нагрузка за 30 дней</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container h-52">
              {(weeklyLoad || []).length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-zinc-600">
                  Нет данных
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">Частые темы</CardTitle>
          </CardHeader>
          <CardContent>
            {(tagStats || []).length === 0 ? (
              <div className="flex items-center justify-center h-52 text-sm text-zinc-600">
                Нет данных
              </div>
            ) : (
              <div className="space-y-3">
                {tagStats.slice(0, 8).map((t) => (
                  <div key={t.tags} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-300 mb-1.5">{t.tags}</div>
                      <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-zinc-500 transition-all duration-700"
                          style={{ width: `${Math.min(100, (t.count / (tagStats[0]?.count || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 w-5 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
