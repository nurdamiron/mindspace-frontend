import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Check-in формасының валидация схемасы — барлық метрикалар 1-5 аралығында
const checkInSchema = z.object({
  mood: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  sleep: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  productivity: z.number().min(1).max(5),
  notes: z.string().optional(),
});

// Бағаланатын метрикалар тізімі
const METRIC_KEYS = ['mood', 'stress', 'sleep', 'energy', 'productivity'];

// Күнделікті check-in формасының компоненті
export default function CheckIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  // Бүгін check-in жасалған-жасалмағанын тексереді
  useEffect(() => {
    api.get('/student/check-ins?days=1').then((data) => {
      const today = new Date().toISOString().split('T')[0];
      if (data.some((c) => c.date?.startsWith(today))) setAlreadyDone(true);
    }).catch(() => {});
  }, []);

  // React Hook Form инициализациясы, барлық метрика үшін 3 әдепкі мән
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(checkInSchema),
    defaultValues: { mood: 3, stress: 3, sleep: 3, energy: 3, productivity: 3, notes: '' },
  });

  // Слайдер мәндерін нақты уақытта қадағалайды
  const watchValues = watch();

  // Шкала белгілерін аудармадан алады
  const SCALE_LABELS = {
    1: t('student.checkIn.scale.1'),
    2: t('student.checkIn.scale.2'),
    3: t('student.checkIn.scale.3'),
    4: t('student.checkIn.scale.4'),
    5: t('student.checkIn.scale.5'),
  };

  // Форманы жіберу: деректерді серверге жазады
  async function onSubmit(data) {
    try {
      await api.post('/student/check-ins', data);
      setSuccess(true);
      toast.success(t('student.checkIn.success'));
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Бүгін check-in жасалса — хабарлама көрсетіп, бетті блоктайды
  if (alreadyDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-zinc-300" />
        </div>
        <div className="text-lg font-semibold text-zinc-100">{t('student.checkIn.alreadyDone')}</div>
        <p className="text-sm text-zinc-500">{t('student.checkIn.alreadyDoneHint')}</p>
        <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>
          {t('student.dashboard.title')}
        </Button>
      </div>
    );
  }

  // Сәтті жіберілгеннен кейін растау экраны
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-zinc-300" />
        </div>
        <div className="text-lg font-semibold text-zinc-100">{t('student.checkIn.success')}</div>
        <p className="text-sm text-zinc-500">{t('common.redirecting')}</p>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-[580px] space-y-6">
      {/* Бет тақырыбы */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('student.checkIn.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('student.checkIn.subtitle')}</p>
      </div>

      {/* Check-in формасы */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-6 space-y-6">
            {/* Әрбір метрика үшін слайдер блогы */}
            {METRIC_KEYS.map((key, i) => {
              const val = watchValues[key] ?? 3;
              return (
                <div key={key}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{t(`student.checkIn.metrics.${key}.label`)}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{t(`student.checkIn.metrics.${key}.desc`)}</div>
                    </div>
                    {/* Ағымдағы мән және оның белгісі */}
                    <div className="text-right">
                      <span className="text-xl font-bold text-zinc-100">{val}</span>
                      <div className="text-xs text-zinc-500">{SCALE_LABELS[val]}</div>
                    </div>
                  </div>

                  {/* Слайдер арқылы мән таңдау */}
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={val}
                    onChange={(e) => setValue(key, Number(e.target.value), { shouldValidate: true })}
                    className="mb-2"
                  />
                  <input type="hidden" {...register(key, { valueAsNumber: true })} />

                  {/* Шкала нүктелерінің белгілері */}
                  <div className="flex justify-between text-[10px] text-zinc-600 px-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={val === n ? 'text-zinc-400 font-medium' : ''}>{n}</span>
                    ))}
                  </div>

                  {i < METRIC_KEYS.length - 1 && <Separator className="mt-6 bg-zinc-800" />}
                </div>
              );
            })}

            <Separator className="bg-zinc-800" />

            {/* Қосымша жазба өрісі */}
            <div className="space-y-1.5">
              <Label htmlFor="checkin-notes" className="text-zinc-400">
                {t('student.checkIn.notes')}
              </Label>
              <Textarea
                id="checkin-notes"
                placeholder={t('student.checkIn.notesPlaceholder')}
                className="min-h-[80px]"
                {...register('notes')}
              />
            </div>

            {/* Жіберу батырмасы */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('student.checkIn.saving')}
                </>
              ) : (
                t('student.checkIn.submit')
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
