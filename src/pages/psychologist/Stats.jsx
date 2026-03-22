import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CalendarDays, CheckCircle2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Chart.js компоненттерін тіркеу
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Психолог статистикасы беті
export default function PsychStats() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Статистика деректерін API-дан жүктеу
  useEffect(() => {
    api.get('/psychologist/stats').then(setStats).finally(() => setLoading(false));
  }, []);

  // Жүктелу кезінде скелет интерфейсін көрсету
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

  // Апталық жүктеме диаграммасының деректері
  const barData = {
    labels: (weeklyLoad || []).map((w) =>
      new Date(w.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })
    ),
    datasets: [{
      label: t('common.sessions'),
      data: (weeklyLoad || []).map((w) => w.count),
      backgroundColor: '#52525b',
      borderColor: '#71717a',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  // Баған диаграммасының стиль баптаулары
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

  // KPI карточкаларының конфигурациясы
  const STAT_CARDS = [
    { icon: CalendarDays, label: t('psychologist.stats.completedSessions'), value: sessions?.total || 0 },
    { icon: CheckCircle2, label: t('status.completed'), value: sessions?.completed || 0 },
    { icon: Users, label: t('psychologist.stats.totalStudents'), value: uniqueStudents || 0 },
  ];

  return (
    <div className="fade-in space-y-6">
      {/* Бет тақырыбы */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('psychologist.stats.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('psychologist.stats.subtitle')}</p>
      </div>

      {/* KPI карточкалары */}
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
        {/* Апталық сеанстар бар диаграммасы */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('psychologist.stats.sessionsByWeek')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container h-52">
              {(weeklyLoad || []).length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-zinc-600">
                  {t('psychologist.stats.noData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Тег бойынша тәуекел бөлінісі */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300">{t('psychologist.stats.riskDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {(tagStats || []).length === 0 ? (
              <div className="flex items-center justify-center h-52 text-sm text-zinc-600">
                {t('psychologist.stats.noData')}
              </div>
            ) : (
              // Ең жиі кездесетін 8 тегті жүйелі жолақтармен көрсету
              <div className="space-y-3">
                {tagStats.slice(0, 8).map((t_item) => (
                  <div key={t_item.tags} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-300 mb-1.5">{t_item.tags}</div>
                      <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                        {/* Ең жоғары мәнге қатысты пайызды есептеп, ені белгілеу */}
                        <div
                          className="h-full rounded-full bg-zinc-500 transition-all duration-700"
                          style={{ width: `${Math.min(100, (t_item.count / (tagStats[0]?.count || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 w-5 text-right">{t_item.count}</span>
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
