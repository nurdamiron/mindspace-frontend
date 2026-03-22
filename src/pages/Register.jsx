import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, BrainCircuit, User, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function Register() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Тіркелу формасының валидация схемасы — міндетті өрістер мен құпиясөз сәйкестігі
  const schema = z.object({
    name: z.string().min(2, t('auth.register.errors.name')),
    email: z.string().email(t('auth.register.errors.email')),
    password: z.string().min(6, t('auth.register.errors.password')),
    confirm: z.string(),
    faculty: z.string().optional(),
    course: z.coerce.number().min(1).max(6).optional().or(z.literal('')),
  }).refine((d) => d.password === d.confirm, {
    message: t('auth.register.errors.password'),
    path: ['confirm'],
  });

  // Форма хукін Zod схемасымен инициализациялау
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const courseValue = watch('course');

  // Тіркелу сұранысын API-ге жіберу және сәтті болса студент дашбордына бағыттау
  async function onSubmit(data) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          faculty: data.faculty || undefined,
          course: data.course ? Number(data.course) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t('auth.register.errors.failed'));

      // Токенді сақтап, сәтті хабарлама көрсету
      localStorage.setItem('token', json.token);
      toast.success(t('auth.register.title'));
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Курс опцияларын аудармадан алу
  const courseOptions = t('auth.register.courseOptions', { returnObjects: true });

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        {/* Логотип және бренд атауы */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-zinc-50 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <div className="font-semibold text-zinc-50 text-base leading-none">MindSpace</div>
            <div className="text-xs text-zinc-500 mt-0.5">{t('landing.hero.badge')}</div>
          </div>
        </div>

        {/* Тіркелу картасы */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('auth.register.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Аты-жөні өрісі */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">{t('auth.register.name')} <span className="text-zinc-600">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input id="reg-name" placeholder={t('auth.register.namePlaceholder')} className="pl-9" {...register('name')} />
                </div>
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              {/* Email өрісі */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">{t('auth.register.email')} <span className="text-zinc-600">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input id="reg-email" type="email" placeholder={t('auth.register.emailPlaceholder')} className="pl-9" {...register('email')} />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {/* Құпиясөз және растау өрістері */}
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

              {/* Факультет және курс өрістері — міндетті емес */}
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
                          {Array.isArray(courseOptions) ? courseOptions[n - 1] : t('admin.studentDetail.course', { n })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Жіберу түймесі — жүктелу жағдайын көрсетеді */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{t('auth.register.loading')}</>
                ) : (
                  <>{t('auth.register.submit')}<ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>

            {/* Кіру және басты бетке сілтемелер */}
            <div className="mt-5 text-center space-y-2">
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
