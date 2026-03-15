import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const METRICS = [
  { key: 'mood', label: 'Настроение', desc: 'Как вы себя ощущаете в целом' },
  { key: 'stress', label: 'Уровень стресса', desc: '5 — очень высокий' },
  { key: 'sleep', label: 'Качество сна', desc: 'Насколько хорошо вы спали' },
  { key: 'energy', label: 'Уровень энергии', desc: 'Физическая и умственная бодрость' },
  { key: 'productivity', label: 'Продуктивность', desc: 'Насколько продуктивно прошёл день' },
];

const SCALE_LABELS = {
  1: 'Очень плохо',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично',
};

const checkInSchema = z.object({
  mood: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  sleep: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  productivity: z.number().min(1).max(5),
  notes: z.string().optional(),
});

export default function CheckIn() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

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

  const watchValues = watch();

  async function onSubmit(data) {
    try {
      await api.post('/student/check-ins', data);
      setSuccess(true);
      toast.success('Чек-ин сохранён');
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-zinc-300" />
        </div>
        <div className="text-lg font-semibold text-zinc-100">Чек-ин сохранён</div>
        <p className="text-sm text-zinc-500">Переходим на дашборд...</p>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-[580px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Ежедневный чек-ин</h1>
        <p className="text-sm text-zinc-500 mt-1">Оцените своё состояние по каждому показателю от 1 до 5</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-6 space-y-6">
            {METRICS.map((m, i) => {
              const val = watchValues[m.key] ?? 3;
              return (
                <div key={m.key}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{m.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{m.desc}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-zinc-100">{val}</span>
                      <div className="text-xs text-zinc-500">{SCALE_LABELS[val]}</div>
                    </div>
                  </div>

                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={val}
                    onChange={(e) => setValue(m.key, Number(e.target.value), { shouldValidate: true })}
                    className="mb-2"
                  />
                  <input type="hidden" {...register(m.key, { valueAsNumber: true })} />

                  <div className="flex justify-between text-[10px] text-zinc-600 px-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={val === n ? 'text-zinc-400 font-medium' : ''}>{n}</span>
                    ))}
                  </div>

                  {i < METRICS.length - 1 && <Separator className="mt-6 bg-zinc-800" />}
                </div>
              );
            })}

            <Separator className="bg-zinc-800" />

            <div className="space-y-1.5">
              <Label htmlFor="checkin-notes" className="text-zinc-400">
                Комментарий <span className="text-zinc-600">(необязательно)</span>
              </Label>
              <Textarea
                id="checkin-notes"
                placeholder="Что произошло сегодня? Как вы себя чувствуете?.."
                className="min-h-[80px]"
                {...register('notes')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Сохраняем...
                </>
              ) : (
                'Сохранить чек-ин'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
