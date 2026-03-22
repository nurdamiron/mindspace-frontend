import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, BrainCircuit, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Тест жүйеге кіру үшін демо аккаунттар тізімі
const DEMO_ACCOUNTS = [
  { role: 'student', email: 'student1@university.kz' },
  { role: 'psychologist', email: 'psych1@university.kz' },
  { role: 'admin', email: 'admin@university.kz' },
];

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Кіру формасының валидациясы — email форматы мен құпиясөз ұзындығы
  const loginSchema = z.object({
    email: z.string().email(t('auth.login.errors.email')).min(1, t('auth.login.errors.email')),
    password: z.string().min(6, t('auth.login.errors.password')),
  });

  // React Hook Form инициализациясы Zod валидациясымен
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // Форманы жіберу — кіру және рөлге қарай бағыттау
  async function onSubmit(data) {
    setError('');
    try {
      const user = await login(data.email, data.password);
      toast.success(t('auth.login.successToast'));
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'psychologist') navigate('/psychologist/schedule');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  // Демо аккаунт деректерін форма өрістеріне автоматты толтыру
  function fillDemo(role) {
    const account = DEMO_ACCOUNTS.find((d) => d.role === role);
    if (account) {
      setValue('email', account.email);
      setValue('password', 'password123');
      setError('');
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
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

        {/* Кіру картасы */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('auth.login.title')}</CardTitle>
            <CardDescription>{t('auth.login.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Қате хабарламасы */}
              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Email өрісі */}
              <div className="space-y-1.5">
                <Label htmlFor="login-email">{t('auth.login.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@university.kz"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Құпиясөз өрісі — көрсету/жасыру түймесімен */}
              <div className="space-y-1.5">
                <Label htmlFor="login-password">{t('auth.login.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Жіберу түймесі — жүктелу жағдайын көрсетеді */}
              <Button
                id="login-submit"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('auth.login.loading')}
                  </>
                ) : (
                  <>
                    {t('auth.login.submit')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Демо аккаунттар бөлімі */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Separator className="flex-1" />
                <span className="text-xs text-zinc-600">{t('auth.login.demo.title')}</span>
                <Separator className="flex-1" />
              </div>

              {/* Әр рөл үшін жылдам кіру түймелері */}
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.role}
                    id={`demo-${d.role}`}
                    type="button"
                    onClick={() => fillDemo(d.role)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-md border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-sm"
                  >
                    <span className="text-zinc-300 font-medium">{t(`auth.login.demo.${d.role}`)}</span>
                    <span className="text-zinc-500 text-xs">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Тіркелу және басты бетке сілтемелер */}
            <div className="mt-5 text-center space-y-2">
              <p className="text-xs text-zinc-500">
                {t('auth.login.noAccount')}{' '}
                <Link to="/register" className="text-zinc-300 hover:text-zinc-100 transition-colors">
                  {t('auth.login.register')}
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
