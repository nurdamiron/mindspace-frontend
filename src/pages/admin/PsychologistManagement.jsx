import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { api } from '../../api/client';

const psychSchema = z.object({
  name: z.string().min(2, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  specialization: z.string().optional(),
  languages: z.string().optional(),
  experience_years: z.coerce.number().min(0, 'Некорректный опыт').optional(),
  password: z.string().min(6, 'Пароль от 6 символов'),
  bio: z.string().optional(),
});

export default function PsychologistManagement() {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(psychSchema),
    defaultValues: {
      password: 'password123',
    }
  });

  useEffect(() => {
    api.get('/admin/psychologists').then(setPsychologists).finally(() => setLoading(false));
  }, []);

  async function addPsychologist(data) {
    try {
      const added = await api.post('/admin/psychologists', data);
      setPsychologists(p => [...p, added]);
      reset();
      setShowForm(false);
      toast.success('Психолог добавлен успешно!');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deletePsych(id) {
    if (!window.confirm('Удалить психолога?')) return;
    try {
      await api.delete(`/admin/psychologists/${id}`);
      setPsychologists(p => p.filter(x => x.id !== id));
      toast.success('Психолог удален');
    } catch (err) {
      toast.error(err.message);
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
          <form onSubmit={handleSubmit(addPsychologist)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Имя *</label>
              <input className="form-input" {...register('name')} placeholder="Д-р Имя Фамилия" />
              {errors.name && <p className="text-sm" style={{color: 'var(--red)', marginTop: 4}}>{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" {...register('email')} placeholder="psych@university.kz" />
              {errors.email && <p className="text-sm" style={{color: 'var(--red)', marginTop: 4}}>{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Специализация</label>
              <input className="form-input" {...register('specialization')} placeholder="Стресс, тревожность..." />
            </div>
            <div className="form-group">
              <label className="form-label">Языки</label>
              <input className="form-input" {...register('languages')} placeholder="Казахский, Русский" />
            </div>
            <div className="form-group">
              <label className="form-label">Опыт (лет)</label>
              <input className="form-input" type="number" {...register('experience_years')} placeholder="5" />
              {errors.experience_years && <p className="text-sm" style={{color: 'var(--red)', marginTop: 4}}>{errors.experience_years.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Пароль (стандартный)</label>
              <input className="form-input" {...register('password')} />
              {errors.password && <p className="text-sm" style={{color: 'var(--red)', marginTop: 4}}>{errors.password.message}</p>}
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Биография</label>
              <textarea className="form-input" {...register('bio')} placeholder="Краткое описание..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? '⏳ Сохраняем...' : '✅ Добавить психолога'}
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
