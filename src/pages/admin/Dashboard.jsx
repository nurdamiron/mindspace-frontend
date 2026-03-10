import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { api } from '../../api/client';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  const {
    totalStudents, activeStudents, sessions, weeklyTrend,
    facultyStats, highStressStudents, avgMetrics, riskByFaculty,
  } = data || {};

  const trendChart = {
    labels: (weeklyTrend || []).map(w => new Date(w.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Сессий',
      data: (weeklyTrend || []).map(w => w.count),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.12)',
      fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2,
    }],
  };

  const facultyChart = {
    labels: (facultyStats || []).map(f => f.faculty),
    datasets: [
      { label: 'Студентов', data: (facultyStats || []).map(f => f.students), backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 },
      { label: 'Сессий', data: (facultyStats || []).map(f => f.sessions), backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6 },
    ],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } }, tooltip: { backgroundColor: '#1a2035', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } },
    },
  };

  const metrics = avgMetrics || {};
  const stressPct = ((parseFloat(metrics.avg_stress) || 0) / 5 * 100).toFixed(0);
  const highStressPct = totalStudents > 0 ? ((highStressStudents / totalStudents) * 100).toFixed(0) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">🏛️ Панель управления</div>
        <div className="page-subtitle">Агрегированная статистика по университету</div>
      </div>

      {/* KPI cards */}
      <div className="grid-4 mb-24">
        {[
          { icon: '🎓', label: 'Студентов в системе', value: totalStudents || 0, color: 'rgba(99,102,241,0.15)', accent: '#6366f1' },
          { icon: '✅', label: 'Активны на неделе', value: activeStudents || 0, color: 'rgba(16,185,129,0.15)', accent: '#10b981' },
          { icon: '📅', label: 'Сессий всего', value: sessions?.total || 0, color: 'rgba(59,130,246,0.15)', accent: '#3b82f6' },
          { icon: '⚠️', label: 'Высокий стресс', value: `${highStressPct}%`, color: 'rgba(239,68,68,0.15)', accent: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Weekly metrics */}
      <div className="card mb-24">
        <div className="section-title">📊 Средние показатели за неделю</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
          {[
            { key: 'avg_mood', label: 'Настроение', emoji: '😊', color: '#6366f1' },
            { key: 'avg_stress', label: 'Стресс', emoji: '😰', color: '#ef4444' },
            { key: 'avg_sleep', label: 'Сон', emoji: '😴', color: '#3b82f6' },
            { key: 'avg_energy', label: 'Энергия', emoji: '⚡', color: '#f59e0b' },
            { key: 'avg_productivity', label: 'Прод-ть', emoji: '🎯', color: '#10b981' },
          ].map(m => {
            const val = parseFloat(metrics[m.key] || 0);
            return (
              <div key={m.key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{m.emoji}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: m.color, margin: '6px 0 2px' }}>{val || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{m.label}</div>
                <div style={{ height: 3, background: 'var(--bg-secondary)', borderRadius: 2, marginTop: 8 }}>
                  <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: m.color, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">📈 Динамика обращений (30 дней)</div>
          <div className="chart-container" style={{ height: 220 }}>
            {(weeklyTrend || []).length > 0
              ? <Line data={trendChart} options={chartOpts} />
              : <div className="empty-state"><div className="empty-state-desc">Нет данных</div></div>
            }
          </div>
        </div>

        <div className="card">
          <div className="section-title">🎓 Распределение по факультетам</div>
          <div className="chart-container" style={{ height: 220 }}>
            {(facultyStats || []).length > 0
              ? <Bar data={facultyChart} options={chartOpts} />
              : <div className="empty-state"><div className="empty-state-desc">Нет данных</div></div>
            }
          </div>
        </div>
      </div>

      {(riskByFaculty || []).length > 0 && (
        <div className="card mt-24">
          <div className="section-title">⚠️ Уровень стресса по факультетам</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Факультет</th>
                  <th>Ср. стресс</th>
                  <th>Ср. настроение</th>
                  <th>Активных студентов</th>
                  <th>Риск</th>
                </tr>
              </thead>
              <tbody>
                {riskByFaculty.map(r => (
                  <tr key={r.faculty}>
                    <td style={{ fontWeight: 600 }}>{r.faculty}</td>
                    <td><span style={{ color: parseFloat(r.avg_stress) >= 3.5 ? 'var(--red-light)' : 'var(--green-light)', fontWeight: 700 }}>{r.avg_stress}</span></td>
                    <td>{r.avg_mood}</td>
                    <td>{r.active_students}</td>
                    <td>
                      {parseFloat(r.avg_stress) >= 3.5
                        ? <span className="badge badge-red">Высокий</span>
                        : parseFloat(r.avg_stress) >= 2.5
                        ? <span className="badge badge-orange">Умеренный</span>
                        : <span className="badge badge-green">Низкий</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
