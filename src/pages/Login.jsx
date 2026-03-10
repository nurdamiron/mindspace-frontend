import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'psychologist') navigate('/psychologist/schedule');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    const demos = {
      student: ['student1@university.kz', 'password123'],
      psychologist: ['psych1@university.kz', 'password123'],
      admin: ['admin@university.kz', 'password123'],
    };
    setEmail(demos[role][0]);
    setPassword(demos[role][1]);
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

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="your@university.kz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button id="login-submit" className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
            {loading ? '⏳ Вход...' : '→ Войти'}
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
