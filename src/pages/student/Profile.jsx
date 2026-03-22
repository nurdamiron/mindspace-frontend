import { useEffect, useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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

function PasswordSection() {
  const { t } = useTranslation();
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
            id="current_password"
            label={t('student.profile.currentPassword')}
            registration={register('current_password')}
            error={errors.current_password}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordField
              id="new_password"
              label={t('student.profile.newPassword')}
              registration={register('new_password')}
              error={errors.new_password}
            />
            <PasswordField
              id="confirm_password"
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

export default function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  const schema = useMemo(() => z.object({
    name: z.string().min(2, t('common.errors.required')),
    faculty: z.string().optional(),
    course: z.coerce.number().min(1).max(6).optional().or(z.literal('')),
    gender: z.string().optional(),
    age: z.coerce.number().min(16).max(99).optional().or(z.literal('')),
  }), [t]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', faculty: '', course: '', gender: '', age: '' },
  });

  const genderValue = watch('gender');

  useEffect(() => {
    api.get('/student/profile').then((data) => {
      reset({
        name: data.name || '',
        faculty: data.faculty || '',
        course: data.course || '',
        gender: data.gender || '',
        age: data.age || '',
      });
    });
  }, [reset]);

  async function onSubmit(data) {
    try {
      const updated = await api.patch('/student/profile', {
        name: data.name,
        faculty: data.faculty || null,
        course: data.course ? Number(data.course) : null,
        gender: data.gender || null,
        age: data.age ? Number(data.age) : null,
      });
      if (setUser) setUser((u) => ({ ...u, name: updated.name }));
      toast.success(t('student.profile.success'));
      reset(data);
    } catch (err) {
      toast.error(err.message);
    }
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="fade-in space-y-6 max-w-[560px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('student.profile.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t('student.profile.subtitle')}</p>
      </div>

      {/* Avatar row */}
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
              {t('student.profile.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('student.profile.name')} <span className="text-zinc-600">*</span></Label>
              <Input id="name" placeholder={t('student.profile.name')} {...register('name')} />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="faculty">{t('student.profile.faculty')}</Label>
                <Input id="faculty" {...register('faculty')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course">{t('student.profile.course')}</Label>
                <Input id="course" type="number" min={1} max={6} placeholder="1–6" {...register('course')} />
              </div>

              <div className="space-y-1.5">
                <Label>{t('student.profile.gender')}</Label>
                <Select
                  value={genderValue || 'none'}
                  onValueChange={(v) => setValue('gender', v === 'none' ? '' : v, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('student.profile.selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('student.profile.selectGender')}</SelectItem>
                    <SelectItem value="male">{t('student.profile.genderMale')}</SelectItem>
                    <SelectItem value="female">{t('student.profile.genderFemale')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age">{t('student.profile.age')}</Label>
                <Input id="age" type="number" min={16} max={99} placeholder="18" {...register('age')} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('student.profile.saving')}
                </>
              ) : (
                t('student.profile.saveBtn')
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      <PasswordSection />
    </div>
  );
}
