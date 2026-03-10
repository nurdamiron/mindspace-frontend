import { useState, useEffect } from 'react';
import { api } from '../../api/client';

const STATUS_BADGE = {
  scheduled: { label: 'Запланировано', cls: 'badge-purple' },
  completed: { label: 'Проведено', cls: 'badge-green' },
  cancelled: { label: 'Отменено', cls: 'badge-gray' },
  no_show: { label: 'Не явился', cls: 'badge-red' },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackScore, setFeedbackScore] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    api.get('/student/appointments').then(setAppointments).finally(() => setLoading(false));
  }, []);

  async function submitFeedback() {
    try {
      await api.post(`/student/appointments/${feedbackModal.id}/feedback`, {
        feedback_score: feedbackScore,
        feedback_text: feedbackText,
      });
      setAppointments(a => a.map(ap => ap.id === feedbackModal.id
        ? { ...ap, feedback_score: feedbackScore }
        : ap
      ));
      setFeedbackModal(null);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">📅 Мои записи</div>
        <div className="page-subtitle">История всех консультаций</div>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">Записей нет</div>
          <div className="empty-state-desc">Запишитесь к психологу, чтобы получить поддержку</div>
          <a href="/student/psychologists" className="btn btn-primary mt-16">👨‍⚕️ Выбрать психолога</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {appointments.map(a => {
            const badge = STATUS_BADGE[a.status] || STATUS_BADGE.scheduled;
            const date = new Date(a.date);
            return (
              <div key={a.id} className="appointment-card">
                <div style={{ width: 60, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-light)' }}>{date.getDate()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {date.toLocaleDateString('ru', { month: 'short' })}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.psychologist_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.specialization}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    🕐 {a.start_time?.slice(0, 5)}–{a.end_time?.slice(0, 5)} &nbsp;·&nbsp;
                    {a.format === 'online' ? '💻 Онлайн' : '🏢 Очно'}
                  </div>
                  {a.reason && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>💬 {a.reason}</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  {a.status === 'completed' && !a.feedback_score && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setFeedbackModal(a)}>
                      ⭐ Оценить
                    </button>
                  )}
                  {a.feedback_score && (
                    <div style={{ fontSize: 12, color: 'var(--orange-light)' }}>
                      {'⭐'.repeat(a.feedback_score)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div className="card" style={{ maxWidth: 400, width: '100%' }}>
            <div className="section-title">⭐ Оценить консультацию</div>
            <p className="text-muted text-sm mb-16">Как прошла сессия с {feedbackModal.psychologist_name}?</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, fontSize: 32, marginBottom: 20 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setFeedbackScore(s)} style={{ fontSize: 32, opacity: s <= feedbackScore ? 1 : 0.3, transition: 'opacity 0.15s' }}>
                  ⭐
                </button>
              ))}
            </div>

            <div className="form-group mb-16">
              <label className="form-label">Комментарий (необязательно)</label>
              <textarea className="form-input" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Поделитесь впечатлениями..." />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setFeedbackModal(null)}>Отмена</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitFeedback}>Отправить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
