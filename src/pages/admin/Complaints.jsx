// Admin Complaints : психологтарға студент шағымдарын басқару беті
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Flag, Loader2, AlertTriangle, ChevronRight, Filter } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// SEVERITY_STYLES : severity бойынша badge түсі
const SEVERITY_STYLES = {
  critical: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  low: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
};

// STATUS_STYLES : шағым статусы badge стилі
const STATUS_STYLES = {
  open: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  in_review: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

const STATUS_FILTERS = ['all', 'open', 'in_review', 'resolved', 'rejected'];
const RESOLUTION_STATUSES = ['in_review', 'resolved', 'rejected'];

export default function AdminComplaints() {
  const { t } = useTranslation();
  // complaints : барлық шағымдар тізімі
  const [complaints, setComplaints] = useState([]);
  // loading : бастапқы жүктелу
  const [loading, setLoading] = useState(true);
  // statusFilter : 'all' немесе нақты статус
  const [statusFilter, setStatusFilter] = useState('all');
  // selected : ашылған шағым (диалог)
  const [selected, setSelected] = useState(null);
  // newStatus, notes : шешім формасы
  const [newStatus, setNewStatus] = useState('resolved');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // load : сервермен шағымдарды жүктеу
  function load(filter = statusFilter) {
    setLoading(true);
    const q = filter === 'all' ? '' : `?status=${filter}`;
    api.get(`/admin/complaints${q}`)
      .then(setComplaints)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  // open : шағымды ашу + форма өрістерін бастапқы күйге
  function openComplaint(c) {
    setSelected(c);
    setNewStatus(c.status === 'open' ? 'in_review' : 'resolved');
    setNotes(c.resolution_notes || '');
  }

  // submit : шағым статусын жаңарту
  async function submit() {
    setSaving(true);
    try {
      const updated = await api.patch(`/admin/complaints/${selected.id}`, {
        status: newStatus,
        resolution_notes: notes || null,
      });
      setComplaints((list) =>
        list.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      toast.success(t('admin.complaints.updateSuccess'));
      setSelected(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fade-in space-y-5">
      {/* Тақырып */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 tracking-tight">
            {t('admin.complaints.title')}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {t('admin.complaints.subtitle')}
          </p>
        </div>

        {/* Сүзгі */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {t(`admin.complaints.filters.${f}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Шағымдар тізімі */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <Flag className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-600">{t('admin.complaints.noComplaints')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {complaints.map((c) => (
            <Card
              key={c.id}
              className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => openComplaint(c)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                {/* Severity иконасы */}
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border',
                  SEVERITY_STYLES[c.severity] || SEVERITY_STYLES.medium
                )}>
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-100 text-sm">
                      {t(`admin.complaints.categories.${c.category}`)}
                    </span>
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border',
                      SEVERITY_STYLES[c.severity] || SEVERITY_STYLES.medium
                    )}>
                      {t(`admin.complaints.severities.${c.severity}`)}
                    </span>
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border',
                      STATUS_STYLES[c.status] || STATUS_STYLES.open
                    )}>
                      {t(`admin.complaints.statuses.${c.status}`)}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    <span className="text-zinc-400">{c.psychologist_name}</span>
                    {' ← '}
                    <span>{c.student_name}</span>
                    {' · '}
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {c.details}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Шағым деталі мен шешу диалогы */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" />
              {t('admin.complaints.dialog.title')}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-1">
              {/* Шағым мәлімдемесі */}
              <div className="rounded-md bg-zinc-800/50 border border-zinc-800 p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <Badge variant="outline">
                    {t(`admin.complaints.categories.${selected.category}`)}
                  </Badge>
                  <span className={cn(
                    'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border',
                    SEVERITY_STYLES[selected.severity] || SEVERITY_STYLES.medium
                  )}>
                    {t(`admin.complaints.severities.${selected.severity}`)}
                  </span>
                </div>
                <div className="text-xs text-zinc-500">
                  <span className="text-zinc-300 font-medium">{selected.psychologist_name}</span>
                  {' ← '}
                  <span>{selected.student_name}</span>
                  {' · '}
                  {new Date(selected.created_at).toLocaleString()}
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {selected.details}
                </p>
              </div>

              {/* Жаңа статус таңдау */}
              <div className="space-y-1.5">
                <Label>{t('admin.complaints.dialog.newStatus')}</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOLUTION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`admin.complaints.statuses.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Шешім ескертпесі */}
              <div className="space-y-1.5">
                <Label>{t('admin.complaints.dialog.resolution')}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('admin.complaints.dialog.resolutionPlaceholder')}
                  rows={3}
                />
              </div>

              <p className="text-[11px] text-zinc-600 leading-relaxed">
                {t('admin.complaints.dialog.note')}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? (
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
