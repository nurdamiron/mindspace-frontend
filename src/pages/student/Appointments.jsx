import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, CalendarDays, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_CONFIG = {
  scheduled: { label: 'Запланировано', variant: 'default' },
  completed: { label: 'Проведено', variant: 'success' },
  cancelled: { label: 'Отменено', variant: 'secondary' },
  no_show: { label: 'Не явился', variant: 'destructive' },
};

function StarRating({ score, onChange, readOnly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => !readOnly && onChange?.(s)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
          disabled={readOnly}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              s <= score ? 'fill-zinc-300 text-zinc-300' : 'text-zinc-700'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackScore, setFeedbackScore] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    api.get('/student/appointments').then(setAppointments).finally(() => setLoading(false));
  }, []);

  async function cancelAppointment(id) {
    setCancelling(id);
    try {
      await api.patch(`/student/appointments/${id}/cancel`, {});
      setAppointments((a) =>
        a.map((ap) => ap.id === id ? { ...ap, status: 'cancelled' } : ap)
      );
      toast.success('Запись отменена');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(null);
    }
  }

  async function submitFeedback() {
    setSubmitting(true);
    try {
      await api.post(`/student/appointments/${feedbackModal.id}/feedback`, {
        feedback_score: feedbackScore,
        feedback_text: feedbackText,
      });
      setAppointments((a) =>
        a.map((ap) =>
          ap.id === feedbackModal.id ? { ...ap, feedback_score: feedbackScore } : ap
        )
      );
      toast.success('Оценка отправлена');
      setFeedbackModal(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="fade-in space-y-5">
      <div className="space-y-2"><Skeleton className="h-7 w-36" /><Skeleton className="h-4 w-48" /></div>
      {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
    </div>
  );

  return (
    <div className="fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Мои записи</h1>
        <p className="text-sm text-zinc-500 mt-1">История всех консультаций</p>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-zinc-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-zinc-300">Записей нет</p>
            <p className="text-sm text-zinc-600 mt-1">Запишитесь к психологу, чтобы получить поддержку</p>
          </div>
          <Button asChild>
            <Link to="/student/psychologists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Выбрать психолога
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const config = STATUS_CONFIG[a.status] || STATUS_CONFIG.scheduled;
            const date = new Date(a.date);
            return (
              <Card key={a.id} className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Date */}
                  <div className="w-14 text-center shrink-0">
                    <div className="text-xl font-bold text-zinc-100">{date.getDate()}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide">
                      {date.toLocaleDateString('ru', { month: 'short' })}
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-12 bg-zinc-800" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-100 text-sm">{a.psychologist_name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{a.specialization}</div>
                    <div className="text-xs text-zinc-600 mt-1.5 flex items-center gap-2 flex-wrap">
                      <span>{a.start_time?.slice(0, 5)}–{a.end_time?.slice(0, 5)}</span>
                      <span>·</span>
                      <span>{a.format === 'online' ? 'Онлайн' : 'Очно'}</span>
                      {a.reason && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[200px]">{a.reason}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status & rating */}
                  <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    {a.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={cancelling === a.id}
                        onClick={() => setConfirmCancel(a)}
                        className="text-zinc-500 hover:text-red-400 hover:border-red-400/30"
                      >
                        <X className="w-3.5 h-3.5" />
                        Отменить
                      </Button>
                    )}
                    {a.status === 'completed' && !a.feedback_score && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFeedbackModal(a);
                          setFeedbackScore(5);
                          setFeedbackText('');
                        }}
                      >
                        Оценить
                      </Button>
                    )}
                    {a.feedback_score && (
                      <StarRating score={a.feedback_score} readOnly />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirm Dialog */}
      <Dialog open={!!confirmCancel} onOpenChange={(open) => !open && setConfirmCancel(null)}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Отменить запись?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400 py-1">
            Запись к{' '}
            <span className="text-zinc-200 font-medium">{confirmCancel?.psychologist_name}</span>
            {' '}на{' '}
            <span className="text-zinc-200 font-medium">
              {confirmCancel && new Date(confirmCancel.date).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
            </span>{' '}
            будет отменена. Слот освободится для других студентов.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setConfirmCancel(null)}>Назад</Button>
            <Button
              variant="destructive"
              disabled={cancelling === confirmCancel?.id}
              onClick={async () => {
                await cancelAppointment(confirmCancel.id);
                setConfirmCancel(null);
              }}
            >
              Да, отменить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackModal} onOpenChange={(open) => !open && setFeedbackModal(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Оценить консультацию</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-zinc-400">
              Как прошла сессия с {feedbackModal?.psychologist_name}?
            </p>

            <div className="flex justify-center py-2">
              <StarRating score={feedbackScore} onChange={setFeedbackScore} />
            </div>

            <div className="space-y-1.5">
              <Label>Комментарий <span className="text-zinc-600">(необязательно)</span></Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Поделитесь впечатлениями..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setFeedbackModal(null)}>
              Отмена
            </Button>
            <Button onClick={submitFeedback} disabled={submitting}>
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
