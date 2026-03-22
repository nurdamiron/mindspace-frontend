import { useState, useEffect } from 'react';
import { Loader2, Plus, CalendarDays, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/DatePicker';

export default function SlotManagement() {
  const { t, i18n } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ psychologist_id: '', date: '', start_time: '09:00', end_time: '10:00' });
  const [saving, setSaving] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState(null);

  // Слоттар мен психологтар тізімін бір мезгілде жүктеу
  useEffect(() => {
    Promise.all([api.get('/admin/slots'), api.get('/admin/psychologists')])
      .then(([s, p]) => {
        setSlots(s);
        setPsychologists(p);
        if (p.length > 0) setForm((f) => ({ ...f, psychologist_id: String(p[0].id) }));
      })
      .finally(() => setLoading(false));
  }, []);

  // Жаңа жеке слот жасау
  async function createSlot(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/admin/slots', {
        psychologist_id: form.psychologist_id,
        date: form.date,
        slots: [{ start_time: form.start_time, end_time: form.end_time }],
      });
      // Жаңа слотқа психолог атын қосып тізімді жаңарту
      setSlots((s) => [...s, ...res.map((r) => ({
        ...r,
        psychologist_name: psychologists.find((p) => p.id === +form.psychologist_id)?.name,
      }))]);
      toast.success(t('admin.slotMgmt.slotAdded'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Таңдалған күнге толық жұмыс күні слоттарын автоматты жасау
  async function generateFullDay() {
    if (!form.psychologist_id || !form.date) {
      toast.error(t('admin.slotMgmt.selectPsychDate'));
      return;
    }
    setSaving(true);
    try {
      // 09:00–17:00 аралығында сағаттық слоттар (түскі үзіліссіз)
      const times = [
        ['09:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'],
        ['13:00', '14:00'], ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00'],
      ];
      const res = await api.post('/admin/slots', {
        psychologist_id: form.psychologist_id,
        date: form.date,
        slots: times.map(([start_time, end_time]) => ({ start_time, end_time })),
      });
      setSlots((s) => [...s, ...res.map((r) => ({
        ...r,
        psychologist_name: psychologists.find((p) => p.id === +form.psychologist_id)?.name,
      }))]);
      toast.success(t('admin.slotMgmt.allSlotsAdded'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Бос слотты жою
  async function deleteSlot(id) {
    setDeletingSlot(id);
    try {
      await api.delete(`/admin/slots/${id}`);
      setSlots((s) => s.filter((sl) => sl.id !== id));
      toast.success(t('admin.slotMgmt.slotDeleted'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingSlot(null);
    }
  }

  // Слоттарды психолог аты + күн кілті бойынша топтастыру
  const grouped = slots.reduce((acc, slot) => {
    const key = `${slot.psychologist_name}__${slot.date}`;
    if (!acc[key]) acc[key] = { name: slot.psychologist_name, date: slot.date, slots: [] };
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
      {/* Тақырып */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('admin.slotMgmt.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('admin.slotMgmt.subtitle')}</p>
      </div>

      {/* Слот жасау формасы */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-300">{t('admin.slotMgmt.formTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createSlot} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Психолог таңдау */}
              <div className="space-y-1.5">
                <Label>{t('admin.slotMgmt.psychologistLabel')}</Label>
                <Select
                  value={form.psychologist_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, psychologist_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.slotMgmt.psychologistPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {psychologists.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Күн таңдау */}
              <div className="space-y-1.5">
                <Label>{t('admin.slotMgmt.dateLabel')}</Label>
                <DatePicker
                  value={form.date}
                  onChange={(v) => setForm((f) => ({ ...f, date: v }))}
                  minDate={new Date().toISOString().split('T')[0]}
                  placeholder={t('datePicker.select')}
                />
              </div>

              {/* Басталу уақыты */}
              <div className="space-y-1.5">
                <Label>{t('admin.slotMgmt.startLabel')}</Label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-transparent px-3 py-1 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 [color-scheme:dark]"
                />
              </div>

              {/* Аяқталу уақыты */}
              <div className="space-y-1.5">
                <Label>{t('admin.slotMgmt.endLabel')}</Label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-transparent px-3 py-1 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Толық күн және жеке слот қосу батырмалары */}
            <div className="flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={generateFullDay}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                {t('admin.slotMgmt.fullDayBtn')}
              </Button>
              <Button type="submit" disabled={saving} className="flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t('admin.slotMgmt.addSlotBtn')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Топтастырылған слоттар тізімі немесе бос күй */}
      {Object.values(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-zinc-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-zinc-300">{t('admin.slotMgmt.noSlots')}</p>
            <p className="text-sm text-zinc-600 mt-1">{t('admin.slotMgmt.noSlotsHint')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.values(grouped).map((g) => (
            <Card key={`${g.name}__${g.date}`} className="border-zinc-800 bg-zinc-900">
              <CardContent className="p-5">
                {/* Психолог аты, күні және бос/броньдалған санаулары */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium text-zinc-100 text-sm">{g.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {new Date(g.date).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="success">
                      {t('admin.slotMgmt.available', { count: g.slots.filter((s) => s.is_available).length })}
                    </Badge>
                    <Badge variant="secondary">
                      {t('admin.slotMgmt.booked', { count: g.slots.filter((s) => !s.is_available).length })}
                    </Badge>
                  </div>
                </div>
                {/* Уақыт слоттары: бос (жасыл) немесе броньдалған (қызыл) */}
                <div className="flex flex-wrap gap-1.5">
                  {g.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border',
                        slot.is_available
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      )}
                    >
                      <span>{slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}</span>
                      {/* Бос слотты жою батырмасы */}
                      {slot.is_available && (
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          disabled={deletingSlot === slot.id}
                          className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                          title={t('admin.slotMgmt.deleteTitle')}
                        >
                          {deletingSlot === slot.id
                            ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            : <Trash2 className="w-2.5 h-2.5" />
                          }
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
