// useState, useEffect — компонент күйі мен жанама әсерлер үшін
import { useState, useEffect } from 'react';
// Link — ішкі сілтемелер үшін
import { Link } from 'react-router-dom';
// Lucide иконалары — рейтинг, пайдаланушылар, күнтізбе, жабу, уақыт, формат
import { Star, Users, CalendarDays, X, Clock, Wifi, MapPin } from 'lucide-react';
// toast — хабарлама тостерін көрсету үшін
import { toast } from 'sonner';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../../api/client';
// shadcn/ui компоненттері — диалог, батырма, белгі, белгіше, мәтін аймағы, скелет
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

// StarRating — жұлдызды рейтинг компоненті: оқу немесе өзгерту режимінде жұмыс істейді
function StarRating({ score, onChange, readOnly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => !readOnly && onChange?.(s)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
          disabled={readOnly}
        >
          {/* Таңдалған жұлдыздарды толтырады */}
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

// STATUS_STYLES — кездесу статусына сәйкес стиль конфигурациясы
const STATUS_STYLES = {
  scheduled: { variant: 'default', dot: 'bg-zinc-400' },
  completed: { variant: 'success', dot: 'bg-emerald-400' },
  cancelled: { variant: 'secondary', dot: 'bg-zinc-600' },
  no_show:   { variant: 'destructive', dot: 'bg-red-400' },
};

// Appointments — студенттің кездесулер беті
export default function Appointments() {
  const { t, i18n } = useTranslation();
  // appointments — кездесулер тізімі
  const [appointments, setAppointments] = useState([]);
  // loading — деректер жүктелу күйі
  const [loading, setLoading] = useState(true);
  // feedbackModal — кері байланыс диалогындағы кездесу
  const [feedbackModal, setFeedbackModal] = useState(null);
  // feedbackScore — кері байланыс ұпайы
  const [feedbackScore, setFeedbackScore] = useState(5);
  // feedbackText — кері байланыс мәтіні
  const [feedbackText, setFeedbackText] = useState('');
  // submitting — кері байланыс жіберу күйі
  const [submitting, setSubmitting] = useState(false);
  // cancelling — болдырмау процесіндегі кездесу идентификаторы
  const [cancelling, setCancelling] = useState(null);
  // confirmCancel — болдырмауды растау диалогындағы кездесу
  const [confirmCancel, setConfirmCancel] = useState(null);

  // Бет жүктелгенде кездесулерді серверден алады
  useEffect(() => {
    api.get('/student/appointments').then(setAppointments).finally(() => setLoading(false));
  }, []);

  // cancelAppointment — кездесуді болдырмау: статусты жергілікті жаңартады
  async function cancelAppointment(id) {
    setCancelling(id);
    try {
      await api.patch(`/student/appointments/${id}/cancel`, {});
      setAppointments((a) =>
        a.map((ap) => ap.id === id ? { ...ap, status: 'cancelled' } : ap)
      );
      toast.success(t('student.appointments.cancelSuccess'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(null);
      setConfirmCancel(null);
    }
  }

  // submitFeedback — кері байланыс жіберу: ұпай мен мәтінді серверге сақтайды
  async function submitFeedback() {
    setSubmitting(true);
    try {
      await api.post(`/student/appointments/${feedbackModal.id}/feedback`, {
        feedback_score: feedbackScore,
        feedback_text: feedbackText,
      });
      // Жергілікті тізімде ұпайды жаңартады
      setAppointments((a) =>
        a.map((ap) =>
          ap.id === feedbackModal.id ? { ...ap, feedback_score: feedbackScore } : ap
        )
      );
      toast.success(t('student.appointments.feedbackDialog.success'));
      setFeedbackModal(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Жүктелу кезінде скелет экраны
  if (loading) return (
    <div className="fade-in space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
    </div>
  );

  // Кездесулерді алдағы және өткен деп бөледі
  const upcoming = appointments.filter(a => a.status === 'scheduled');
  const past = appointments.filter(a => a.status !== 'scheduled');

  // AppointmentCard — жеке кездесу картасы компоненті
  function AppointmentCard({ a }) {
    const config = STATUS_STYLES[a.status] || STATUS_STYLES.scheduled;
    const date = new Date(a.date);
    const day = date.getDate();
    const month = date.toLocaleDateString(i18n.language, { month: 'short' });
    const weekday = date.toLocaleDateString(i18n.language, { weekday: 'short' });

    return (
      <div className="flex gap-0 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-colors">
        {/* Күн бағаны — апта күні, сан, ай атауы */}
        <div className="w-16 shrink-0 flex flex-col items-center justify-center bg-zinc-800/50 py-4 gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{weekday}</span>
          <span className="text-2xl font-bold text-zinc-100 leading-none">{day}</span>
          <span className="text-[11px] text-zinc-400 uppercase tracking-wide">{month}</span>
        </div>

        {/* Кездесу мазмұны: психолог аты, статус, уақыт, формат */}
        <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-sm text-zinc-100 truncate">{a.psychologist_name}</div>
              {a.specialization && (
                <div className="text-xs text-zinc-500 mt-0.5 truncate">{a.specialization}</div>
              )}
            </div>
            <Badge variant={config.variant} className="shrink-0">{t(`student.appointments.status.${a.status}`) || a.status}</Badge>
          </div>

          {/* Уақыт және формат (онлайн/офлайн) ақпараты */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="w-3 h-3" />
              {a.start_time?.slice(0, 5)}–{a.end_time?.slice(0, 5)}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              {a.format === 'online'
                ? <><Wifi className="w-3 h-3" />{t('student.appointments.formatOnline')}</>
                : <><MapPin className="w-3 h-3" />{t('student.appointments.formatOffline')}</>}
            </span>
            {a.reason && (
              <span className="text-xs text-zinc-600 truncate max-w-[180px]">{a.reason}</span>
            )}
          </div>

          {/* Болдырмау немесе кері байланыс қалдыру батырмалары */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div>
              {a.feedback_score && <StarRating score={a.feedback_score} readOnly />}
            </div>
            <div className="flex gap-2">
              {a.status === 'scheduled' && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cancelling === a.id}
                  onClick={() => setConfirmCancel(a)}
                  className="h-7 px-2.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                >
                  <X className="w-3 h-3 mr-1" />
                  {t('student.appointments.cancelBtn')}
                </Button>
              )}
              {/* Аяқталған кездесуге кері байланыс берілмесе батырма шығады */}
              {a.status === 'completed' && !a.feedback_score && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => {
                    setFeedbackModal(a);
                    setFeedbackScore(5);
                    setFeedbackText('');
                  }}
                >
                  {t('student.appointments.feedbackBtn')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      {/* Бет тақырыбы */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('student.appointments.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('student.appointments.subtitle')}</p>
      </div>

      {/* Кездесу жоқ болса бос күй экраны */}
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-zinc-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-zinc-300">{t('student.appointments.noData')}</p>
            <p className="text-sm text-zinc-600 mt-1">{t('student.appointments.noDataHint')}</p>
          </div>
          <Button asChild className="mt-1">
            <Link to="/student/psychologists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('student.appointments.bookFirst')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Алдағы кездесулер бөлімі */}
          {upcoming.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 px-0.5">
                {t('student.appointments.upcoming')} · {upcoming.length}
              </h2>
              {upcoming.map(a => <AppointmentCard key={a.id} a={a} />)}
            </section>
          )}

          {/* Өткен кездесулер бөлімі */}
          {past.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 px-0.5">
                {t('student.appointments.past')} · {past.length}
              </h2>
              {past.map(a => <AppointmentCard key={a.id} a={a} />)}
            </section>
          )}
        </div>
      )}

      {/* Болдырмауды растау диалогы */}
      <Dialog open={!!confirmCancel} onOpenChange={(open) => !open && setConfirmCancel(null)}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>{t('student.appointments.cancelDialog.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400 py-1">
            {t('student.appointments.cancelDialog.desc')}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setConfirmCancel(null)}>
              {t('student.appointments.cancelDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={cancelling === confirmCancel?.id}
              onClick={() => cancelAppointment(confirmCancel.id)}
            >
              {t('student.appointments.cancelDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Кері байланыс диалогы — жұлдыз рейтингі мен пікір өрісі */}
      <Dialog open={!!feedbackModal} onOpenChange={(open) => !open && setFeedbackModal(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('student.appointments.feedbackDialog.title')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <p className="text-sm text-zinc-400">{feedbackModal?.psychologist_name}</p>

            {/* Жұлдыз рейтингін таңдау */}
            <div className="flex justify-center py-1">
              <StarRating score={feedbackScore} onChange={setFeedbackScore} />
            </div>

            {/* Мәтіндік пікір өрісі */}
            <div className="space-y-1.5">
              <Label>{t('student.appointments.feedbackDialog.comment')}</Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t('student.appointments.feedbackDialog.commentPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setFeedbackModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submitFeedback} disabled={submitting}>
              {submitting
                ? t('student.appointments.feedbackDialog.submitting')
                : t('student.appointments.feedbackDialog.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
