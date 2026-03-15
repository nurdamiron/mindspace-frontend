import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, CheckCircle, ClipboardList, CalendarDays } from 'lucide-react';
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

// ─── Week Calendar ────────────────────────────────────────────────
function WeekCalendar({ sessions, onNoteClick }) {
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
      {/* Header row */}
      <div className="grid border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10"
        style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className="border-r border-zinc-800" />
        {weekDays.map((d) => {
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={d.toISOString()} className="px-2 py-2.5 text-center border-r border-zinc-800 last:border-r-0">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">
                {d.toLocaleDateString('ru', { weekday: 'short' })}
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

      {/* Body */}
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

const STATUS_CONFIG = {
  scheduled: { label: 'Запланировано', variant: 'default' },
  completed: { label: 'Проведено', variant: 'success' },
  cancelled: { label: 'Отменено', variant: 'secondary' },
};

export default function Schedule() {
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
      toast.success('Сессия завершена');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function saveNote() {
    setSaving(true);
    try {
      await api.post(`/psychologist/sessions/${noteModal.appointment_id}/notes`, noteForm);
      toast.success('Заметка сохранена');
      setNoteModal(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Моё расписание</h1>
          <p className="text-sm text-zinc-500 mt-1">Управление консультациями</p>
        </div>
        <div className="flex gap-1.5">
          {[['today', 'Сегодня'], ['week', 'Неделя'], ['all', 'Все']].map(([val, label]) => (
            <Button
              key={val}
              variant={period === val ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setPeriod(val)}
            >
              {label}
            </Button>
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
            <p className="font-medium text-zinc-300">Нет записей</p>
            <p className="text-sm text-zinc-600 mt-1">На выбранный период консультаций нет</p>
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
                        Студент #{s.student_id}
                      </span>
                      {s.faculty && <span className="text-zinc-500 text-xs">· {s.faculty}</span>}
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <div className="text-xs text-zinc-600 flex flex-wrap gap-2">
                      <span>{d.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      <span>·</span>
                      <span>{s.format === 'online' ? 'Онлайн' : 'Очно'}</span>
                      {s.course && <><span>·</span><span>{s.course} курс</span></>}
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
                        Карточка
                      </Link>
                    </Button>
                    {s.status === 'scheduled' && (
                      <>
                        <Button size="sm" onClick={() => completeSession(s.appointment_id)} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Завершить
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setNoteModal(s)} className="flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5" />
                          Заметка
                        </Button>
                      </>
                    )}
                    {s.status === 'completed' && !s.note_id && (
                      <Button variant="outline" size="sm" onClick={() => setNoteModal(s)} className="flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" />
                        Заметка
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
            <DialogTitle>Заметка по сессии</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Состояние до (1–10)</Label>
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
                <Label>Состояние после (1–10)</Label>
                <span className="text-lg font-bold text-zinc-100">{noteForm.condition_after}</span>
              </div>
              <Slider
                min={1} max={10}
                value={noteForm.condition_after}
                onChange={(e) => setNoteForm((f) => ({ ...f, condition_after: +e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Теги <span className="text-zinc-600">(через запятую)</span></Label>
              <input
                className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                placeholder="стресс, выгорание, экзамены"
                value={noteForm.tags}
                onChange={(e) => setNoteForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Заметки</Label>
              <Textarea
                placeholder="Наблюдения, рекомендации..."
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
              <span className="text-sm text-zinc-300">Рекомендовать повторную встречу</span>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setNoteModal(null)}>Отмена</Button>
            <Button onClick={saveNote} disabled={saving}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
