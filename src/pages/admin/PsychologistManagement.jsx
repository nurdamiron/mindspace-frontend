// Күй, эффект, мемоизация
import { useState, useEffect, useMemo } from 'react';
// Форманы басқару
import { useForm } from 'react-hook-form';
// Zod-ты формаға жалғау
import { zodResolver } from '@hookform/resolvers/zod';
// Валидация схемасы
import { z } from 'zod';
// Тост хабарламалары
import { toast } from 'sonner';
// Lucide иконалары
import { Plus, Trash2, Users, Loader2, X, ShieldCheck, ShieldAlert, FileText, ExternalLink, Check, Ban, Flag } from 'lucide-react';
// Аударма хук
import { useTranslation } from 'react-i18next';
// Бетке өту навигациясы
import { useNavigate } from 'react-router-dom';
// HTTP API клиенті
import { api } from '../../api/client';
// shadcn/ui компоненттері
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Статус badge стильдері
const VERIFICATION_STATUS_STYLES = {
  active:    { variant: 'success',     icon: ShieldCheck },
  pending:   { variant: 'secondary',   icon: null },
  probation: { variant: 'default',     icon: ShieldAlert },
  suspended: { variant: 'destructive', icon: Ban },
  rejected:  { variant: 'destructive', icon: Ban },
  revoked:   { variant: 'destructive', icon: Ban },
};

const ALL_STATUSES = ['active', 'pending', 'probation', 'suspended', 'rejected', 'revoked'];

// Психологтарды басқару беті
export default function PsychologistManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Психологтар тізімі
  const [psychologists, setPsychologists] = useState([]);
  // Жүктелу күйі
  const [loading, setLoading] = useState(true);
  // Қосу формасының көрінуі
  const [showForm, setShowForm] = useState(false);
  // Верификация диалогындағы психолог
  const [verifying, setVerifying] = useState(null);
  // Психолог құжаттары
  const [documents, setDocuments] = useState([]);
  // Құжаттар жүктелу күйі
  const [docsLoading, setDocsLoading] = useState(false);
  // Статус формасының өрістері
  const [statusForm, setStatusForm] = useState({ status: 'active', trust_score: 0, reason: '' });
  // Статусты сақтау күйі
  const [savingStatus, setSavingStatus] = useState(false);

  // Қосу формасының валидация схемасы
  const psychSchema = useMemo(() => z.object({
    name: z.string().min(2, t('common.errors.required')),
    email: z.string().email(t('common.errors.invalidEmail')),
    specialization: z.string().optional(),
    languages: z.string().optional(),
    experience_years: z.coerce.number().min(0).optional(),
    password: z.string().min(6, t('common.errors.minPassword')),
    bio: z.string().optional(),
  }), [t]);

  // Форманы баптау
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(psychSchema),
    defaultValues: { password: 'password123' },
  });

  // Психологтар тізімін жүктеу
  useEffect(() => {
    api.get('/admin/psychologists').then(setPsychologists).finally(() => setLoading(false));
  }, []);

  // Жаңа психолог қосу
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

  // Верификация панелін ашу әрі құжаттарды жүктеу
  async function openVerification(p) {
    setVerifying(p);
    setStatusForm({
      status: p.verification_status || 'pending',
      trust_score: p.trust_score || 0,
      reason: '',
    });
    setDocuments([]);
    setDocsLoading(true);
    try {
      const docs = await api.get(`/admin/psychologists/${p.id}/documents`);
      setDocuments(docs);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDocsLoading(false);
    }
  }

  // Құжатты мақұлдау не қабылдамау
  async function reviewDocument(docId, status) {
    const note = status === 'rejected' ? window.prompt(t('admin.psychologistMgmt.verify.rejectNotePrompt')) : '';
    if (status === 'rejected' && note === null) return; // бас тарту
    try {
      const updated = await api.patch(`/admin/documents/${docId}/review`, {
        status,
        review_notes: note || null,
      });
      setDocuments((d) =>
        d.map((doc) => (doc.id === docId ? { ...doc, ...updated } : doc))
      );
      toast.success(t('admin.psychologistMgmt.verify.docUpdated'));
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Верификация статусын сақтау
  async function saveStatus() {
    setSavingStatus(true);
    try {
      const updated = await api.patch(
        `/admin/psychologists/${verifying.id}/status`,
        {
          status: statusForm.status,
          trust_score: Number(statusForm.trust_score) || 0,
          reason: statusForm.reason || null,
        }
      );
      setPsychologists((list) =>
        list.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
      toast.success(t('admin.psychologistMgmt.verify.statusUpdated'));
      setVerifying(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingStatus(false);
    }
  }

  // Психологты жою
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
      {/* Тақырып пен форма батырмасы */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 tracking-tight">{t('admin.psychologistMgmt.title')}</h1>
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

      {/* Психолог қосу формасы */}
      {showForm && (
        <Card className="border-zinc-800 bg-zinc-900 fade-in">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-zinc-200 mb-5">{t('admin.psychologistMgmt.formTitle')}</h2>
            <form onSubmit={handleSubmit(addPsychologist)}>
              {/* Форма өрістері */}
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

                {/* Биография өрісі */}
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
                {/* Психолог аватары */}
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-300 shrink-0">
                  {p.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>

                {/* Аты, email, статистика — басқанда детальдарға өту */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/admin/psychologists/${p.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/admin/psychologists/${p.id}`); }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium text-zinc-100 text-sm">{p.name}</div>
                    {/* Статус белгісі */}
                    {(() => {
                      const cfg = VERIFICATION_STATUS_STYLES[p.verification_status] || VERIFICATION_STATUS_STYLES.pending;
                      const Icon = cfg.icon;
                      return (
                        <Badge variant={cfg.variant} className="gap-1 text-[10px]">
                          {Icon && <Icon className="w-2.5 h-2.5" />}
                          {t(`admin.psychologistMgmt.verify.statuses.${p.verification_status || 'pending'}`)}
                        </Badge>
                      );
                    })()}
                    {/* Ашық шағымдар саны */}
                    {Number(p.open_complaints) > 0 && (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <Flag className="w-2.5 h-2.5" />
                        {p.open_complaints}
                      </Badge>
                    )}
                  </div>
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
                    <Badge variant="outline" className="text-xs">
                      {t('admin.psychologistMgmt.verify.trustScore')}: {p.trust_score || 0}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {/* Верификация диалогын ашу */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openVerification(p)}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('admin.psychologistMgmt.verify.openBtn')}
                  </Button>
                  {/* Жою батырмасы */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePsych(p.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Верификация диалогы: құжат пен статус */}
      <Dialog open={!!verifying} onOpenChange={(open) => !open && setVerifying(null)}>
        <DialogContent className="max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {verifying?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Құжаттар тізімі мен тексеру */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {t('admin.psychologistMgmt.verify.documentsTitle')}
              </h3>
              {docsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-xs text-zinc-600 py-2">{t('admin.psychologistMgmt.verify.noDocuments')}</p>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="rounded-md border border-zinc-800 bg-zinc-800/40 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-zinc-200">
                              {t(`admin.psychologistMgmt.verify.docTypes.${doc.document_type}`)}
                              {doc.document_number && (
                                <span className="text-zinc-500 font-normal"> · {doc.document_number}</span>
                              )}
                            </div>
                            {doc.issuing_organization && (
                              <div className="text-xs text-zinc-500 truncate">{doc.issuing_organization}</div>
                            )}
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {t('admin.psychologistMgmt.verify.openDoc')}
                            </a>
                          </div>
                        </div>
                        <Badge
                          variant={
                            doc.status === 'approved' ? 'success' :
                            doc.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className="shrink-0"
                        >
                          {t(`admin.psychologistMgmt.verify.docStatuses.${doc.status}`)}
                        </Badge>
                      </div>
                      {doc.review_notes && (
                        <div className="text-xs text-amber-400/80">
                          <span className="text-zinc-500">{t('admin.psychologistMgmt.verify.reviewNotes')}: </span>
                          {doc.review_notes}
                        </div>
                      )}
                      {doc.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs"
                            onClick={() => reviewDocument(doc.id, 'approved')}
                          >
                            <Check className="w-3 h-3" />
                            {t('admin.psychologistMgmt.verify.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs"
                            onClick={() => reviewDocument(doc.id, 'rejected')}
                          >
                            <Ban className="w-3 h-3" />
                            {t('admin.psychologistMgmt.verify.reject')}
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Статус өзгерту панелі */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {t('admin.psychologistMgmt.verify.statusTitle')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('admin.psychologistMgmt.verify.statusLabel')}</Label>
                  <Select
                    value={statusForm.status}
                    onValueChange={(v) => setStatusForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`admin.psychologistMgmt.verify.statuses.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('admin.psychologistMgmt.verify.trustScoreLabel')}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={statusForm.trust_score}
                    onChange={(e) => setStatusForm((f) => ({ ...f, trust_score: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.psychologistMgmt.verify.reasonLabel')}</Label>
                <Textarea
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder={t('admin.psychologistMgmt.verify.reasonPlaceholder')}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setVerifying(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={saveStatus} disabled={savingStatus}>
              {savingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
