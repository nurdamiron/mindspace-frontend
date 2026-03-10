import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function PsychologistManagement() {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: 'password123', name: '', specialization: '', languages: '', experience_years: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/psychologists').then(setPsychologists).finally(() => setLoading(false));
  }, []);

  async function addPsychologist(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const added = await api.post('/admin/psychologists', form);
      setPsychologists(p => [...p, added]);
      setForm({ email: '', password: 'password123', name: '', specialization: '', languages: '', experience_years: '', bio: '' });
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deletePsych(id) {
    if (!confirm('Удалить психолога?')) return;
    try {
      await api.delete(`/admin/psychologists/${id}`);
      setPsychologists(p => p.filter(x => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <div className="page-title">👨‍⚕️ Управление психологами</div>
          <div className="page-subtitle">{psychologists.length} специалистов в системе</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Отмена' : '+ Добавить'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-24 fade-in">
          <div className="section-title">➕ Новый психолог</div>
          <form onSubmit={addPsychologist} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Имя *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Д-р Имя Фамилия" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="psych@university.kz" />
            </div>
            <div className="form-group">
              <label className="form-label">Специализация</label>
              <input className="form-input" value={form.specialization} onChange={e => setForm(f => ({...f, specialization: e.target.value}))} placeholder="Стресс, тревожность..." />
            </div>
            <div className="form-group">
              <label className="form-label">Языки</label>
              <input className="form-input" value={form.languages} onChange={e => setForm(f => ({...f, languages: e.target.value}))} placeholder="Казахский, Русский" />
            </div>
            <div className="form-group">
              <label className="form-label">Опыт (лет)</label>
              <input className="form-input" type="number" value={form.experience_years} onChange={e => setForm(f => ({...f, experience_years: e.target.value}))} placeholder="5" />
            </div>
            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input className="form-input" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Биография</label>
              <textarea className="form-input" value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Краткое описание..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? '⏳ Сохраняем...' : '✅ Добавить психолога'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {psychologists.map((p, i) => (
          <div key={p.id} className="card card-sm flex items-center gap-16">
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `rgba(${i % 2 === 0 ? '99,102,241' : '16,185,129'},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0, color: i % 2 === 0 ? 'var(--accent-light)' : 'var(--green-light)' }}>
              {p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{p.email} · {p.specialization}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {p.experience_years && <span className="badge badge-purple">🏆 {p.experience_years} лет</span>}
                {p.completed_sessions > 0 && <span className="badge badge-green">✅ {p.completed_sessions} сессий</span>}
                {p.total_students > 0 && <span className="badge badge-gray">👤 {p.total_students} студентов</span>}
              </div>
            </div>

            <button className="btn btn-danger btn-sm" onClick={() => deletePsych(p.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
}
