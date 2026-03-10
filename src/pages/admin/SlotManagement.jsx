import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function SlotManagement() {
  const [slots, setSlots] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ psychologist_id: '', date: '', start_time: '09:00', end_time: '10:00' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/admin/slots'),
      api.get('/admin/psychologists'),
    ]).then(([s, p]) => {
      setSlots(s);
      setPsychologists(p);
      if (p.length > 0) setForm(f => ({ ...f, psychologist_id: p[0].id }));
    }).finally(() => setLoading(false));
  }, []);

  async function createSlot(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/admin/slots', {
        psychologist_id: form.psychologist_id,
        date: form.date,
        slots: [{ start_time: form.start_time, end_time: form.end_time }],
      });
      setSlots(s => [...s, ...res.map(r => ({
        ...r,
        psychologist_name: psychologists.find(p => p.id === +form.psychologist_id)?.name
      }))]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Generate standard time blocks
  function generateDaySlots() {
    const times = [
      ['09:00','10:00'], ['10:00','11:00'], ['11:00','12:00'],
      ['13:00','14:00'], ['14:00','15:00'], ['15:00','16:00'], ['16:00','17:00'],
    ];
    return times.map(([start, end]) => ({ start_time: start, end_time: end }));
  }

  async function generateFullDay() {
    if (!form.psychologist_id || !form.date) {
      alert('Выберите психолога и дату');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/admin/slots', {
        psychologist_id: form.psychologist_id,
        date: form.date,
        slots: generateDaySlots(),
      });
      setSlots(s => [...s, ...res.map(r => ({
        ...r,
        psychologist_name: psychologists.find(p => p.id === +form.psychologist_id)?.name
      }))]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Group slots by psychologist and date
  const grouped = slots.reduce((acc, slot) => {
    const key = `${slot.psychologist_name}__${slot.date}`;
    if (!acc[key]) acc[key] = { name: slot.psychologist_name, date: slot.date, slots: [] };
    acc[key].slots.push(slot);
    return acc;
  }, {});

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">🗓️ Управление расписанием</div>
        <div className="page-subtitle">Создание слотов для консультаций психологов</div>
      </div>

      <div className="card mb-24">
        <div className="section-title">➕ Создать слот</div>
        <form onSubmit={createSlot} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">Психолог</label>
            <select className="form-input" value={form.psychologist_id} onChange={e => setForm(f => ({...f, psychologist_id: e.target.value}))}>
              {psychologists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Дата</label>
            <input className="form-input" type="date" required value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Начало</label>
            <input className="form-input" type="time" value={form.start_time} onChange={e => setForm(f => ({...f, start_time: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Конец</label>
            <input className="form-input" type="time" value={form.end_time} onChange={e => setForm(f => ({...f, end_time: e.target.value}))} />
          </div>
          <div style={{ display: 'flex', gap: 10, gridColumn: '1 / -1' }}>
            <button className="btn btn-secondary" type="button" onClick={generateFullDay} disabled={saving}>
              📅 Сгенерировать весь день (9 слотов)
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? '⏳...' : '+ Добавить слот'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.values(grouped).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">Нет слотов</div>
            <div className="empty-state-desc">Создайте расписание для психологов</div>
          </div>
        ) : Object.values(grouped).map(g => (
          <div key={`${g.name}__${g.date}`} className="card card-sm">
            <div className="flex items-center justify-between mb-16">
              <div>
                <div style={{ fontWeight: 700 }}>{g.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  📅 {new Date(g.date).toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-green">{g.slots.filter(s => s.is_available).length} свободных</span>
                <span className="badge badge-gray">{g.slots.filter(s => !s.is_available).length} занятых</span>
              </div>
            </div>
            <div className="slots-grid">
              {g.slots.map(slot => (
                <div
                  key={slot.id}
                  className="slot-btn"
                  style={{
                    cursor: 'default',
                    background: slot.is_available ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${slot.is_available ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: slot.is_available ? 'var(--green-light)' : 'var(--red-light)',
                  }}
                >
                  {slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
