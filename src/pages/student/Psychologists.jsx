import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, ChevronRight, CalendarDays, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Психологтар тізімі және жазылу беті
export default function Psychologists() {
  const { t, i18n } = useTranslation();

  // Компонент күйлері
  const [psychologists, setPsychologists] = useState([]);
  const [selected, setSelected] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [format, setFormat] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  // Беттің жүктелуінде психологтар тізімін API-дан алу
  useEffect(() => {
    api.get('/student/psychologists').then(setPsychologists).finally(() => setLoading(false));
  }, []);

  // Психологты таңдап, оның бос уақыт слоттарын жүктеу
  async function selectPsychologist(psych) {
    setSelected(psych);
    setSelectedSlot(null);
    setSlots([]);
    try {
      const data = await api.get(`/student/psychologists/${psych.id}/slots`);
      setSlots(data);
    } catch {
      toast.error(t('student.psychologists.noSlots'));
    }
  }

  // Таңдалған слотқа жазылу сұранысын жіберу
  async function book() {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      await api.post('/student/appointments', {
        psychologist_id: selected.id,
        slot_id: selectedSlot.id,
        reason,
        format,
      });
      setSuccess(true);
      toast.success(t('student.psychologists.success'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBooking(false);
    }
  }

  // Деректер жүктелу кезіндегі спиннер
  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );

  // Жазылу сәтті болғаннан кейін растау экраны
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-zinc-300" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-100">{t('student.psychologists.success')}</p>
          <p className="text-sm text-zinc-500 mt-1">{selected?.name}</p>
        </div>
        {/* Қабылдауларға немесе бас бетке өту батырмалары */}
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/student/appointments" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {t('student.appointments.title')}
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/student/dashboard">{t('notFound.button')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Слоттарды күн бойынша топтастыру
  const groupedSlots = slots.reduce((acc, slot) => {
    const d = slot.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});

  // Фильтр бойынша күндерді сүзу немесе алғашқы 5 күнді алу
  const filteredDates = filterDate
    ? Object.keys(groupedSlots).filter((d) => d === filterDate)
    : Object.keys(groupedSlots).slice(0, 5);

  return (
    <div className="fade-in space-y-5">
      {/* Бет тақырыбы */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('student.psychologists.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('student.psychologists.subtitle')}</p>
      </div>

      {/* Психолог таңдалса — екі баған, таңдалмаса — бір баған */}
      <div className={cn('grid gap-5', selected ? 'grid-cols-1 lg:grid-cols-[1fr_1.4fr]' : 'grid-cols-1 max-w-2xl')}>
        {/* Психологтар тізімі */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 px-1">
            {t('student.psychologists.title')}
          </h2>
          {psychologists.map((p) => (
            // Психологты таңдауға арналған карточка батырмасы
            <button
              key={p.id}
              onClick={() => selectPsychologist(p)}
              className={cn(
                'w-full text-left rounded-lg border p-4 transition-colors',
                selected?.id === p.id
                  ? 'border-zinc-600 bg-zinc-800'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Психолог аватары — аты-жөні бас әріптерінен */}
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-300 shrink-0">
                  {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-100 text-sm">{p.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{p.specialization}</div>
                  {/* Тәжірибе жылы мен тілдер белгілері */}
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {p.experience_years && (
                      <Badge variant="secondary" className="text-xs">
                        {p.experience_years} {t('student.psychologists.experience')}
                      </Badge>
                    )}
                    {p.languages && p.languages.split(',').map((l) => (
                      <Badge key={l} variant="outline" className="text-xs">{l.trim()}</Badge>
                    ))}
                  </div>
                  {p.bio && (
                    <p className="text-xs text-zinc-600 mt-2 leading-relaxed line-clamp-2">{p.bio}</p>
                  )}
                </div>
                <ChevronRight className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  selected?.id === p.id ? 'text-zinc-300' : 'text-zinc-700'
                )} />
              </div>
            </button>
          ))}
        </div>

        {/* Жазылу панелі — психолог таңдалғанда ғана көрінеді */}
        {selected && (
          <div className="space-y-4 fade-in">
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-300">
                  {t('student.psychologists.availableSlots')} — {selected.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Күн бойынша фильтр */}
                {Object.keys(groupedSlots).length > 0 && (
                  <div className="space-y-1.5">
                    <Label>{t('student.psychologists.selectSlot')}</Label>
                    <Select value={filterDate || 'all'} onValueChange={(v) => setFilterDate(v === 'all' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('student.psychologists.filter.all')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('student.psychologists.filter.all')}</SelectItem>
                        {Object.keys(groupedSlots).map((d) => (
                          <SelectItem key={d} value={d}>
                            {new Date(d).toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Бос слот жоқ болса хабар, болса күн бойынша топталған слоттар */}
                {filteredDates.length === 0 ? (
                  <div className="text-center py-8 text-sm text-zinc-600">
                    {t('student.psychologists.noSlots')}
                  </div>
                ) : filteredDates.map((date) => (
                  <div key={date}>
                    <p className="text-xs font-medium text-zinc-500 mb-2.5">
                      {new Date(date).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    {/* Уақыт слоттары — таңдалған слот ерекшеленеді */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {groupedSlots[date].map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            'px-2.5 py-2 rounded-md text-xs font-medium border transition-colors',
                            selectedSlot?.id === slot.id
                              ? 'bg-zinc-50 text-zinc-900 border-zinc-50'
                              : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 bg-zinc-900'
                          )}
                        >
                          {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Жазылу формасы — слот таңдалғанда ғана көрінеді */}
            {selectedSlot && (
              <Card className="border-zinc-800 bg-zinc-900 fade-in">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-300">{t('student.psychologists.selectSlot')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Онлайн/офлайн форматын таңдау */}
                  <div className="space-y-1.5">
                    <Label>{t('student.psychologists.format')}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['offline', 'online'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFormat(f)}
                          className={cn(
                            'py-2 rounded-md text-sm border transition-colors font-medium',
                            format === f
                              ? 'bg-zinc-50 text-zinc-900 border-zinc-50'
                              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                          )}
                        >
                          {f === 'offline' ? t('student.psychologists.formatOffline') : t('student.psychologists.formatOnline')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Жазылу себебін енгізу */}
                  <div className="space-y-1.5">
                    <Label>
                      {t('student.psychologists.reason')}
                    </Label>
                    <Textarea
                      placeholder={t('student.psychologists.reasonPlaceholder')}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  {/* Жазылу мәліметтерінің қорытынды шолуы */}
                  <div className="rounded-md bg-zinc-800 p-3.5 space-y-1.5 text-sm">
                    {[
                      [t('student.psychologists.selectedPsych'), selected.name],
                      [t('student.appointments.date'), new Date(selectedSlot.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })],
                      [t('student.appointments.time'), `${selectedSlot.start_time.slice(0, 5)}–${selectedSlot.end_time.slice(0, 5)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-zinc-500">{k}:</span>
                        <span className="font-medium text-zinc-200">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Жазылуды растау батырмасы */}
                  <Button className="w-full" onClick={book} disabled={booking}>
                    {booking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('student.psychologists.confirming')}
                      </>
                    ) : (
                      t('student.psychologists.confirm')
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
