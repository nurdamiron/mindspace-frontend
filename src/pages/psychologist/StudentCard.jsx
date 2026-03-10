import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler
} from 'chart.js';
import { api } from '../../api/client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const RISK = { low: { label: 'Низкий', cls: 'badge-green' }, moderate: { label: 'Умеренный', cls: 'badge-orange' }, high: { label: 'Высокий', cls: 'badge-red' } };
const METRICS = [
  { key: 'mood', label: 'Настроение', color: '#6366f1' },
  { key: 'stress', label: 'Стресс', color: '#ef4444' },
  { key: 'sleep', label: 'Сон', color: '#3b82f6' },
  { key: 'energy', label: 'Энергия', color: '#f59e0b' },
];

export default function StudentCard() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get(`/psychologist/students/${id}`).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-icon">❌</div><div className="empty-state-title">Студент не найден</div></div>;

  const { student, checkIns, appointments, surveys } = data;
  const labels = checkIns.map(c => new Date(c.date).toLocaleDateString('ru', { month: 'short', day: 'numeric' }));

  const chartData = {
    labels,
    datasets: METRICS.map(m => ({
      label: m.label,
      data: checkIns.map(c => c[m.key]),
      borderColor: m.color,
      backgroundColor: m.color + '15',
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      borderWidth: 2,
    })),
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', boxWidth: 12, font: { size: 12 } } }, tooltip: { backgroundColor: '#1a2035', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 10 } } },
      y: { min: 1, max: 5, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', stepSize: 1, font: { size: 10 } } },
    },
  };

  const latestSurvey = surveys[0];
  const completedAppts = appointments.filter(a => a.status === 'completed');

  return (
    <div className="fade-in">
      <div className="page-header flex items-center gap-16">
        <Link to="/psychologist/schedule" className="btn btn-secondary btn-sm">← Назад</Link>
        <div>
          <div className="page-title">📁 Карточка студента #{student.id}</div>
          <div className="page-subtitle">
            {student.faculty || 'Факультет не указан'}
            {student.course && ` · ${student.course} курс`}
            {student.gender && ` · ${student.gender === 'male' ? 'М' : 'Ж'}`}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[['overview', '📊 Обзор'], ['history', '📋 История'], ['surveys', '🧠 Скрининг']].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
              color: activeTab === tab ? 'var(--accent-light)' : 'var(--text-muted)',
              transition: 'all 0.15s', marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>📅</div>
              <div className="stat-label">Сессий всего</div>
              <div className="stat-value">{appointments.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
              <div className="stat-label">Завершено</div>
              <div className="stat-value">{completedAppts.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>😰</div>
              <div className="stat-label">Риск (скрининг)</div>
              <div className="stat-value" style={{ fontSize: 18 }}>
                {latestSurvey ? (
                  <span className={`badge ${RISK[latestSurvey.risk_level]?.cls || 'badge-gray'}`}>
                    {RISK[latestSurvey.risk_level]?.label || '—'}
                  </span>
                ) : '—'}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">📉 Динамика за 30 дней</div>
            <div className="chart-container" style={{ height: 240 }}>
              {checkIns.length > 0
                ? <Line data={chartData} options={chartOptions} />
                : <div className="empty-state"><div className="empty-state-desc">Нет данных чек-инов</div></div>
              }
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appointments.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-desc">Нет прошлых сессий</div></div>
            : appointments.map(a => (
              <div key={a.id} className="card card-sm">
                <div className="flex items-center justify-between mb-16">
                  <div style={{ fontWeight: 600 }}>
                    📅 {new Date(a.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <span className={`badge ${a.status === 'completed' ? 'badge-green' : 'badge-purple'}`}>
                    {a.status === 'completed' ? 'Проведено' : 'Запланировано'}
                  </span>
                </div>
                {a.reason && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>💬 {a.reason}</div>}
                {a.session_notes && (
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 12, fontSize: 13 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Состояние: </span>
                      <span style={{ color: 'var(--red-light)' }}>{a.condition_before}/10</span>
                      <span style={{ color: 'var(--text-muted)' }}> → </span>
                      <span style={{ color: 'var(--green-light)' }}>{a.condition_after}/10</span>
                    </div>
                    {a.tags && <div style={{ color: 'var(--text-muted)' }}>🏷️ {a.tags}</div>}
                    {a.session_notes && <div style={{ marginTop: 8, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.session_notes}</div>}
                    {a.recommend_followup && <div style={{ marginTop: 8, color: 'var(--green-light)' }}>✅ Рекомендована повторная встреча</div>}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'surveys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {surveys.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-desc">Скрининги не проходил</div></div>
            : surveys.map((s, i) => (
              <div key={i} className="card card-sm flex items-center justify-between">
                <div>
                  <div style={{ fontWeight: 600 }}>Скрининг {new Date(s.created_at).toLocaleDateString('ru')}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Балл: {s.score}/25</div>
                </div>
                <span className={`badge ${RISK[s.risk_level]?.cls || 'badge-gray'}`}>
                  {RISK[s.risk_level]?.label || s.risk_level}
                </span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
