import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { api } from '../../api/client';

const METRICS = [
  { key: 'mood', label: 'Настроение', emojis: ['😔', '😕', '😐', '🙂', '😄'] },
  { key: 'stress', label: 'Уровень стресса (5 = очень высокий)', emojis: ['😌', '🙂', '😐', '😤', '😰'] },
  { key: 'sleep', label: 'Качество сна', emojis: ['😵', '😪', '😴', '😌', '🌟'] },
  { key: 'energy', label: 'Уровень энергии', emojis: ['🪫', '😩', '😐', '⚡', '🚀'] },
  { key: 'productivity', label: 'Продуктивность', emojis: ['📵', '📉', '📊', '📈', '🔥'] },
];

const checkInSchema = z.object({
  mood: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  sleep: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  productivity: z.number().min(1).max(5),
  notes: z.string().optional(),
});

export default function CheckIn() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      mood: 3, stress: 3, sleep: 3, energy: 3, productivity: 3, notes: ''
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchValues = watch();

  async function onSubmit(data) {
    try {
      await api.post('/student/check-ins', data);
      setSuccess(true);
      toast.success('Чек-ин сохранён!');
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
        <div style={{ fontSize: 72 }}>✅</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green-light)' }}>Чек-ин сохранён!</div>
        <div className="text-muted">Переходим на дашборд...</div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div className="page-title">✅ Ежедневный чек-ин</div>
        <div className="page-subtitle">Оцени своё состояние по каждому показателю от 1 до 5</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {METRICS.map(m => (
            <div key={m.key} className="scale-group">
              <div className="scale-header">
                <span className="scale-label">{m.label}</span>
                <span className="scale-value">
                  {m.emojis[watchValues[m.key] - 1]} {watchValues[m.key]}
                </span>
              </div>
              <input
                type="range"
                min={1} max={5} step={1}
                {...register(m.key, { valueAsNumber: true })}
                className="scale-slider"
              />
              <div className="scale-emoji-row">
                {m.emojis.map((emoji, i) => (
                  <span key={i} style={{ opacity: watchValues[m.key] === i + 1 ? 1 : 0.35, fontSize: 20, transition: 'opacity 0.15s' }}>
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Комментарий (необязательно)</label>
            <textarea
              className="form-input"
              placeholder="Что произошло сегодня? Как ты себя чувствуешь?.."
              {...register('notes')}
            />
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? '⏳ Сохраняем...' : '✅ Сохранить чек-ин'}
          </button>
        </div>
      </form>
    </div>
  );
}
