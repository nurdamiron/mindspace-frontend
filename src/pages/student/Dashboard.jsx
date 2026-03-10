import { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const METRICS = [
  { key: 'mood', label: 'Настроение', color: '#6366f1', emoji: '😊' },
  { key: 'stress', label: 'Стресс', color: '#ef4444', emoji: '😰' },
  { key: 'sleep', label: 'Сон', color: '#3b82f6', emoji: '😴' },
  { key: 'energy', label: 'Энергия', color: '#f59e0b', emoji: '⚡' },
  { key: 'productivity', label: 'Продуктивность', color: '#10b981', emoji: '🎯' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState(['mood', 'stress', 'sleep']);

  useEffect(() => {
    api.get('/student/stats').then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  const checkIns = stats?.checkIns || [];
  const labels = checkIns.map(c => new Date(c.date).toLocaleDateString('ru', { month: 'short', day: 'numeric' }));

  const chartData = {
    labels,
    datasets: activeMetrics.map(key => {
      const m = METRICS.find(m => m.key === key);
      return {
        label: m.label,
        data: checkIns.map(c => c[key]),
        borderColor: m.color,
        backgroundColor: m.color + '18',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        borderWidth: 2,
      };
    }),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2035',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } },
      y: { min: 1, max: 5, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', stepSize: 1, font: { size: 11 } } },
    },
  };

  const avgs = stats?.weeklyAverages || {};
  const appts = stats?.appointments || {};

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">👋 Привет, {user?.name?.split(' ')[0] || 'Студент'}!</div>
        <div className="page-subtitle">Вот как у тебя дела за последние 30 дней</div>
      </div>

      {/* Weekly averages */}
      <div className="grid-4 mb-24">
        {METRICS.slice(0, 4).map(m => {
          const val = parseFloat(avgs[`avg_${m.key}`] || 0);
          const pct = (val / 5) * 100;
          const color = m.key === 'stress' && val >= 3.5 ? 'var(--red-light)' : m.color;
          return (
            <div key={m.key} className="stat-card">
              <div className="stat-icon" style={{ background: m.color + '20' }}>{m.emoji}</div>
              <div className="stat-label">{m.label} (неделя)</div>
              <div className="stat-value" style={{ color, fontSize: 24 }}>{val || '—'}</div>
              <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2, marginTop: 4 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card mb-24">
        <div className="flex items-center justify-between mb-16">
          <div className="section-title" style={{ margin: 0 }}>📉 Динамика показателей</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveMetrics(prev =>
                  prev.includes(m.key) ? prev.filter(k => k !== m.key) : [...prev, m.key]
                )}
                className="btn btn-sm"
                style={{
                  background: activeMetrics.includes(m.key) ? m.color + '20' : 'transparent',
                  border: `1px solid ${activeMetrics.includes(m.key) ? m.color : 'var(--border)'}`,
                  color: activeMetrics.includes(m.key) ? m.color : 'var(--text-muted)',
                  borderRadius: 100,
                }}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-container" style={{ height: 280 }}>
          {checkIns.length > 0
            ? <Line data={chartData} options={chartOptions} />
            : <div className="empty-state"><div className="empty-state-icon">📊</div><p className="empty-state-desc">Нет данных. Заполни чек-ин!</p></div>
          }
        </div>
      </div>

      {/* Quick actions + sessions */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title">🚀 Быстрые действия</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '✅ Заполнить чек-ин сегодня', href: '/student/checkin', color: 'btn-primary' },
              { label: '🧠 Пройти скрининг', href: '/student/screening', color: 'btn-secondary' },
              { label: '💬 Поговорить с ИИ', href: '/student/chat', color: 'btn-secondary' },
              { label: '👨‍⚕️ Записаться к психологу', href: '/student/psychologists', color: 'btn-secondary' },
            ].map(a => (
              <a key={a.href} href={a.href} className={`btn ${a.color}`} style={{ justifyContent: 'center' }}>
                {a.label}
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">📅 Мои записи</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Всего записей', value: appts.total || 0, icon: '📅' },
              { label: 'Проведено сессий', value: appts.completed || 0, icon: '✅' },
              { label: 'Предстоит', value: appts.scheduled || 0, icon: '🕐' },
              { label: 'Чек-инов заполнено', value: checkIns.length, icon: '📝' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-muted">{s.icon} {s.label}</span>
                <span className="font-bold text-accent">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
