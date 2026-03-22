// useState, useEffect, useCallback — күй, жанама әсерлер және мемоизацияланған функция үшін
import { useState, useEffect, useCallback } from 'react';
// useNavigate — бағдарламалық навигация үшін
import { useNavigate } from 'react-router-dom';
// Lucide иконалары — іздеу, пайдаланушылар, беттеу
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../../api/client';
// shadcn/ui компоненттері — белгі, батырма, карта, енгізу, тізім, скелет
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
// cn — шартты CSS класстарды біріктіру утилитасы
import { cn } from '@/lib/utils';

// daysSince — соңғы белсенділіктен өткен күн санын есептеу
function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

// PAGE_SIZE — бір беттегі студенттер саны
const PAGE_SIZE = 25;

// AdminStudents — әкімші студенттер тізімі беті
export default function AdminStudents() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // students — студенттер тізімі
  const [students, setStudents] = useState([]);
  // faculties — факультеттер тізімі
  const [faculties, setFaculties] = useState([]);
  // total — жалпы студент саны
  const [total, setTotal] = useState(0);
  // page — ағымдағы бет нөмірі
  const [page, setPage] = useState(1);
  // loading — деректер жүктелу күйі
  const [loading, setLoading] = useState(true);
  // search — іздеу жолы
  const [search, setSearch] = useState('');
  // faculty — таңдалған факультет сүзгісі
  const [faculty, setFaculty] = useState('');
  // risk — таңдалған тәуекел деңгейі сүзгісі
  const [risk, setRisk] = useState('');

  // RISK_CONFIG — тәуекел деңгейлерінің белгі конфигурациясы
  const RISK_CONFIG = {
    low: { label: t('risk.low'), variant: 'success' },
    moderate: { label: t('risk.moderate'), variant: 'warning' },
    high: { label: t('risk.high'), variant: 'destructive' },
  };

  // loadStudents — сүзгі параметрлері бойынша студенттер тізімін API-дан жүктеу
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (faculty) params.set('faculty', faculty);
      if (risk) params.set('risk', risk);
      params.set('page', page);
      params.set('limit', PAGE_SIZE);
      const res = await api.get(`/admin/students?${params}`);
      setStudents(res.students);
      setTotal(res.total);
      if (res.faculties.length > 0) setFaculties(res.faculties);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, faculty, risk, page]);

  // Сүзгі өзгергенде беттеуді бастапқыға қайтару
  useEffect(() => {
    setPage(1);
  }, [search, faculty, risk]);

  // Іздеу кезінде debounce қолданып жүктеу
  useEffect(() => {
    const timer = setTimeout(loadStudents, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  // totalPages — жалпы бет санын есептеу
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="fade-in space-y-5">
      {/* Тақырып және жалпы студент саны */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('admin.students.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {loading ? t('admin.students.loadingCount') : t('admin.students.count', { count: total })}
        </p>
      </div>

      {/* Іздеу, факультет және тәуекел сүзгілері */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <Input
                placeholder={t('admin.students.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Факультет бойынша сүзгі */}
            <Select value={faculty || 'all'} onValueChange={(v) => setFaculty(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.students.allFaculties')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.students.allFaculties')}</SelectItem>
                {faculties.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Тәуекел деңгейі бойынша сүзгі */}
            <Select value={risk || 'all'} onValueChange={(v) => setRisk(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.students.allRisks')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.students.allRisks')}</SelectItem>
                <SelectItem value="high">{t('risk.high')}</SelectItem>
                <SelectItem value="moderate">{t('risk.moderate')}</SelectItem>
                <SelectItem value="low">{t('risk.low')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Студенттер кестесі немесе бос күй */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-600">{t('admin.students.noStudents')}</p>
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">{t('admin.students.columns.student')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden sm:table-cell">{t('admin.students.columns.faculty')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden md:table-cell">{t('admin.students.columns.checkins')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden lg:table-cell">{t('admin.students.columns.stressMood')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden md:table-cell">{t('admin.students.columns.sessions')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">{t('admin.students.columns.risk')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden lg:table-cell">{t('admin.students.columns.lastCheckin')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const riskConfig = RISK_CONFIG[s.last_risk];
                  const days = daysSince(s.last_checkin);
                  // initials — студент атынан бастапқы әріптерді шығарып алу
                  const initials = s.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    >
                      {/* Аты және email бағаны */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-zinc-100 truncate">{s.name || '—'}</div>
                            <div className="text-xs text-zinc-500 truncate">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      {/* Факультет және курс */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-sm text-zinc-300">{s.faculty || '—'}</div>
                        {s.course && <div className="text-xs text-zinc-600">{s.course} {t('common.course')}</div>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-zinc-300">{s.checkin_count}</span>
                      </td>
                      {/* Стресс/көңіл-күй орташа мәндері */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {s.checkin_count > 0 ? (
                          <div className="text-sm text-zinc-300">
                            <span className={parseFloat(s.avg_stress) >= 4 ? 'text-red-400 font-medium' : ''}>
                              {s.avg_stress}
                            </span>
                            <span className="text-zinc-600 mx-1">/</span>
                            <span>{s.avg_mood}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-zinc-300">{s.session_count}</span>
                      </td>
                      {/* Тәуекел белгісі */}
                      <td className="px-4 py-3">
                        {riskConfig ? (
                          <Badge variant={riskConfig.variant}>{riskConfig.label}</Badge>
                        ) : (
                          <span className="text-xs text-zinc-600">{t('risk.unknown')}</span>
                        )}
                      </td>
                      {/* Соңғы чекин уақыты */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {days === null ? (
                          <span className="text-xs text-zinc-600">{t('admin.students.noCheckins')}</span>
                        ) : days === 0 ? (
                          <span className="text-xs text-zinc-400">{t('admin.students.today')}</span>
                        ) : (
                          <span className={cn('text-xs', days >= 7 ? 'text-zinc-600' : 'text-zinc-400')}>
                            {t('common.daysAgo_one', { count: days })}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Беттеу навигациясы */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-zinc-500">
            {t('admin.students.pagination', { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, total), total })}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-zinc-400 px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
