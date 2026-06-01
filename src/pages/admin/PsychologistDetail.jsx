// useState, useEffect — компонент күйі мен жанама әсерлер үшін
import { useState, useEffect } from 'react';
// useParams, Link — URL параметрлері мен ішкі сілтемелер үшін
import { useParams, Link } from 'react-router-dom';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// Lucide иконалары
import {
  ArrowLeft, ShieldCheck, ShieldAlert, FileText, ExternalLink,
  Briefcase, Languages as LanguagesIcon, CalendarDays, Users, Flag, History,
} from 'lucide-react';
// api — серверге HTTP сұраныстар
import { api } from '../../api/client';
// shadcn/ui компоненттері
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// VERIFICATION_STATUS_STYLES — статус белгісінің стильдері
const VERIFICATION_STATUS_STYLES = {
  active:    { variant: 'success',     icon: ShieldCheck },
  probation: { variant: 'warning',     icon: ShieldAlert },
  pending:   { variant: 'secondary',   icon: null },
  suspended: { variant: 'destructive', icon: ShieldAlert },
  rejected:  { variant: 'destructive', icon: ShieldAlert },
  revoked:   { variant: 'destructive', icon: ShieldAlert },
};

// AdminPsychologistDetail — әкімші психолог толық ақпараты беті
export default function AdminPsychologistDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/psychologists/${id}`).then(setData).finally(() => setLoading(false));
  }, [id]);

  // fmtDate — күнді locale бойынша пішімдеу
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="fade-in space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data?.psychologist) {
    return (
      <div className="fade-in space-y-4">
        <Link to="/admin/psychologists" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-4 h-4" />
          {t('admin.psychologistDetail.back')}
        </Link>
        <p className="text-sm text-zinc-600">{t('admin.psychologistDetail.notFound')}</p>
      </div>
    );
  }

  const p = data.psychologist;
  const cfg = VERIFICATION_STATUS_STYLES[p.verification_status] || VERIFICATION_STATUS_STYLES.pending;
  const StatusIcon = cfg.icon;
  const initials = p.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // STATS — қысқаша статистика карталары
  const STATS = [
    { icon: CalendarDays, label: t('admin.psychologistDetail.completedSessions'), value: Number(p.completed_sessions) || 0 },
    { icon: Users, label: t('admin.psychologistDetail.totalStudents'), value: Number(p.total_students) || 0 },
    { icon: Flag, label: t('admin.psychologistDetail.openComplaints'), value: Number(p.open_complaints) || 0 },
    { icon: ShieldCheck, label: t('admin.psychologistMgmt.verify.trustScore'), value: p.trust_score || 0 },
  ];

  return (
    <div className="fade-in space-y-5">
      {/* Артқа сілтеме */}
      <Link to="/admin/psychologists" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t('admin.psychologistDetail.back')}
      </Link>

      {/* Тақырып : аватар, аты, статус */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-semibold text-zinc-300 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-zinc-100">{p.name}</h1>
              <Badge variant={cfg.variant} className="gap-1 text-xs">
                {StatusIcon && <StatusIcon className="w-3 h-3" />}
                {t(`admin.psychologistMgmt.verify.statuses.${p.verification_status || 'pending'}`)}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 mt-1">{p.email}</p>
            <p className="text-xs text-zinc-600 mt-1">
              {t('admin.psychologistDetail.registered')}: {fmtDate(p.created_at)}
              {p.verified_at && (
                <> · {t('admin.psychologistDetail.verifiedAt')}: {fmtDate(p.verified_at)}
                  {p.verified_by_name ? ` (${p.verified_by_name})` : ''}</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <Card key={s.label} className="border-zinc-800 bg-zinc-900">
            <CardContent className="p-4">
              <s.icon className="w-4 h-4 text-zinc-500 mb-2" />
              <div className="text-2xl font-semibold text-zinc-100">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Профиль */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('admin.psychologistDetail.profile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-zinc-500">{t('admin.psychologistDetail.specialization')}</div>
              <div className="text-zinc-200">{p.specialization || '—'}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <LanguagesIcon className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-zinc-500">{t('admin.psychologistDetail.languages')}</div>
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                {p.languages
                  ? p.languages.split(',').map((l) => (
                      <Badge key={l} variant="outline" className="text-xs">{l.trim()}</Badge>
                    ))
                  : <span className="text-zinc-200">—</span>}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-zinc-500">{t('admin.psychologistDetail.experience')}</div>
              <div className="text-zinc-200">{p.experience_years ?? '—'}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">{t('admin.psychologistDetail.bio')}</div>
            <p className="text-zinc-300 leading-relaxed">{p.bio || '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Құжаттар */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            {t('admin.psychologistMgmt.verify.documentsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data.documents?.length ? (
            <p className="text-xs text-zinc-600 py-1">{t('admin.psychologistMgmt.verify.noDocuments')}</p>
          ) : (
            <ul className="space-y-2">
              {data.documents.map((doc) => (
                <li key={doc.id} className="rounded-md border border-zinc-800 bg-zinc-800/40 p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-200">
                      {t(`admin.psychologistMgmt.verify.docTypes.${doc.document_type}`)}
                      {doc.document_number && <span className="text-zinc-500 font-normal"> · {doc.document_number}</span>}
                    </div>
                    {doc.issuing_organization && <div className="text-xs text-zinc-500">{doc.issuing_organization}</div>}
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" />
                        {t('admin.psychologistMgmt.verify.openDoc')}
                      </a>
                    )}
                  </div>
                  <Badge variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'destructive' : 'secondary'} className="shrink-0">
                    {t(`admin.psychologistMgmt.verify.docStatuses.${doc.status}`)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Верификация тарихы */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-500" />
            {t('admin.psychologistDetail.history')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data.events?.length ? (
            <p className="text-xs text-zinc-600 py-1">{t('admin.psychologistDetail.noHistory')}</p>
          ) : (
            <ul className="space-y-3">
              {data.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-zinc-100">
                      {t(`admin.psychologistDetail.events.${e.event_type}`)}
                    </div>
                    {(e.from_status || e.to_status) && (
                      <div className="text-xs text-zinc-400">
                        {e.from_status && (
                          <>{t(`admin.psychologistMgmt.verify.statuses.${e.from_status}`)} → </>
                        )}
                        <span className="text-zinc-200">
                          {t(`admin.psychologistMgmt.verify.statuses.${e.to_status}`)}
                        </span>
                      </div>
                    )}
                    {e.reason && <div className="text-xs text-zinc-500">{e.reason}</div>}
                    <div className="text-[11px] text-zinc-600 mt-0.5">
                      {fmtDate(e.created_at)}{e.actor_name ? ` · ${e.actor_name}` : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
