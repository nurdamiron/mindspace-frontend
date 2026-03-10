import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/student/chat').then(setMessages).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await api.post('/student/chat', { content: text });
      setMessages(m => [...m, { role: 'assistant', content: res.response }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Извините, произошла ошибка. Попробуйте ещё раз.' }]);
    } finally {
      setLoading(false);
    }
  }

  const quickMessages = [
    'Как справиться со стрессом перед экзаменами?',
    'Я плохо сплю уже несколько дней',
    'Чувствую себя перегруженным/-ой',
    'Как улучшить концентрацию?',
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-title">💬 ИИ-помощник</div>
        <div className="page-subtitle">Анонимная поддержка 24/7. Информация не передаётся третьим лицам.</div>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>MindSpace AI</span>
          <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Онлайн</span>
        </div>

        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="chat-bubble assistant" style={{ maxWidth: '90%' }}>
                👋 Привет! Я MindSpace AI — твой анонимный помощник. Расскажи, как ты себя чувствуешь, или задай вопрос. Я здесь, чтобы помочь!
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Частые темы:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {quickMessages.map(msg => (
                    <button key={msg} className="btn btn-secondary btn-sm" onClick={() => setInput(msg)}>
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>{m.content}</div>
          ))}

          {loading && (
            <div className="chat-bubble assistant" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ animation: 'pulse 1s infinite', animationDelay: '0ms' }}>●</span>
              <span style={{ animation: 'pulse 1s infinite', animationDelay: '200ms' }}>●</span>
              <span style={{ animation: 'pulse 1s infinite', animationDelay: '400ms' }}>●</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }} onSubmit={sendMessage}>
          <input
            id="chat-input"
            className="form-input chat-input"
            placeholder="Напиши что-нибудь..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button id="chat-send" className="btn btn-primary" type="submit" disabled={loading || !input.trim()}>
            Отправить →
          </button>
        </form>
      </div>
    </div>
  );
}
