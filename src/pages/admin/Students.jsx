import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const RISK_CONFIG = {
  low: { label: 'Низкий', variant: 'success' },
  moderate: { label: 'Умеренный', variant: 'warning' },
  high: { label: 'Высокий', variant: 'destructive' },
};

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

const PAGE_SIZE = 25;

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [faculty, setFaculty] = useState('');
  const [risk, setRisk] = useState('');

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

  useEffect(() => {
    setPage(1);
  }, [search, faculty, risk]);

  useEffect(() => {
    const t = setTimeout(loadStudents, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadStudents]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Студенты</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {loading ? 'Загрузка...' : `${total} студентов`}
        </p>
      </div>

      {/* Filters */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <Input
                placeholder="Имя или email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={faculty} onValueChange={setFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="Все факультеты" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все факультеты</SelectItem>
                {faculties.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={risk} onValueChange={setRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Все риски" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все уровни риска</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="moderate">Умеренный</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-600">Нет студентов по заданным фильтрам</p>
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Студент</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Факультет</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden md:table-cell">Чек-инов</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden lg:table-cell">Стресс / Настроение</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden md:table-cell">Сессий</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Риск</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide hidden lg:table-cell">Последний чек-ин</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const risk = RISK_CONFIG[s.last_risk];
                  const days = daysSince(s.last_checkin);
                  const initials = s.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    >
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
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-sm text-zinc-300">{s.faculty || '—'}</div>
                        {s.course && <div className="text-xs text-zinc-600">{s.course} курс</div>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-zinc-300">{s.checkin_count}</span>
                      </td>
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
                      <td className="px-4 py-3">
                        {risk ? (
                          <Badge variant={risk.variant}>{risk.label}</Badge>
                        ) : (
                          <span className="text-xs text-zinc-600">Нет данных</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {days === null ? (
                          <span className="text-xs text-zinc-600">Нет чек-инов</span>
                        ) : days === 0 ? (
                          <span className="text-xs text-zinc-400">Сегодня</span>
                        ) : (
                          <span className={cn('text-xs', days >= 7 ? 'text-zinc-600' : 'text-zinc-400')}>
                            {days} дн. назад
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-zinc-500">
            Показано {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} из {total}
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
