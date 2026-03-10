import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { api } from '../../api/client';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PsychStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/psychologist/stats').then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  const { sessions, uniqueStudents, weeklyLoad, tagStats } = stats || {};

  const barData = {
    labels: (weeklyLoad || []).map(w => new Date(w.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Сессий',
      data: (weeklyLoad || []).map(w => w.count),
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
      borderColor: '#6366f1',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a2035', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8' } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', stepSize: 1, font: { size: 11 } } },
    },
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">📈 Моя статистика</div>
        <div className="page-subtitle">Обзор работы за всё время</div>
      </div>

      <div className="grid-3 mb-24">
        {[
          { icon: '📅', label: 'Всего сессий', value: sessions?.total || 0, color: 'rgba(99,102,241,0.15)' },
          { icon: '✅', label: 'Завершено', value: sessions?.completed || 0, color: 'rgba(16,185,129,0.15)' },
          { icon: '👤', label: 'Студентов', value: uniqueStudents || 0, color: 'rgba(59,130,246,0.15)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">📊 Нагрузка за 30 дней</div>
          <div className="chart-container" style={{ height: 220 }}>
            {(weeklyLoad || []).length > 0
              ? <Bar data={barData} options={barOptions} />
              : <div className="empty-state"><div className="empty-state-desc">Нет данных</div></div>
            }
          </div>
        </div>

        <div className="card">
          <div className="section-title">🏷️ Частые темы</div>
          {(tagStats || []).length === 0
            ? <div className="empty-state" style={{ padding: '30px 0' }}><div className="empty-state-desc">Нет данных</div></div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {tagStats.slice(0, 8).map(t => (
                  <div key={t.tags} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{t.tags}</div>
                      <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2 }}>
                        <div style={{ width: `${Math.min(100, (t.count / (tagStats[0]?.count || 1)) * 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.6s' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-light)', minWidth: 24, textAlign: 'right' }}>{t.count}</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
