import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, BrainCircuit, User, ArrowRight, Loader2, GraduationCap, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function Register() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');

  const schema = useMemo(() => {
    const base = {
      name: z.string().min(2, t('auth.register.errors.name')),
      email: z.string().email(t('auth.register.errors.email')),
      password: z.string().min(6, t('auth.register.errors.password')),
      confirm: z.string(),
    };
    const shape = role === 'psychologist'
      ? { ...base, specialization: z.string().optional() }
      : { ...base, faculty: z.string().optional(), course: z.coerce.number().min(1).max(6).optional().or(z.literal('')) };
    return z.object(shape).refine((d) => d.password === d.confirm, {
      message: t('auth.register.errors.password'),
      path: ['confirm'],
    });
  }, [role, t]);

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  function switchRole(r) {
    setRole(r);
    reset();
  }

  async function onSubmit(data) {
    try {
      const body = {
        name: data.name,
        email: data.email,
        password: data.password,
        role,
        ...(role === 'psychologist'
          ? { specialization: data.specialization || undefined }
          : { faculty: data.faculty || undefined, course: data.course ? Number(data.course) : undefined }),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t('auth.register.errors.failed'));

      localStorage.setItem('token', json.token);
      toast.success(t('auth.register.title'));

      if (role === 'psychologist') {
        navigate('/psychologist/profile');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.message);
    }
  }

  const courseOptions = t('auth.register.courseOptions', { returnObjects: true });

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-zinc-50 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <div className="font-semibold text-zinc-50 text-base leading-none">MindSpace</div>
            <div className="text-xs text-zinc-500 mt-0.5">{t('landing.hero.badge')}</div>
          </div>
        </div>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('auth.register.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Роль переключатель */}
            <div className="mb-5">
              <p className="text-xs text-zinc-500 mb-2">{t('auth.register.roleLabel')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => switchRole('student')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                    role === 'student'
                      ? 'border-zinc-400 bg-zinc-800 text-zinc-100'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  )}
                >
                  <GraduationCap className="w-4 h-4" />
                  {t('auth.register.roleStudent')}
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('psychologist')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                    role === 'psychologist'
                      ? 'border-zinc-400 bg-zinc-800 text-zinc-100'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  )}
                >
                  <Stethoscope className="w-4 h-4" />
                  {t('auth.register.rolePsychologist')}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">{t('auth.register.name')} <span className="text-zinc-600">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input id="reg-name" placeholder={t('auth.register.namePlaceholder')} className="pl-9" {...register('name')} />
                </div>
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email">{t('auth.register.email')} <span className="text-zinc-600">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input id="reg-email" type="email" placeholder={t('auth.register.emailPlaceholder')} className="pl-9" {...register('email')} />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">{t('auth.register.password')} <span className="text-zinc-600">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input id="reg-password" type="password" placeholder={t('auth.register.passwordPlaceholder')} className="pl-9" {...register('password')} />
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm">{t('auth.register.password')}</Label>
                  <Input id="reg-confirm" type="password" placeholder="••••••" {...register('confirm')} />
                  {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {role === 'student' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-faculty">{t('auth.register.faculty')}</Label>
                    <Input id="reg-faculty" placeholder={t('auth.register.facultyPlaceholder')} {...register('faculty')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('auth.register.course')}</Label>
                    <Select onValueChange={(v) => setValue('course', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('auth.register.coursePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {Array.isArray(courseOptions) ? courseOptions[n - 1] : String(n)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="reg-spec">{t('auth.register.specialization')}</Label>
                  <Input id="reg-spec" placeholder={t('auth.register.specializationPlaceholder')} {...register('specialization')} />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{t('auth.register.loading')}</>
                ) : (
                  <>{t('auth.register.submit')}<ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>

            {role === 'psychologist' && (
              <p className="mt-4 text-xs text-zinc-500 text-center">
                {t('auth.register.psychologistHint')}
              </p>
            )}

            <div className="mt-4 text-center space-y-2">
              <p className="text-xs text-zinc-500">
                {t('auth.register.hasAccount')}{' '}
                <Link to="/login" className="text-zinc-300 hover:text-zinc-100 transition-colors">
                  {t('auth.register.login')}
                </Link>
              </p>
              <Link to="/" className="block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                {t('notFound.button')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
