// Күй, әсер, DOM сілтемесі
import { useState, useEffect, useRef } from 'react';
// ИИ жауабын markdown көрсету
import ReactMarkdown from 'react-markdown';
// Иконалар
import { Send, Plus, Trash2, MessageSquare, ArrowLeft, LifeBuoy } from 'lucide-react';
// Аударма хук
import { useTranslation } from 'react-i18next';
// Психолог каталогіне сілтеме
import { Link } from 'react-router-dom';
// HTTP сұраныстар
import { api } from '../../api/client';
// shadcn/ui компоненттері
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// Шартты CSS класс утилитасы
import { cn } from '@/lib/utils';

// Көп сессиялы ИИ чат беті
export default function AIChat() {
  const { t, i18n } = useTranslation();

  // Барлық чат тарихы
  const [conversations, setConversations] = useState([]);
  // Ашық чат ID-і
  const [activeConvId, setActiveConvId] = useState(null);
  // Ағымдағы чат хабарламалары
  const [messages, setMessages] = useState([]);
  // Енгізу өрісінің мәні
  const [input, setInput] = useState('');
  // ИИ жауабын күту
  const [loading, setLoading] = useState(false);
  // Чат тізімін жүктеу
  const [convLoading, setConvLoading] = useState(true);
  // Жоюды растау диалогы
  const [confirmDelete, setConfirmDelete] = useState(null);
  // Мобайл көрінісі: тізім не чат
  const [mobileView, setMobileView] = useState('list');
  // Дағдарыс сигналы анықталды ма (CTA үшін)
  const [crisisActive, setCrisisActive] = useState(false);
  // Төменге авто-айналдыру маркері
  const bottomRef = useRef(null);

  // Жылдам сұрақтар аудармасы
  const quickMessages = t('student.aiChat.quickMessages', { returnObjects: true });

  // Бет ашылғанда чат тізімін жүктеу
  useEffect(() => {
    api.get('/student/conversations')
      .then(data => {
        setConversations(data);
        // Чат бар болса бірінішісін ашу
        if (data.length > 0) {
          setActiveConvId(data[0].id);
          setMobileView('chat');
        }
      })
      .finally(() => setConvLoading(false));
  }, []);

  // Чат ауысқанда: хабарламаларды жүктеу, дағдарыс белгісін тазалау
  useEffect(() => {
    setCrisisActive(false);
    if (!activeConvId) { setMessages([]); return; }
    api.get(`/student/conversations/${activeConvId}/messages`)
      .then(setMessages)
      .catch(() => {});
  }, [activeConvId]);

  // Жаңа хабарламада төменге айналдыру
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Хабарламаны жіберіп, ИИ жауабын алу
  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    // Хабарламаны бірден көрсету (оптимистік)
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await api.post('/student/ai-chat', {
        content: text,
        conversation_id: activeConvId,
      });
      // ИИ жауабын қосу
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
      // Дағдарыс табылса CTA көрсету
      if (res.crisis_detected) setCrisisActive(true);
      // Тізімді жаңарту (атауы авто орнатылуы мүмкін)
      api.get('/student/conversations').then(data => {
        setConversations(data);
        if (!activeConvId && res.conversation_id) {
          setActiveConvId(res.conversation_id);
        }
      });
    } catch {
      // Қате кезінде сәтсіздік хабары
      setMessages(prev => [...prev, { role: 'assistant', content: t('student.aiChat.greeting') }]);
    } finally {
      setLoading(false);
    }
  }

  // Жаңа бос чат ашу
  async function startNewConversation() {
    setActiveConvId(null);
    setMessages([]);
    setMobileView('chat');
  }

  // Чатты жойып, тізімді жаңарту
  async function deleteConversation(conv) {
    try {
      await api.delete(`/student/conversations/${conv.id}`);
      const updated = conversations.filter(c => c.id !== conv.id);
      setConversations(updated);
      // Белсенді чат жойылса келесісіне ауысу
      if (activeConvId === conv.id) {
        if (updated.length > 0) {
          setActiveConvId(updated[0].id);
        } else {
          setActiveConvId(null);
          setMessages([]);
          setMobileView('list');
        }
      }
    } catch { /* үнсіз өту */ }
    setConfirmDelete(null);
  }

  // Чаттарды уақыт бойынша топтау: бүгін/кеше/апта/ескі
  function groupConversations(convs) {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayStr = new Date(now - 86400000).toDateString();
    const weekAgo = new Date(now - 7 * 86400000);
    return convs.reduce((acc, conv) => {
      const d = new Date(conv.updated_at);
      let g = d >= weekAgo ? (d.toDateString() === todayStr ? 'today' : d.toDateString() === yesterdayStr ? 'yesterday' : 'week') : 'older';
      if (!acc[g]) acc[g] = [];
      acc[g].push(conv);
      return acc;
    }, {});
  }

  // Топтар мен белсенді чат
  const grouped = groupConversations(conversations);
  const activeConv = conversations.find(c => c.id === activeConvId);

  // Топ атауларының аудармасы
  const GROUP_LABELS = {
    today: t('student.aiChat.groups.today'),
    yesterday: t('student.aiChat.groups.yesterday'),
    week: t('student.aiChat.groups.week'),
    older: t('student.aiChat.groups.older'),
  };

  // Сол сайдбар: чат тізімі мен «Жаңа чат»
  const ConversationsList = (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Жаңа чат батырмасы */}
      <div className="p-3 border-b border-zinc-800 shrink-0">
        <button
          onClick={startNewConversation}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('student.aiChat.newChat')}</span>
        </button>
      </div>

      {/* Чат тізімі: жүктелу, бос күй не топтар */}
      <div className="flex-1 overflow-y-auto py-1">
        {convLoading ? (
          // Жүктелу спиннері
          <div className="flex justify-center py-8">
            <div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          // Чат жоқ: бос күй
          <div className="text-xs text-zinc-600 text-center py-10 px-4 leading-relaxed">
            {t('student.aiChat.noConversations')}
          </div>
        ) : (
          // Топ бойынша чаттар
          ['today', 'yesterday', 'week', 'older'].map(g => {
            const items = grouped[g];
            if (!items?.length) return null;
            return (
              <div key={g}>
                {/* Топ атауы */}
                <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  {GROUP_LABELS[g]}
                </div>
                {items.map(conv => (
                  // Чат элементі: басқанда ауысу
                  <div
                    key={conv.id}
                    onClick={() => { setActiveConvId(conv.id); setMobileView('chat'); }}
                    className={cn(
                      'group flex items-center gap-2 mx-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
                      activeConvId === conv.id
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    )}
                  >
                    <MessageSquare className="w-3 h-3 shrink-0 text-zinc-600" />
                    <span className="flex-1 truncate text-xs leading-relaxed">{conv.title}</span>
                    {/* Жою батырмасы: тек hover кезінде */}
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete(conv); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-600 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Оң чат аймағы: хабарламалар мен енгізу формасы
  const ChatArea = (
    <div className="flex flex-col h-full">
      {/* Чат тақырыбы: атауы мен артқа батырмасы */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3 shrink-0">
        <button
          className="lg:hidden p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          onClick={() => setMobileView('list')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
        <span className="text-sm font-medium text-zinc-200 truncate flex-1">
          {activeConv?.title || 'MindSpace AI'}
        </span>
      </div>

      {/* Хабарламалар аймағы */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Чат бос болса: сәлемдесу мен жылдам сұрақтар */}
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="max-w-[85%] bg-zinc-800 border border-zinc-700 rounded-lg rounded-tl-sm px-4 py-3 text-sm text-zinc-200 leading-relaxed">
              {t('student.aiChat.greeting')}
            </div>
            {/* Жылдам сұрақ батырмалары */}
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
        )}

        {/* Хабарламалар: қолданушы оңда, ИИ солда */}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={cn(
              'max-w-[72%] text-sm leading-relaxed rounded-lg px-4 py-3',
              m.role === 'user'
                ? 'bg-zinc-100 text-zinc-900 rounded-br-sm'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-sm'
            )}>
              {/* ИИ жауабын markdown көрсету */}
              {m.role === 'assistant' ? (
                <div className="prose-chat">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : m.content}
            </div>
          </div>
        ))}

        {/* Күту: үш нүкте анимациясы */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        {/* Авто-айналдыру маркері */}
        <div ref={bottomRef} />
      </div>

      {/* Дағдарыс CTA: суицид/зиян сигналында психолог каталогіне бағыттайды */}
      {crisisActive && (
        <div className="shrink-0 mx-4 mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 fade-in">
          <div className="flex items-start gap-2.5">
            <LifeBuoy className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-rose-200 leading-relaxed">
                {t('student.aiChat.crisis.title')}
              </p>
              <p className="text-[11px] text-rose-300/80 mt-1 leading-relaxed">
                {t('student.aiChat.crisis.subtitle')}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <Button asChild size="sm" className="h-7 px-3 text-xs bg-rose-500 hover:bg-rose-400 text-white">
                  <Link to="/student/psychologists">{t('student.aiChat.crisis.cta')}</Link>
                </Button>
                <button
                  type="button"
                  onClick={() => setCrisisActive(false)}
                  className="text-[11px] text-rose-300/60 hover:text-rose-200 transition-colors"
                >
                  {t('student.aiChat.crisis.dismiss')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Хабарлама жазу формасы */}
      <div className="shrink-0 border-t border-zinc-800 p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            placeholder={t('student.aiChat.placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="fade-in flex flex-col flex-1 min-h-0">
      {/* Бет тақырыбы мен ескерту */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 tracking-tight">
          {t('student.aiChat.title')}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">{t('student.aiChat.disclaimer')}</p>
      </div>

      {/* Негізгі контейнер: сайдбар + чат */}
      <div className="flex-1 min-h-0 flex rounded-lg border border-zinc-800 overflow-hidden">
        {/* Сол сайдбар: десктопта әрдайым, мобайлда 'list' күйінде */}
        <div className={cn(
          'w-full lg:w-[240px] lg:flex lg:flex-col border-r border-zinc-800 shrink-0',
          mobileView === 'list' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
        )}>
          {ConversationsList}
        </div>

        {/* Оң чат аймағы: десктопта әрдайым, мобайлда 'chat' күйінде */}
        <div className={cn(
          'flex-1 min-w-0',
          mobileView === 'chat' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
        )}>
          {ChatArea}
        </div>
      </div>

      {/* Чатты жою растау диалогы */}
      <Dialog open={!!confirmDelete} onOpenChange={open => !open && setConfirmDelete(null)}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>{t('student.aiChat.deleteConvDialog.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400 py-1 truncate">{confirmDelete?.title}</p>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={() => deleteConversation(confirmDelete)}>
              {t('student.aiChat.deleteConvDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
