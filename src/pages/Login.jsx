import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес').min(1, 'Email обязателен'),
  password: z.string().min(6, 'Минимальная длина пароля - 6 символов'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data) {
    setError('');
    try {
      const user = await login(data.email, data.password);
      toast.success('Успешный вход!');
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'psychologist') navigate('/psychologist/schedule');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  }

  function fillDemo(role) {
    const demos = {
      student: ['student1@university.kz', 'password123'],
      psychologist: ['psych1@university.kz', 'password123'],
      admin: ['admin@university.kz', 'password123'],
    };
    setValue('email', demos[role][0]);
    setValue('password', demos[role][1]);
    setError('');
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-logo">
          <div className="login-logo-icon">🌿</div>
          <div className="login-logo-text">
            <h1>MindSpace</h1>
            <p>Психологическая поддержка студентов</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="login-error">⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="your@university.kz"
              {...register('email')}
            />
            {errors.email && <p className="text-sm" style={{color: 'var(--red)', marginTop: 4}}>{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <p className="text-sm" style={{color: 'var(--red)', marginTop: 4}}>{errors.password.message}</p>}
          </div>

          <button id="login-submit" className="btn btn-primary w-full btn-lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? '⏳ Вход...' : '→ Войти'}
          </button>
        </form>

        <div className="divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p className="text-xs text-muted" style={{ textAlign: 'center', marginBottom: 4 }}>Демо-аккаунты</p>
          {[
            { role: 'student', label: '🎓 Студент', color: 'var(--accent)' },
            { role: 'psychologist', label: '🩺 Психолог', color: 'var(--green)' },
            { role: 'admin', label: '🏛️ Администратор', color: 'var(--orange)' },
          ].map(d => (
            <button
              key={d.role}
              id={`demo-${d.role}`}
              className="btn btn-secondary"
              type="button"
              onClick={() => fillDemo(d.role)}
              style={{ justifyContent: 'center', gap: 8 }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
