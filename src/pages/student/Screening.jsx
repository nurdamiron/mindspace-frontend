import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, MessageSquare, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Психологиялық скрининг формасының компоненті
export default function Screening() {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Сұрақтар мен жауап нұсқаларын аудармадан алады
  const questions = t('student.screening.questions', { returnObjects: true });
  const options = t('student.screening.options', { returnObjects: true });

  // Сұрақтарды id-мен нысанға айналдырады
  const QUESTIONS = Array.isArray(questions)
    ? questions.map((text, i) => ({ id: `q${i + 1}`, text }))
    : [];

  // Барлық сұрақтарға жауап берілгенін тексереді
  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);
  const answeredCount = Object.keys(answers).length;

  // Скрининг жауаптарын серверге жіберіп, нәтиже алады
  async function handleSubmit(e) {
    e.preventDefault();
    if (!allAnswered) {
      toast.error(t('student.screening.notAllAnswered'));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/student/surveys', { type: 'screening', answers });
      setResult(res);
      toast.success(t('student.screening.result.title'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Нәтиже экраны: қауіп деңгейі, ұпай және ұсынылған әрекеттер
  if (result) {
    const riskKey = result.risk_level || 'low';
    // Қауіп деңгейіне сәйкес Badge вариантын анықтайды
    const RISK_VARIANTS = { low: 'success', moderate: 'warning', high: 'destructive' };
    return (
      <div className="fade-in max-w-[620px] space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('student.screening.result.title')}</h1>
        </div>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-8 text-center space-y-5">
            {/* Қауіп деңгейінің белгісі */}
            <Badge variant={RISK_VARIANTS[riskKey] || 'default'} className="text-sm px-4 py-1.5">
              {t(`student.screening.result.${riskKey}.label`)}
            </Badge>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
              {t(`student.screening.result.${riskKey}.desc`)}
            </p>

            {/* Жалпы ұпай блогы */}
            <div className="inline-block bg-zinc-800 rounded-lg px-8 py-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{t('student.screening.result.score')}</div>
              <div className="text-3xl font-bold text-zinc-100">
                {result.score}
                <span className="text-lg text-zinc-500 font-normal"> / 25</span>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* AI чат немесе психолог брондау сілтемелері */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="secondary" asChild>
                <Link to="/student/chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t('student.dashboard.actions.aiChat')}
                </Link>
              </Button>
              <Button asChild>
                <Link to="/student/psychologists" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('student.screening.result.bookPsych')}
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
      {/* Бет тақырыбы мен орындалу прогресі */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('student.screening.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {t('student.screening.subtitle')}
          <span className="ml-3 text-zinc-600">
            {t('student.screening.question', { current: answeredCount, total: QUESTIONS.length })}
          </span>
        </p>
      </div>

      {/* Жауап беру прогресінің жолағы */}
      <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-zinc-400 transition-all duration-500"
          style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Сұрақтар тізімі формасы */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {QUESTIONS.map((q, qi) => (
          <Card key={q.id} className="border-zinc-800 bg-zinc-900">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-600 mb-2">
                {t('student.screening.question', { current: qi + 1, total: QUESTIONS.length })}
              </p>
              <p className="text-sm font-medium text-zinc-100 leading-relaxed mb-4">{q.text}</p>
              {/* Жауап нұсқалары батырмалары */}
              <div className="space-y-2">
                {(Array.isArray(options) ? options : []).map((opt, i) => {
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
                      {/* Нұсқа нөмірінің индикаторы */}
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

        {/* Жіберу батырмасы — барлық жауап берілгенде белсенді */}
        <Button
          type="submit"
          className="w-full"
          disabled={!allAnswered || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('student.screening.submitting')}
            </>
          ) : (
            t('student.screening.submit')
          )}
        </Button>
      </form>
    </div>
  );
}
