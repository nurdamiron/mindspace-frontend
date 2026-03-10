import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../api/client';

const QUESTIONS = [
  { id: 'q1', text: 'Как часто за последние 2 недели тебя беспокоило чувство тревоги или напряжения?', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Постоянно'] },
  { id: 'q2', text: 'Насколько тебе сложно расслабиться после напряжённого дня?', options: ['Легко', 'Чаще легко', 'По-разному', 'Чаще сложно', 'Очень сложно'] },
  { id: 'q3', text: 'Как часто ты чувствуешь себя уставшим/-ей даже после достаточного сна?', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Постоянно'] },
  { id: 'q4', text: 'Насколько тебе сложно сосредоточиться на учёбе?', options: ['Легко', 'Чаще легко', 'По-разному', 'Чаще сложно', 'Очень сложно'] },
  { id: 'q5', text: 'Как часто у тебя возникают мысли о том, что ты не справляешься?', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Постоянно'] },
];

const RISK_TEXT = {
  low: { label: '✅ Низкий риск', color: 'var(--green-light)', desc: 'Ваше психологическое состояние в норме. Продолжайте следить за собой!' },
  moderate: { label: '⚠️ Умеренный риск', color: 'var(--orange-light)', desc: 'Есть признаки повышенного стресса. Рекомендуем поговорить с психологом.' },
  high: { label: '🔴 Высокий риск', color: 'var(--red-light)', desc: 'Обнаружены признаки значительного стресса. Пожалуйста, запишитесь к психологу.' },
};

export default function Screening() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const allAnswered = QUESTIONS.every(q => answers[q.id] !== undefined);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!allAnswered) {
      toast.error('Пожалуйста, ответьте на все вопросы');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/student/surveys', { type: 'screening', answers });
      setResult(res);
      toast.success('Результаты успешно сохранены!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const risk = RISK_TEXT[result.risk_level] || RISK_TEXT.low;
    return (
      <div className="fade-in" style={{ maxWidth: 600 }}>
        <div className="page-header">
          <div className="page-title">🧠 Результат скрининга</div>
        </div>
        <div className="card" style={{ textAlign: 'center', gap: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 64 }}>{result.risk_level === 'low' ? '😌' : result.risk_level === 'moderate' ? '😟' : '😰'}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: risk.color }}>{risk.label}</div>
          <div className="text-muted" style={{ fontSize: 15, lineHeight: 1.6 }}>{risk.desc}</div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px 32px', display: 'inline-block' }}>
            <div className="stat-label">Итоговый балл</div>
            <div className="stat-value" style={{ color: risk.color }}>{result.score} / 25</div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/student/chat" className="btn btn-secondary">💬 Поговорить с ИИ</a>
            <a href="/student/psychologists" className="btn btn-primary">👨‍⚕️ Записаться к психологу</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div className="page-title">🧠 Психологический скрининг</div>
        <div className="page-subtitle">5 вопросов • Занимает 2 минуты • Анонимно</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex-col gap-16">
          {QUESTIONS.map((q, qi) => (
            <div key={q.id} className="card">
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Вопрос {qi + 1} из {QUESTIONS.length}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>{q.text}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAnswers(a => ({ ...a, [q.id]: i + 1 }))}
                    className="btn btn-secondary"
                    style={{
                      justifyContent: 'flex-start',
                      background: answers[q.id] === i + 1 ? 'rgba(99,102,241,0.12)' : undefined,
                      border: answers[q.id] === i + 1 ? '1px solid var(--accent)' : undefined,
                      color: answers[q.id] === i + 1 ? 'var(--accent-light)' : undefined,
                    }}
                  >
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: answers[q.id] === i + 1 ? 'var(--accent)' : 'var(--bg-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={!allAnswered || loading}>
            {loading ? '⏳ Анализируем...' : '📊 Получить результат'}
          </button>
          {!allAnswered && <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 8 }}>Ответь на все вопросы</p>}
        </div>
      </form>
    </div>
  );
}
