// useState, useEffect, useMemo — күй, жанама әсерлер және мемоизация үшін
import { useState, useEffect, useMemo } from 'react';
// useForm — форманы басқару үшін
import { useForm } from 'react-hook-form';
// zodResolver — Zod схемасын react-hook-form-ға байланыстыру үшін
import { zodResolver } from '@hookform/resolvers/zod';
// z — форма валидация схемасын жасау үшін
import { z } from 'zod';
// toast — хабарлама тостерін көрсету үшін
import { toast } from 'sonner';
// Lucide иконалары — қосу, жою, пайдаланушылар, жүктелу, жабу
import { Plus, Trash2, Users, Loader2, X } from 'lucide-react';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../../api/client';
// shadcn/ui компоненттері — батырма, енгізу, белгіше, мәтін аймағы, белгі, карта
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// PsychologistManagement — психологтарды басқару беті
export default function PsychologistManagement() {
  const { t } = useTranslation();
  // psychologists — психологтар тізімі
  const [psychologists, setPsychologists] = useState([]);
  // loading — деректер жүктелу күйі
  const [loading, setLoading] = useState(true);
  // showForm — психолог қосу формасының көрінуі
  const [showForm, setShowForm] = useState(false);

  // psychSchema — психолог қосу формасының валидация схемасы
  const psychSchema = useMemo(() => z.object({
    name: z.string().min(2, t('common.errors.required')),
    email: z.string().email(t('common.errors.invalidEmail')),
    specialization: z.string().optional(),
    languages: z.string().optional(),
    experience_years: z.coerce.number().min(0).optional(),
    password: z.string().min(6, t('common.errors.minPassword')),
    bio: z.string().optional(),
  }), [t]);

  // Форма күйін және валидациясын инициализациялау
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(psychSchema),
    defaultValues: { password: 'password123' },
  });

  // Психологтар тізімін жүктеу
  useEffect(() => {
    api.get('/admin/psychologists').then(setPsychologists).finally(() => setLoading(false));
  }, []);

  // addPsychologist — жаңа психолог қосу және тізімді жаңарту
  async function addPsychologist(data) {
    try {
      const added = await api.post('/admin/psychologists', data);
      setPsychologists((p) => [...p, added]);
      reset();
      setShowForm(false);
      toast.success(t('admin.psychologistMgmt.addSuccess'));
    } catch (err) {
      toast.error(err.message);
    }
  }

  // deletePsych — психологты растаудан кейін жою
  async function deletePsych(id) {
    if (!window.confirm(t('admin.psychologistMgmt.deleteConfirm'))) return;
    try {
      await api.delete(`/admin/psychologists/${id}`);
      setPsychologists((p) => p.filter((x) => x.id !== id));
      toast.success(t('admin.psychologistMgmt.deleteSuccess'));
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Жүктелу индикаторы
  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fade-in space-y-5">
      {/* Тақырып және форманы ашу/жабу батырмасы */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('admin.psychologistMgmt.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('admin.psychologistMgmt.count', { count: psychologists.length })}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'default'}>
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              {t('admin.psychologistMgmt.cancelBtn')}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {t('admin.psychologistMgmt.addBtn')}
            </>
          )}
        </Button>
      </div>

      {/* Психолог қосу формасы (showForm = true болғанда ғана) */}
      {showForm && (
        <Card className="border-zinc-800 bg-zinc-900 fade-in">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-zinc-200 mb-5">{t('admin.psychologistMgmt.formTitle')}</h2>
            <form onSubmit={handleSubmit(addPsychologist)}>
              {/* Форма өрістерін динамикалық рендерлеу */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { name: 'name', label: t('admin.psychologistMgmt.fields.name'), placeholder: t('admin.psychologistMgmt.fields.namePlaceholder'), required: true },
                  { name: 'email', label: 'Email', placeholder: t('admin.psychologistMgmt.fields.emailPlaceholder'), type: 'email', required: true },
                  { name: 'specialization', label: t('admin.psychologistMgmt.fields.specialization'), placeholder: t('admin.psychologistMgmt.fields.specializationPlaceholder') },
                  { name: 'languages', label: t('admin.psychologistMgmt.fields.languages'), placeholder: t('admin.psychologistMgmt.fields.languagesPlaceholder') },
                  { name: 'experience_years', label: t('admin.psychologistMgmt.fields.experience'), placeholder: t('admin.psychologistMgmt.fields.experiencePlaceholder'), type: 'number' },
                  { name: 'password', label: t('admin.psychologistMgmt.fields.password'), required: true },
                ].map((f) => (
                  <div key={f.name} className="space-y-1.5">
                    <Label htmlFor={f.name}>
                      {f.label}
                      {f.required && <span className="text-zinc-600 ml-1">*</span>}
                    </Label>
                    <Input
                      id={f.name}
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      {...register(f.name)}
                    />
                    {errors[f.name] && (
                      <p className="text-xs text-red-400">{errors[f.name].message}</p>
                    )}
                  </div>
                ))}

                {/* Биография өрісі толық ені бойынша */}
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="bio">{t('admin.psychologistMgmt.fields.bio')}</Label>
                  <Textarea id="bio" placeholder={t('admin.psychologistMgmt.fields.bioPlaceholder')} {...register('bio')} />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('admin.psychologistMgmt.submitting')}
                  </>
                ) : (
                  t('admin.psychologistMgmt.submitBtn')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Психологтар тізімі немесе бос күй */}
      {psychologists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-600">{t('admin.psychologistMgmt.noPsychologists')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {psychologists.map((p) => (
            <Card key={p.id} className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                {/* Психолог аватары (аттың бастапқы әріптері) */}
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-300 shrink-0">
                  {p.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>

                {/* Психолог аты, email және статистика белгілері */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-100 text-sm">{p.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {p.email}
                    {p.specialization && ` · ${p.specialization}`}
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {p.experience_years && (
                      <Badge variant="secondary" className="text-xs">{t('admin.psychologistMgmt.experienceBadge', { count: p.experience_years })}</Badge>
                    )}
                    {p.completed_sessions > 0 && (
                      <Badge variant="success" className="text-xs">{t('admin.psychologistMgmt.sessionsBadge', { count: p.completed_sessions })}</Badge>
                    )}
                    {p.total_students > 0 && (
                      <Badge variant="outline" className="text-xs">{t('admin.psychologistMgmt.studentsBadge', { count: p.total_students })}</Badge>
                    )}
                  </div>
                </div>

                {/* Психологты жою батырмасы */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePsych(p.id)}
                  className="shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
