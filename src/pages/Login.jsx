import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, BrainCircuit, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес').min(1, 'Email обязателен'),
  password: z.string().min(6, 'Минимальная длина пароля — 6 символов'),
});

const DEMO_ACCOUNTS = [
  { role: 'student', label: 'Студент', email: 'student1@university.kz' },
  { role: 'psychologist', label: 'Психолог', email: 'psych1@university.kz' },
  { role: 'admin', label: 'Администратор', email: 'admin@university.kz' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data) {
    setError('');
    try {
      const user = await login(data.email, data.password);
      toast.success('Вход выполнен');
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'psychologist') navigate('/psychologist/schedule');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

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
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-zinc-50 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <div className="font-semibold text-zinc-50 text-base leading-none">MindSpace</div>
            <div className="text-xs text-zinc-500 mt-0.5">Психологическая поддержка</div>
          </div>
        </div>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Вход в систему</CardTitle>
            <CardDescription>Введите данные вашего аккаунта</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
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

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                id="login-submit"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Входим...
                  </>
                ) : (
                  <>
                    Войти
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Separator className="flex-1" />
                <span className="text-xs text-zinc-600">Демо-аккаунты</span>
                <Separator className="flex-1" />
              </div>

              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.role}
                    id={`demo-${d.role}`}
                    type="button"
                    onClick={() => fillDemo(d.role)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-md border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-sm"
                  >
                    <span className="text-zinc-300 font-medium">{d.label}</span>
                    <span className="text-zinc-500 text-xs">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 text-center space-y-2">
              <p className="text-xs text-zinc-500">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-zinc-300 hover:text-zinc-100 transition-colors">
                  Зарегистрироваться
                </Link>
              </p>
              <Link to="/" className="block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                На главную
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
