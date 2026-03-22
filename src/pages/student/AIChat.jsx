// useState, useEffect, useRef — күй, жанама әсерлер және DOM сілтемесі үшін
import { useState, useEffect, useRef } from 'react';
// ReactMarkdown — AI хабарламаларын Markdown форматында көрсету үшін
import ReactMarkdown from 'react-markdown';
// Send — хабарлама жіберу иконасы
import { Send } from 'lucide-react';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../../api/client';
// shadcn/ui компоненттері — батырма, енгізу өрісі, белгі
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// AIChat — AI чат беті: студент пен AI арасындағы хабарлама алмасу компоненті
export default function AIChat() {
  const { t } = useTranslation();
  // messages — чат хабарламалары тізімі
  const [messages, setMessages] = useState([]);
  // input — хабарлама енгізу өрісінің мәні
  const [input, setInput] = useState('');
  // loading — AI жауабы күту күйі
  const [loading, setLoading] = useState(false);
  // bottomRef — чаттың төменгі жағына автоматты айналдыру үшін ref
  const bottomRef = useRef(null);

  // quickMessages — аудармадан жылдам хабарлама нұсқаларын алады
  const quickMessages = t('student.aiChat.quickMessages', { returnObjects: true });

  // Бет жүктелгенде чат тарихын серверден алады
  useEffect(() => {
    api.get('/student/chat').then(setMessages).catch(() => {});
  }, []);

  // Жаңа хабарлама келгенде төменге автоматты айналдырады
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // sendMessage — хабарлама жіберу функциясы: пайдаланушы хабарын қосып, AI жауабын алады
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
      // Қате кезінде сәлемдесу хабарын қайтарады
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: t('student.aiChat.greeting') },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in flex flex-col h-[calc(100vh-80px)] min-h-[480px] max-h-[800px]">
      {/* Бет тақырыбы мен ескертпе */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('student.aiChat.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('student.aiChat.disclaimer')}</p>
      </div>

      {/* Чат контейнері */}
      <div className="flex-1 flex flex-col rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        {/* Чат жоғарғы жолағы: AI атауы мен белгі */}
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">MindSpace AI</span>
          <Badge variant="secondary" className="ml-auto text-xs">{t('student.aiChat.badge')}</Badge>
        </div>

        {/* Хабарламалар аймағы */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Хабарлама жоқ болса сәлемдесу мен жылдам нұсқаларды көрсетеді */}
          {messages.length === 0 && (
            <div className="space-y-5">
              <div className="max-w-[85%] bg-zinc-800 border border-zinc-700 rounded-lg rounded-tl-sm px-4 py-3 text-sm text-zinc-200 leading-relaxed">
                {t('student.aiChat.greeting')}
              </div>

              {/* Жылдам хабарлама батырмалары */}
              <div>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(quickMessages) ? quickMessages : []).map((msg, idx) => (
                    <button
                      key={idx}
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

          {/* Барлық хабарламаларды рөлге байланысты туралап көрсетеді */}
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
                {/* AI хабарламасын Markdown форматында, пайдаланушыны қарапайым мәтін ретінде */}
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

          {/* AI жауап күту индикаторы */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                <span className="text-xs text-zinc-500">{t('student.aiChat.thinking')}</span>
              </div>
            </div>
          )}

          {/* Автоматты айналдыру нүктесі */}
          <div ref={bottomRef} />
        </div>

        {/* Хабарлама жіберу өрісі */}
        <div className="shrink-0 border-t border-zinc-800 p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              id="chat-input"
              placeholder={t('student.aiChat.placeholder')}
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
