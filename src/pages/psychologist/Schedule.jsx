import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, CheckCircle, ClipboardList, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function WeekCalendar({ sessions, onNoteClick }) {
  const { i18n } = useTranslation();
  const today = new Date();
  const startOfWeek = new Date(today);
  const dow = today.getDay();
  startOfWeek.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 13 }).map((_, i) => i + 8);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-x-auto overflow-y-auto min-w-0">
      <div className="grid border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10"
        style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className="border-r border-zinc-800" />
        {weekDays.map((d) => {
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={d.toISOString()} className="px-2 py-2.5 text-center border-r border-zinc-800 last:border-r-0">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">
                {d.toLocaleDateString(i18n.language, { weekday: 'short' })}
              </div>
              <div className={cn(
                'text-sm font-semibold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto',
                isToday ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-300'
              )}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {hours.map((hour) => (
        <div key={hour} className="grid border-b border-zinc-800 last:border-b-0"
          style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div className="px-2 py-2 text-right text-[10px] text-zinc-600 border-r border-zinc-800 pt-1.5">
            {hour.toString().padStart(2, '0')}:00
          </div>
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const events = sessions.filter((s) => {
              const [h] = s.start_time.split(':');
              return s.date?.startsWith(dateStr) && parseInt(h) === hour;
            });
            return (
              <div key={dateStr} className="border-r border-zinc-800 last:border-r-0 min-h-[52px] p-1 space-y-1">
                {events.map((ev) => (
                  <button
                    key={ev.appointment_id}
                    onClick={() => onNoteClick(ev)}
                    className={cn(
                      'w-full text-left rounded px-1.5 py-1 text-[10px] font-medium leading-tight transition-colors',
                      ev.status === 'completed'
                        ? 'bg-zinc-600 text-zinc-200 hover:bg-zinc-500'
                        : 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600'
                    )}
                  >
                    <div className="font-semibold">#{ev.student_id}</div>
                    <div className="opacity-70">{ev.start_time.slice(0, 5)}</div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function Schedule() {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [noteModal, setNoteModal] = useState(null);
  const [noteForm, setNoteForm] = useState({
    condition_before: 5, condition_after: 7, recommend_followup: false, tags: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/psychologist/schedule?period=${period}`)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [period]);

  async function completeSession(id) {
    try {
      await api.patch(`/psychologist/appointments/${id}/complete`);
      setSessions((s) =>
        s.map((ses) => ses.appointment_id === id ? { ...ses, status: 'completed' } : ses)
      );
      toast.success(t('status.completed'));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function saveNote() {
    setSaving(true);
    try {
      await api.post(`/psychologist/sessions/${noteModal.appointment_id}/notes`, noteForm);
      toast.success(t('psychologist.schedule.noteDialog.success'));
      setNoteModal(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const STATUS_CONFIG = {
    scheduled: { label: t('psychologist.schedule.status.scheduled'), variant: 'default' },
    completed: { label: t('psychologist.schedule.status.completed'), variant: 'success' },
    cancelled: { label: t('psychologist.schedule.status.cancelled'), variant: 'secondary' },
  };

  const PERIODS = [
    ['today', t('psychologist.schedule.today')],
    ['week', t('psychologist.schedule.week')],
    ['all', t('psychologist.schedule.month')],
  ];

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('psychologist.schedule.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('psychologist.schedule.subtitle')}</p>
        </div>
        <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-0.5 self-start sm:self-auto">
          {PERIODS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                period === val
                  ? 'bg-zinc-700 text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-zinc-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-zinc-300">{t('psychologist.schedule.noSessions')}</p>
            <p className="text-sm text-zinc-600 mt-1">{t('psychologist.schedule.noSessionsHint')}</p>
          </div>
        </div>
      ) : period === 'week' ? (
        <WeekCalendar sessions={sessions} onNoteClick={setNoteModal} />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const config = STATUS_CONFIG[s.status] || STATUS_CONFIG.scheduled;
            const d = new Date(s.date);
            return (
              <Card key={s.appointment_id} className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
                <CardContent className="p-5 flex items-start gap-4">
                  {/* Time */}
                  <div className="text-center shrink-0 w-14">
                    <div className="text-base font-bold text-zinc-100">{s.start_time?.slice(0, 5)}</div>
                    <div className="text-xs text-zinc-600 my-0.5">|</div>
                    <div className="text-sm text-zinc-500">{s.end_time?.slice(0, 5)}</div>
                  </div>

                  <Separator orientation="vertical" className="h-auto self-stretch bg-zinc-800" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm text-zinc-100">
                        {t('psychologist.schedule.sessionWith')} #{s.student_id}
                      </span>
                      {s.faculty && <span className="text-zinc-500 text-xs">· {s.faculty}</span>}
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <div className="text-xs text-zinc-600 flex flex-wrap gap-2">
                      <span>{d.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      <span>·</span>
                      <span>{s.format === 'online' ? t('psychologist.schedule.format.online') : t('psychologist.schedule.format.offline')}</span>
                      {s.course && <><span>·</span><span>{s.course} {t('common.course')}</span></>}
                    </div>
                    {s.reason && (
                      <p className="text-xs text-zinc-600 mt-1.5 line-clamp-1">{s.reason}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button variant="secondary" size="sm" asChild>
                      <Link to={`/psychologist/students/${s.student_id}`} className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {t('psychologist.studentCard.title')}
                      </Link>
                    </Button>
                    {s.status === 'scheduled' && (
                      <>
                        <Button size="sm" onClick={() => completeSession(s.appointment_id)} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t('psychologist.schedule.status.completed')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setNoteModal(s)} className="flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5" />
                          {t('psychologist.schedule.addNote')}
                        </Button>
                      </>
                    )}
                    {s.status === 'completed' && !s.note_id && (
                      <Button variant="outline" size="sm" onClick={() => setNoteModal(s)} className="flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" />
                        {t('psychologist.schedule.addNote')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={!!noteModal} onOpenChange={(open) => !open && setNoteModal(null)}>
        <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('psychologist.schedule.noteDialog.title')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('psychologist.schedule.noteDialog.conditionBefore')}</Label>
                <span className="text-lg font-bold text-zinc-100">{noteForm.condition_before}</span>
              </div>
              <Slider
                min={1} max={10}
                value={noteForm.condition_before}
                onChange={(e) => setNoteForm((f) => ({ ...f, condition_before: +e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('psychologist.schedule.noteDialog.conditionAfter')}</Label>
                <span className="text-lg font-bold text-zinc-100">{noteForm.condition_after}</span>
              </div>
              <Slider
                min={1} max={10}
                value={noteForm.condition_after}
                onChange={(e) => setNoteForm((f) => ({ ...f, condition_after: +e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('psychologist.schedule.noteDialog.tags')}</Label>
              <input
                className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                placeholder={t('psychologist.schedule.noteDialog.tagsPlaceholder')}
                value={noteForm.tags}
                onChange={(e) => setNoteForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('psychologist.schedule.noteDialog.notes')}</Label>
              <Textarea
                placeholder={t('psychologist.schedule.noteDialog.notesPlaceholder')}
                value={noteForm.notes}
                onChange={(e) => setNoteForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={noteForm.recommend_followup}
                onChange={(e) => setNoteForm((f) => ({ ...f, recommend_followup: e.target.checked }))}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-zinc-400"
              />
              <span className="text-sm text-zinc-300">{t('psychologist.schedule.recommendFollowup')}</span>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setNoteModal(null)}>{t('common.cancel')}</Button>
            <Button onClick={saveNote} disabled={saving}>
              {saving ? t('psychologist.schedule.noteDialog.saving') : t('psychologist.schedule.noteDialog.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
