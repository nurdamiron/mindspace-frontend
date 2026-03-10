import { useState, useEffect } from 'react';
import { api } from '../../api/client';

const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Psychologists() {
  const [psychologists, setPsychologists] = useState([]);
  const [selected, setSelected] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [format, setFormat] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    api.get('/student/psychologists').then(setPsychologists).finally(() => setLoading(false));
  }, []);

  async function selectPsychologist(psych) {
    setSelected(psych);
    setSelectedSlot(null);
    setSlots([]);
    const data = await api.get(`/student/psychologists/${psych.id}/slots`);
    setSlots(data);
  }

  async function book() {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      await api.post('/student/appointments', {
        psychologist_id: selected.id,
        slot_id: selectedSlot.id,
        reason,
        format,
      });
      setSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setBooking(false);
    }
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
        <div style={{ fontSize: 72 }}>🎉</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green-light)' }}>Запись создана!</div>
        <div className="text-muted">Вы записались к {selected?.name}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/student/appointments" className="btn btn-primary">📅 Мои записи</a>
          <a href="/student/dashboard" className="btn btn-secondary">На главную</a>
        </div>
      </div>
    );
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    const d = slot.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});

  const filteredDates = filterDate
    ? Object.keys(groupedSlots).filter(d => d === filterDate)
    : Object.keys(groupedSlots).slice(0, 5);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">👨‍⚕️ Выбор психолога</div>
        <div className="page-subtitle">Выбери специалиста и удобное время</div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: selected ? '1fr 1.4fr' : '1fr' }}>
        {/* Psychologist list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="section-title">Специалисты</div>
          {psychologists.map((p, i) => (
            <div
              key={p.id}
              className={`psych-card${selected?.id === p.id ? ' selected' : ''}`}
              onClick={() => selectPsychologist(p)}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="psych-avatar" style={{ background: COLORS[i % COLORS.length] + '30', color: COLORS[i % COLORS.length] }}>
                  {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="psych-name">{p.name}</div>
                  <div className="psych-spec">{p.specialization}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {p.experience_years && <span className="badge badge-purple">🏆 {p.experience_years} лет опыта</span>}
                    {p.languages && p.languages.split(',').map(l => (
                      <span key={l} className="badge badge-gray">🌐 {l.trim()}</span>
                    ))}
                  </div>
                </div>
                <div style={{ color: selected?.id === p.id ? 'var(--accent)' : 'var(--text-muted)', fontSize: 20 }}>
                  {selected?.id === p.id ? '✓' : '›'}
                </div>
              </div>
              {p.bio && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{p.bio}</p>}
            </div>
          ))}
        </div>

        {/* Booking panel */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="section-title">📅 Свободные слоты — {selected.name}</div>

              {Object.keys(groupedSlots).length > 0 && (
                <div className="form-group mb-16">
                  <label className="form-label">Фильтр по дате</label>
                  <select className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
                    <option value="">Все даты (ближайшие 5)</option>
                    {Object.keys(groupedSlots).map(d => (
                      <option key={d} value={d}>{new Date(d).toLocaleDateString('ru', { weekday: 'long', month: 'long', day: 'numeric' })}</option>
                    ))}
                  </select>
                </div>
              )}

              {filteredDates.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <div className="empty-state-desc">Нет доступных слотов</div>
                </div>
              ) : filteredDates.map(date => (
                <div key={date} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
                    📆 {new Date(date).toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="slots-grid">
                    {groupedSlots[date].map(slot => (
                      <button
                        key={slot.id}
                        className={`slot-btn${selectedSlot?.id === slot.id ? ' selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedSlot && (
              <div className="card fade-in">
                <div className="section-title">✏️ Детали записи</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Формат встречи</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {['offline', 'online'].map(f => (
                        <button
                          key={f}
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            background: format === f ? 'rgba(99,102,241,0.12)' : undefined,
                            border: format === f ? '1px solid var(--accent)' : undefined,
                            color: format === f ? 'var(--accent-light)' : undefined,
                          }}
                          onClick={() => setFormat(f)}
                        >
                          {f === 'offline' ? '🏢 Очно' : '💻 Онлайн'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Причина обращения (необязательно)</label>
                    <textarea
                      className="form-input"
                      placeholder="Опишите вкратце, с чем хотите разобраться..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 16, fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="text-muted">Психолог:</span>
                      <span className="font-bold">{selected.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="text-muted">Дата:</span>
                      <span className="font-bold">{new Date(selectedSlot.date).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Время:</span>
                      <span className="font-bold">{selectedSlot.start_time.slice(0, 5)}–{selectedSlot.end_time.slice(0, 5)}</span>
                    </div>
                  </div>

                  <button className="btn btn-success btn-lg" onClick={book} disabled={booking}>
                    {booking ? '⏳ Записываемся...' : '✅ Подтвердить запись'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
