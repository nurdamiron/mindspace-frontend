import { useState, useEffect } from 'react';
import { Loader2, Plus, CalendarDays, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/DatePicker';

// Психологтің бос уақыт слоттарын басқару беті
export default function PsychSlots() {
  const { t, i18n } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: '', start_time: '09:00', end_time: '10:00' });
  const [saving, setSaving] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState(null);

  // Слоттарды API-дан жүктеу
  useEffect(() => {
    api.get('/psychologist/slots').then(setSlots).finally(() => setLoading(false));
  }, []);

  // Жеке слот жасайтын функция
  async function createSlot(e) {
    e.preventDefault();
    if (!form.date) { toast.error(t('psychologist.slots.selectDate')); return; }
    setSaving(true);
    try {
      const res = await api.post('/psychologist/slots', {
        date: form.date,
        slots: [{ start_time: form.start_time, end_time: form.end_time }],
      });
      // Жаңа слотты тізімге қосып, күні мен уақыты бойынша сұрыптау
      setSlots((s) => [...s, ...res].sort((a, b) => a.date > b.date ? 1 : a.start_time > b.start_time ? 1 : -1));
      toast.success(t('psychologist.slots.slotAdded'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Таңдалған күнге толық жұмыс күні слоттарын жасайтын функция
  async function generateFullDay() {
    if (!form.date) { toast.error(t('psychologist.slots.selectDate')); return; }
    setSaving(true);
    try {
      // Сағат 09:00–17:00 аралығындағы барлық сағаттық слоттар
      const times = [
        ['09:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'],
        ['13:00', '14:00'], ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00'],
      ];
      const res = await api.post('/psychologist/slots', {
        date: form.date,
        slots: times.map(([start_time, end_time]) => ({ start_time, end_time })),
      });
      setSlots((s) => [...s, ...res].sort((a, b) => a.date > b.date ? 1 : a.start_time > b.start_time ? 1 : -1));
      toast.success(t('psychologist.slots.allSlotsAdded'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Слотты жоятын функция
  async function deleteSlot(id) {
    setDeletingSlot(id);
    try {
      await api.delete(`/psychologist/slots/${id}`);
      setSlots((s) => s.filter((sl) => sl.id !== id));
      toast.success(t('psychologist.slots.slotDeleted'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingSlot(null);
    }
  }

  // Слоттарды күн бойынша топтастыру
  const grouped = slots.reduce((acc, slot) => {
    const key = slot.date;
    if (!acc[key]) acc[key] = { date: slot.date, slots: [] };
    acc[key].slots.push(slot);
    return acc;
  }, {});

  // Жүктелу индикаторы
  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fade-in space-y-5">
      {/* Бет тақырыбы */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('psychologist.slots.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('psychologist.slots.subtitle')}</p>
      </div>

      {/* Слот жасау формасы */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-300">{t('psychologist.slots.formTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createSlot} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Күн таңдағышы */}
              <div className="space-y-1.5 sm:col-span-1">
                <Label>{t('psychologist.slots.dateLabel')}</Label>
                <DatePicker
                  value={form.date}
                  onChange={(v) => setForm((f) => ({ ...f, date: v }))}
                  minDate={new Date().toISOString().split('T')[0]}
                  placeholder={t('datePicker.select')}
                />
              </div>
              {/* Басталу уақыты */}
              <div className="space-y-1.5">
                <Label>{t('psychologist.slots.startLabel')}</Label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-transparent px-3 py-1 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 [color-scheme:dark]"
                />
              </div>
              {/* Аяқталу уақыты */}
              <div className="space-y-1.5">
                <Label>{t('psychologist.slots.endLabel')}</Label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-transparent px-3 py-1 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 [color-scheme:dark]"
                />
              </div>
            </div>
            {/* Толық күн және жеке слот батырмалары */}
            <div className="flex flex-wrap gap-2.5">
              <Button type="button" variant="secondary" onClick={generateFullDay} disabled={saving} className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {t('psychologist.slots.fullDayBtn')}
              </Button>
              <Button type="submit" disabled={saving} className="flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t('psychologist.slots.addSlotBtn')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Слоттар жоқ болса бос күй */}
      {Object.values(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <Settings className="w-5 h-5 text-zinc-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-zinc-300">{t('psychologist.slots.noSlots')}</p>
            <p className="text-sm text-zinc-600 mt-1">{t('psychologist.slots.noSlotsHint')}</p>
          </div>
        </div>
      ) : (
        // Күн бойынша топталған слоттар
        <div className="space-y-3">
          {Object.values(grouped).map((g) => (
            <Card key={g.date} className="border-zinc-800 bg-zinc-900">
              <CardContent className="p-5">
                {/* Күн тақырыбы және бос/брондалған санауыштар */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-zinc-100">
                    {new Date(g.date).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="success">
                      {t('psychologist.slots.available', { count: g.slots.filter((s) => s.is_available).length })}
                    </Badge>
                    <Badge variant="secondary">
                      {t('psychologist.slots.booked', { count: g.slots.filter((s) => !s.is_available).length })}
                    </Badge>
                  </div>
                </div>
                {/* Слоттарды жапсырма түрінде көрсету */}
                <div className="flex flex-wrap gap-1.5">
                  {g.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border',
                        slot.is_available
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                      )}
                    >
                      <span>{slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}</span>
                      {/* Тек бос слоттарды жоюға болады */}
                      {slot.is_available && (
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          disabled={deletingSlot === slot.id}
                          className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                        >
                          {deletingSlot === slot.id
                            ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            : <Trash2 className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
