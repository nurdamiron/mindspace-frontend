import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, MessageSquare, Users } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const QUESTIONS = [
  { id: 'q1', text: 'Как часто за последние 2 недели вас беспокоило чувство тревоги или напряжения?', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Постоянно'] },
  { id: 'q2', text: 'Насколько вам сложно расслабиться после напряжённого дня?', options: ['Легко', 'Чаще легко', 'По-разному', 'Чаще сложно', 'Очень сложно'] },
  { id: 'q3', text: 'Как часто вы чувствуете себя уставшим даже после достаточного сна?', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Постоянно'] },
  { id: 'q4', text: 'Насколько вам сложно сосредоточиться на учёбе?', options: ['Легко', 'Чаще легко', 'По-разному', 'Чаще сложно', 'Очень сложно'] },
  { id: 'q5', text: 'Как часто у вас возникают мысли о том, что вы не справляетесь?', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Постоянно'] },
];

const RISK_CONFIG = {
  low: {
    label: 'Низкий риск',
    variant: 'success',
    desc: 'Ваше психологическое состояние в норме. Продолжайте следить за собой.',
  },
  moderate: {
    label: 'Умеренный риск',
    variant: 'warning',
    desc: 'Есть признаки повышенного стресса. Рекомендуем поговорить с психологом.',
  },
  high: {
    label: 'Высокий риск',
    variant: 'destructive',
    desc: 'Обнаружены признаки значительного стресса. Пожалуйста, запишитесь к психологу.',
  },
};

export default function Screening() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);
  const answeredCount = Object.keys(answers).length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!allAnswered) {
      toast.error('Ответьте на все вопросы');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/student/surveys', { type: 'screening', answers });
      setResult(res);
      toast.success('Результаты сохранены');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const risk = RISK_CONFIG[result.risk_level] || RISK_CONFIG.low;
    return (
      <div className="fade-in max-w-[620px] space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Результат скрининга</h1>
        </div>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-8 text-center space-y-5">
            <Badge variant={risk.variant} className="text-sm px-4 py-1.5">
              {risk.label}
            </Badge>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
              {risk.desc}
            </p>

            <div className="inline-block bg-zinc-800 rounded-lg px-8 py-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Итоговый балл</div>
              <div className="text-3xl font-bold text-zinc-100">
                {result.score}
                <span className="text-lg text-zinc-500 font-normal"> / 25</span>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="secondary" asChild>
                <Link to="/student/chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Поговорить с ИИ
                </Link>
              </Button>
              <Button asChild>
                <Link to="/student/psychologists" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Записаться к психологу
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-[620px] space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Психологический скрининг</h1>
        <p className="text-sm text-zinc-500 mt-1">
          5 вопросов · 2 минуты · Анонимно
          <span className="ml-3 text-zinc-600">Отвечено: {answeredCount} / {QUESTIONS.length}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-zinc-400 transition-all duration-500"
          style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {QUESTIONS.map((q, qi) => (
          <Card key={q.id} className="border-zinc-800 bg-zinc-900">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-600 mb-2">Вопрос {qi + 1} из {QUESTIONS.length}</p>
              <p className="text-sm font-medium text-zinc-100 leading-relaxed mb-4">{q.text}</p>
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: i + 1 }))}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left transition-colors ${
                        selected
                          ? 'bg-zinc-700 border border-zinc-600 text-zinc-100'
                          : 'border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                        selected ? 'border-zinc-400 bg-zinc-500 text-zinc-100' : 'border-zinc-700 text-zinc-600'
                      }`}>
                        {i + 1}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="submit"
          className="w-full"
          disabled={!allAnswered || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Анализируем...
            </>
          ) : (
            'Получить результат'
          )}
        </Button>

        {!allAnswered && (
          <p className="text-center text-xs text-zinc-600">Ответьте на все вопросы для завершения</p>
        )}
      </form>
    </div>
  );
}
