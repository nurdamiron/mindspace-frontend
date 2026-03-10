import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const STATUS_BADGE = {
  scheduled: { label: 'Запланировано', cls: 'badge-purple' },
  completed: { label: 'Проведено', cls: 'badge-green' },
  cancelled: { label: 'Отменено', cls: 'badge-gray' },
};

export default function Schedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [noteModal, setNoteModal] = useState(null);
  const [noteForm, setNoteForm] = useState({ condition_before: 5, condition_after: 7, recommend_followup: false, tags: '', notes: '' });

  useEffect(() => {
    setLoading(true);
    api.get(`/psychologist/schedule?period=${period}`)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [period]);

  async function completeSession(id) {
    try {
      await api.patch(`/psychologist/appointments/${id}/complete`);
      setSessions(s => s.map(ses => ses.appointment_id === id ? { ...ses, status: 'completed' } : ses));
    } catch (err) { alert(err.message); }
  }

  async function saveNote() {
    try {
      await api.post(`/psychologist/sessions/${noteModal.appointment_id}/notes`, noteForm);
      setNoteModal(null);
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <div className="page-title">📋 Моё расписание</div>
          <div className="page-subtitle">Управление консультациями</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['today', 'Сегодня'], ['week', 'Неделя'], ['all', 'Все']].map(([val, label]) => (
            <button
              key={val}
              className="btn btn-sm"
              style={{
                background: period === val ? 'var(--accent)' : 'var(--bg-glass)',
                border: '1px solid ' + (period === val ? 'var(--accent)' : 'var(--border)'),
                color: period === val ? 'white' : 'var(--text-secondary)',
              }}
              onClick={() => setPeriod(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div> :
        sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">Нет записей</div>
            <div className="empty-state-desc">На выбранный период консультаций нет</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sessions.map(s => {
              const badge = STATUS_BADGE[s.status] || STATUS_BADGE.scheduled;
              const d = new Date(s.date);
              return (
                <div key={s.appointment_id} className="schedule-card">
                  <div className="schedule-time">
                    <span>{s.start_time?.slice(0, 5)}</span>
                    <span className="schedule-time-sep">│</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.end_time?.slice(0, 5)}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700 }}>
                        Студент #{s.student_id} &nbsp;·&nbsp; {s.faculty || 'Факультет не указан'}
                      </div>
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      📅 {d.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })} &nbsp;·&nbsp;
                      {s.format === 'online' ? '💻 Онлайн' : '🏢 Очно'}
                      {s.course && ` · ${s.course} курс`}
                    </div>
                    {s.reason && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>💬 {s.reason}</div>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                    <Link to={`/psychologist/students/${s.student_id}`} className="btn btn-secondary btn-sm">
                      📁 Карточка
                    </Link>
                    {s.status === 'scheduled' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => completeSession(s.appointment_id)}>
                          ✅ Завершить
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setNoteModal(s)}>
                          📝 Заметки
                        </button>
                      </>
                    )}
                    {s.status === 'completed' && !s.note_id && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setNoteModal(s)}>
                        📝 Добавить заметку
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Note modal */}
      {noteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="section-title">📝 Заметка по сессии</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="scale-group">
                <div className="scale-header"><span className="scale-label">Состояние до (1–10)</span><span className="scale-value">{noteForm.condition_before}</span></div>
                <input type="range" min={1} max={10} value={noteForm.condition_before} onChange={e => setNoteForm(f => ({...f, condition_before: +e.target.value}))} className="scale-slider" />
              </div>
              <div className="scale-group">
                <div className="scale-header"><span className="scale-label">Состояние после (1–10)</span><span className="scale-value">{noteForm.condition_after}</span></div>
                <input type="range" min={1} max={10} value={noteForm.condition_after} onChange={e => setNoteForm(f => ({...f, condition_after: +e.target.value}))} className="scale-slider" />
              </div>

              <div className="form-group">
                <label className="form-label">Теги (через запятую)</label>
                <input className="form-input" placeholder="стресс, выгорание, экзамены" value={noteForm.tags} onChange={e => setNoteForm(f => ({...f, tags: e.target.value}))} />
              </div>

              <div className="form-group">
                <label className="form-label">Заметки</label>
                <textarea className="form-input" placeholder="Наблюдения, рекомендации..." value={noteForm.notes} onChange={e => setNoteForm(f => ({...f, notes: e.target.value}))} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={noteForm.recommend_followup} onChange={e => setNoteForm(f => ({...f, recommend_followup: e.target.checked}))} />
                <span style={{ fontSize: 14 }}>Рекомендовать повторную встречу</span>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setNoteModal(null)}>Отмена</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveNote}>Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
