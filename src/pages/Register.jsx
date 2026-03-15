import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, BrainCircuit, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const schema = z.object({
  name: z.string().min(2, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  confirm: z.string(),
  faculty: z.string().optional(),
  course: z.coerce.number().min(1).max(6).optional().or(z.literal('')),
}).refine((d) => d.password === d.confirm, {
  message: 'Пароли не совпадают',
  path: ['confirm'],
});

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const courseValue = watch('course');

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
      if (!res.ok) throw new Error(json.error || 'Ошибка регистрации');

      localStorage.setItem('token', json.token);
      toast.success('Аккаунт создан');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
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
            <CardTitle className="text-lg">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт студента</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Полное имя <span className="text-zinc-600">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input id="reg-name" placeholder="Имя Фамилия" className="pl-9" {...register('name')} />
                </div>
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email <span className="text-zinc-600">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input id="reg-email" type="email" placeholder="your@university.kz" className="pl-9" {...register('email')} />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Пароль <span className="text-zinc-600">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input id="reg-password" type="password" placeholder="••••••" className="pl-9" {...register('password')} />
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm">Повторите</Label>
                  <Input id="reg-confirm" type="password" placeholder="••••••" {...register('confirm')} />
                  {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Faculty + Course */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-faculty">Факультет</Label>
                  <Input id="reg-faculty" placeholder="ИВТ, ЭЭФ..." {...register('faculty')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Курс</Label>
                  <Select onValueChange={(v) => setValue('course', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="1–6" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} курс</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Создаём аккаунт...</>
                ) : (
                  <>Создать аккаунт<ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center space-y-2">
              <p className="text-xs text-zinc-500">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-zinc-300 hover:text-zinc-100 transition-colors">
                  Войти
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
