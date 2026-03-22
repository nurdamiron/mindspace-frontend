import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Құпия сөз өрісі — көрсету/жасыру мүмкіндігімен
function PasswordField({ id, label, registration, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 pr-10"
          {...registration}
        />
        {/* Көрсету/жасыру ауыстырғышы */}
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  );
}

// Құпия сөзді өзгерту бөлімі
function PasswordSection() {
  const { t } = useTranslation();

  // Құпия сөз валидация схемасы — сәйкестік тексеруімен
  const pwSchema = useMemo(() => z.object({
    current_password: z.string().min(1, t('common.errors.required')),
    new_password: z.string().min(6, t('common.errors.minPassword')),
    confirm_password: z.string(),
  }).refine((d) => d.new_password === d.confirm_password, {
    message: t('common.errors.passwordMismatch'),
    path: ['confirm_password'],
  }), [t]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(pwSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  // Құпия сөзді API арқылы жаңартатын функция
  async function onSubmit(data) {
    try {
      await api.patch('/auth/password', {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success(t('student.profile.passwordSuccess'));
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
            {t('student.profile.passwordSection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PasswordField
            id="pw_current"
            label={t('student.profile.currentPassword')}
            registration={register('current_password')}
            error={errors.current_password}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordField
              id="pw_new"
              label={t('student.profile.newPassword')}
              registration={register('new_password')}
              error={errors.new_password}
            />
            <PasswordField
              id="pw_confirm"
              label={t('student.profile.confirmPassword')}
              registration={register('confirm_password')}
              error={errors.confirm_password}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t('student.profile.saving')}</> : t('student.profile.changePassword')}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

// Психолог профилі беті
export default function PsychProfile() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  // Профиль формасының валидация схемасы
  const schema = useMemo(() => z.object({
    name: z.string().min(2, t('common.errors.required')),
    specialization: z.string().optional(),
    languages: z.string().optional(),
    experience_years: z.coerce.number().min(0).optional().or(z.literal('')),
    bio: z.string().optional(),
  }), [t]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', specialization: '', languages: '', experience_years: '', bio: '' },
  });

  // Профиль деректерін API-дан жүктеп, форманы толтыру
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

  // Профильді жаңартатын функция
  async function onSubmit(data) {
    try {
      const updated = await api.patch('/psychologist/profile', {
        name: data.name,
        specialization: data.specialization || null,
        languages: data.languages || null,
        experience_years: data.experience_years ? Number(data.experience_years) : null,
        bio: data.bio || null,
      });
      // Контекстегі пайдаланушы атын да жаңарту
      if (setUser) setUser((u) => ({ ...u, name: updated.name }));
      toast.success(t('psychologist.profile.success'));
      reset(data);
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Аватар үшін аты-жөн бастапқы әріптерін алу
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="fade-in space-y-6 max-w-[560px]">
      {/* Бет тақырыбы */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('psychologist.profile.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('psychologist.profile.subtitle')}</p>
      </div>

      {/* Аватар және пайдаланушы ақпараты */}
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

      {/* Профиль редакциялау формасы */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              {t('psychologist.profile.subtitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Аты-жөні өрісі */}
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('psychologist.profile.name')} <span className="text-zinc-600">*</span></Label>
              <Input id="name" placeholder={t('psychologist.profile.name')} {...register('name')} />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Мамандану, тілдер және тәжірибе өрістері */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="specialization">{t('psychologist.profile.specialization')}</Label>
                <Input id="specialization" {...register('specialization')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="languages">{t('psychologist.profile.languages')}</Label>
                <Input id="languages" {...register('languages')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="experience_years">{t('psychologist.profile.experience')}</Label>
                <Input id="experience_years" type="number" min={0} placeholder="5" {...register('experience_years')} />
              </div>
            </div>

            {/* Өзі туралы мәліметтер өрісі */}
            <div className="space-y-1.5">
              <Label htmlFor="bio">{t('psychologist.profile.bio')}</Label>
              <Textarea id="bio" placeholder={t('psychologist.profile.bioPlaceholder')} {...register('bio')} />
            </div>

            {/* Тек өзгеріс болса сақтау батырмасы белсенді */}
            <Button type="submit" disabled={isSubmitting || !isDirty} className="w-full">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t('psychologist.profile.saving')}</> : t('psychologist.profile.saveBtn')}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Құпия сөз өзгерту бөлімі */}
      <PasswordSection />
    </div>
  );
}
