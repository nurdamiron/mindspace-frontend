// useState, useEffect — компонент күйі мен жанама әсерлер үшін
import { useState, useEffect } from 'react';
// Link — ішкі сілтемелер үшін
import { Link } from 'react-router-dom';
// Lucide иконалары — пайдаланушылар, іздеу
import { Users, Search } from 'lucide-react';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../../api/client';
// shadcn/ui компоненттері — карта, белгі, енгізу, скелет
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

// RISK_CONFIG — тәуекел деңгейлері белгілерінің варианттары
const RISK_CONFIG = {
  low: { variant: 'success' },
  moderate: { variant: 'warning' },
  high: { variant: 'destructive' },
};

// PsychStudents — психологтің студенттер тізімі беті
export default function PsychStudents() {
  const { t, i18n } = useTranslation();
  // students — студенттер тізімі
  const [students, setStudents] = useState([]);
  // loading — деректер жүктелу күйі
  const [loading, setLoading] = useState(true);
  // search — іздеу жолы
  const [search, setSearch] = useState('');

  // Студенттерді API-дан жүктеу
  useEffect(() => {
    api.get('/psychologist/students').then(setStudents).finally(() => setLoading(false));
  }, []);

  // filtered — факультет немесе идентификатор бойынша іздеу сүзгісі
  const filtered = students.filter((s) =>
    !search ||
    s.faculty?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  );

  return (
    <div className="fade-in space-y-5">
      {/* Тақырып және іздеу өрісі */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{t('psychologist.students.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t('psychologist.students.subtitle')}</p>
        </div>
        <div className="relative w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            className="pl-9"
            placeholder={t('psychologist.students.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Жүктелу, бос күй немесе студент тізімі */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : filtered.length === 0 ? (
        // Іздеу нәтижесі немесе тізім бос кезіндегі күй
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="font-medium text-zinc-300">{t('psychologist.students.empty')}</p>
        </div>
      ) : (
        // Студенттер тізімі
        <div className="space-y-2.5">
          {filtered.map((s) => {
            const risk = RISK_CONFIG[s.latest_risk];
            return (
              // Студент картасына сілтеме
              <Link key={s.id} to={`/psychologist/students/${s.id}`}>
                <Card className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Студент аватары (идентификатор) */}
                    <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-semibold text-zinc-300 shrink-0">
                      #{s.id}
                    </div>
                    {/* Студент аты және қосымша мәліметтер */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-zinc-100">{s.name || `${t('psychologist.studentCard.title')} #${s.id}`}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 flex flex-wrap gap-1.5">
                        {s.faculty && <span>{s.faculty}</span>}
                        {s.course && <><span>·</span><span>{s.course} {t('common.course')}</span></>}
                        {s.gender && <><span>·</span><span>{s.gender === 'male' ? t('common.male') : t('common.female')}</span></>}
                      </div>
                    </div>
                    {/* Сеанс санауыштары және тәуекел белгісі */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-zinc-500">{t('psychologist.students.sessions')}</div>
                        <div className="text-sm font-semibold text-zinc-200">{s.completed_sessions}/{s.total_sessions}</div>
                      </div>
                      {s.last_session && (
                        <div className="text-right hidden md:block">
                          <div className="text-xs text-zinc-500">{t('psychologist.students.lastSession')}</div>
                          <div className="text-xs text-zinc-400">
                            {new Date(s.last_session).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      )}
                      {/* Тәуекел деңгейі белгісі */}
                      {risk ? (
                        <Badge variant={risk.variant}>{t(`risk.${s.latest_risk}`)}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('risk.unknown')}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
