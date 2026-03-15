import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Lock } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const pwSchema = z.object({
  current_password: z.string().min(1, 'Введите текущий пароль'),
  new_password: z.string().min(6, 'Минимум 6 символов'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Пароли не совпадают',
  path: ['confirm_password'],
});

const schema = z.object({
  name: z.string().min(2, 'Имя обязательно'),
  specialization: z.string().optional(),
  languages: z.string().optional(),
  experience_years: z.coerce.number().min(0).optional().or(z.literal('')),
  bio: z.string().optional(),
});

function PasswordSection() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(pwSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  async function onSubmit(data) {
    try {
      await api.patch('/auth/password', {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Пароль изменён');
      reset();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            Смена пароля
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw_current">Текущий пароль</Label>
            <Input id="pw_current" type="password" {...register('current_password')} />
            {errors.current_password && <p className="text-xs text-red-400">{errors.current_password.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw_new">Новый пароль</Label>
              <Input id="pw_new" type="password" placeholder="Мин. 6 символов" {...register('new_password')} />
              {errors.new_password && <p className="text-xs text-red-400">{errors.new_password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw_confirm">Подтвердите пароль</Label>
              <Input id="pw_confirm" type="password" {...register('confirm_password')} />
              {errors.confirm_password && <p className="text-xs text-red-400">{errors.confirm_password.message}</p>}
            </div>
          </div>
          <Button type="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Меняем...</> : 'Изменить пароль'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

export default function PsychProfile() {
  const { user, setUser } = useAuth();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', specialization: '', languages: '', experience_years: '', bio: '' },
  });

  useEffect(() => {
    api.get('/psychologist/profile').then((data) => {
      reset({
        name: data.name || '',
        specialization: data.specialization || '',
        languages: data.languages || '',
        experience_years: data.experience_years || '',
        bio: data.bio || '',
      });
    });
  }, [reset]);

  async function onSubmit(data) {
    try {
      const updated = await api.patch('/psychologist/profile', {
        name: data.name,
        specialization: data.specialization || null,
        languages: data.languages || null,
        experience_years: data.experience_years ? Number(data.experience_years) : null,
        bio: data.bio || null,
      });
      if (setUser) setUser((u) => ({ ...u, name: updated.name }));
      toast.success('Профиль обновлён');
      reset(data);
    } catch (err) {
      toast.error(err.message);
    }
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="fade-in space-y-6 max-w-[560px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Мой профиль</h1>
        <p className="text-sm text-zinc-500 mt-1">Информация о специалисте</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-300">
          {initials}
        </div>
        <div>
          <div className="font-medium text-zinc-100">{user?.name || '—'}</div>
          <div className="text-sm text-zinc-500">{user?.email}</div>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              Профессиональная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Имя <span className="text-zinc-600">*</span></Label>
              <Input id="name" placeholder="Д-р Имя Фамилия" {...register('name')} />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="specialization">Специализация</Label>
                <Input id="specialization" placeholder="Стресс, тревожность..." {...register('specialization')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="languages">Языки</Label>
                <Input id="languages" placeholder="Казахский, Русский" {...register('languages')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="experience_years">Опыт (лет)</Label>
                <Input id="experience_years" type="number" min={0} placeholder="5" {...register('experience_years')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">О себе</Label>
              <Textarea id="bio" placeholder="Краткое описание для студентов..." {...register('bio')} />
            </div>

            <Button type="submit" disabled={isSubmitting || !isDirty} className="w-full">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Сохраняем...</> : 'Сохранить изменения'}
            </Button>
          </CardContent>
        </Card>
      </form>

      <PasswordSection />
    </div>
  );
}
