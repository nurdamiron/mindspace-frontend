import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const QUICK_MESSAGES = [
  'Как справиться со стрессом перед экзаменами?',
  'Я плохо сплю уже несколько дней',
  'Чувствую себя перегруженным',
  'Как улучшить концентрацию?',
];

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
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await api.post('/student/ai-chat', { content: text });
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Извините, произошла ошибка. Попробуйте ещё раз.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in flex flex-col h-[calc(100vh-80px)] min-h-[480px] max-h-[800px]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">ИИ-помощник</h1>
        <p className="text-sm text-zinc-500 mt-1">Анонимная поддержка 24/7. Информация не передаётся третьим лицам.</p>
      </div>

      {/* Chat card */}
      <div className="flex-1 flex flex-col rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        {/* Chat header */}
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">MindSpace AI</span>
          <Badge variant="secondary" className="ml-auto text-xs">Онлайн</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-5">
              <div className="max-w-[85%] bg-zinc-800 border border-zinc-700 rounded-lg rounded-tl-sm px-4 py-3 text-sm text-zinc-200 leading-relaxed">
                Здравствуйте. Я MindSpace AI — анонимный помощник. Расскажите, как вы себя чувствуете, или задайте вопрос.
              </div>

              <div>
                <p className="text-xs text-zinc-600 mb-2.5">Частые темы:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_MESSAGES.map((msg) => (
                    <button
                      key={msg}
                      onClick={() => setInput(msg)}
                      className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 text-xs text-zinc-400 hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[72%] text-sm leading-relaxed rounded-lg px-4 py-3 ${
                  m.role === 'user'
                    ? 'bg-zinc-100 text-zinc-900 rounded-br-sm'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-sm'
                }`}
              >
                {m.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 200, 400].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                    style={{ animation: `pulse 1s ${delay}ms infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-zinc-800 p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              id="chat-input"
              placeholder="Напишите что-нибудь..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button
              id="chat-send"
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
