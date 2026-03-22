// useState — мобильді мәзір күйін басқару үшін
import { useState } from 'react';
// Outlet, NavLink, useNavigate — маршруттау және навигация үшін
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// Lucide иконалары — навигация элементтері үшін иконалар
import {
  BarChart2,
  CheckSquare,
  Brain,
  MessageSquare,
  Users,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  Settings,
  LogOut,
  BrainCircuit,
  LayoutDashboard,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';
// useTranslation — аударма хуктары
import { useTranslation } from 'react-i18next';
// useAuth — пайдаланушы және logout функциясы үшін
import { useAuth } from '../context/AuthContext';
// Separator — бөлгіш сызық компоненті
import { Separator } from '@/components/ui/separator';
// cn — шартты CSS класстарды біріктіру утилитасы
import { cn } from '@/lib/utils';

// Layout — барлық рөлдерге ортақ бүйірлік панель орналасуы
export default function Layout() {
  // Аударма және аутентификация контекстін алу
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // mobileOpen — мобильді мәзірдің ашық/жабық күйі
  const [mobileOpen, setMobileOpen] = useState(false);

  // navConfig — әр рөлге арналған навигация элементтері
  const navConfig = {
    student: [
      { to: '/student/dashboard', icon: BarChart2, label: t('nav.student.dashboard') },
      { to: '/student/checkin', icon: CheckSquare, label: t('nav.student.checkIn') },
      { to: '/student/screening', icon: Brain, label: t('nav.student.screening') },
      { to: '/student/chat', icon: MessageSquare, label: t('nav.student.aiChat') },
      { to: '/student/psychologists', icon: Users, label: t('nav.student.psychologists') },
      { to: '/student/appointments', icon: CalendarDays, label: t('nav.student.appointments') },
      { to: '/student/profile', icon: UserCircle, label: t('nav.student.profile') },
    ],
    psychologist: [
      { to: '/psychologist/schedule', icon: ClipboardList, label: t('nav.psychologist.schedule') },
      { to: '/psychologist/students', icon: Users, label: t('nav.psychologist.students') },
      { to: '/psychologist/slots', icon: CalendarDays, label: t('nav.psychologist.slots') },
      { to: '/psychologist/stats', icon: TrendingUp, label: t('nav.psychologist.stats') },
      { to: '/psychologist/profile', icon: UserCircle, label: t('nav.psychologist.profile') },
    ],
    admin: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: t('nav.admin.dashboard') },
      { to: '/admin/students', icon: Users, label: t('nav.admin.students') },
      { to: '/admin/psychologists', icon: UserCircle, label: t('nav.admin.psychologists') },
      { to: '/admin/slots', icon: Settings, label: t('nav.admin.slots') },
    ],
  };

  // roleLabels — рөл атауларының аудармалары
  const roleLabels = {
    student: t('nav.roles.student'),
    psychologist: t('nav.roles.psychologist'),
    admin: t('nav.roles.admin'),
  };

  // handleLogout — жүйеден шығу және логин бетіне бағыттау
  function handleLogout() {
    logout();
    navigate('/login');
  }

  // closeMobile — мобильді мәзірді жабу
  function closeMobile() {
    setMobileOpen(false);
  }

  // navItems — ағымдағы рөлге сәйкес навигация элементтерін алу
  const navItems = navConfig[user?.role] || [];
  // initials — пайдаланушы атының бас әріптерін алу
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  // SidebarContent — бүйірлік панельдің ішкі мазмұны: лого, навигация, тіл, пайдаланушы
  const SidebarContent = () => (
    <>
      {/* Логотип блогы */}
      <div className="px-5 h-14 flex items-center gap-3 border-b border-zinc-800 shrink-0">
        <div className="w-7 h-7 rounded-md bg-zinc-50 flex items-center justify-center shrink-0">
          <BrainCircuit className="w-4 h-4 text-zinc-900" />
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-50 leading-none">MindSpace</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {t('layout.tagline')}
          </div>
        </div>
      </div>

      {/* Навигация сілтемелері */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          {t('common.navigation')}
        </p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group',
                    isActive
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive ? 'text-zinc-50' : 'text-zinc-500 group-hover:text-zinc-300'
                      )}
                    />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Тіл ауыстырғыш блогы */}
      <div className="px-4 py-2.5 border-t border-zinc-800 shrink-0 flex items-center gap-1">
        <button
          onClick={() => i18n.changeLanguage('ru')}
          className={cn(
            'flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors',
            i18n.language === 'ru'
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50'
          )}
        >
          {t('lang.ru')}
        </button>
        <div className="w-px h-4 bg-zinc-700" />
        <button
          onClick={() => i18n.changeLanguage('kk')}
          className={cn(
            'flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors',
            i18n.language === 'kk'
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50'
          )}
        >
          {t('lang.kk')}
        </button>
      </div>

      {/* Пайдаланушы ақпараты және шығу түймесі */}
      <div className="px-3 py-3 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-zinc-800/50">
          {/* Пайдаланушы аватары */}
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-zinc-200 truncate">
              {user?.name || t('common.user')}
            </div>
            <div className="text-[10px] text-zinc-500">{roleLabels[user?.role]}</div>
          </div>
          {/* Жүйеден шығу батырмасы */}
          <button
            onClick={handleLogout}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors shrink-0"
            title={t('nav.logout')}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Мобильді жоғарғы панель */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-50 flex items-center justify-center">
            <BrainCircuit className="w-3.5 h-3.5 text-zinc-900" />
          </div>
          <span className="text-sm font-semibold text-zinc-50">MindSpace</span>
        </div>
      </div>

      {/* Мобильді фондық қабат — жабу үшін басу */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={closeMobile}
        />
      )}

      {/* Мобильді сырғымалы бүйірлік панель */}
      <aside className={cn(
        'lg:hidden fixed top-0 left-0 z-50 w-[248px] h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <button
          onClick={closeMobile}
          className="absolute top-3.5 right-3 p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Десктоп тұрақты бүйірлік панель */}
      <aside className="hidden lg:flex fixed top-0 left-0 w-[248px] h-screen bg-zinc-900 border-r border-zinc-800 flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Негізгі мазмұн аймағы */}
      <main className="flex-1 lg:ml-[248px] min-h-screen pt-14 lg:pt-0">
        <div className="max-w-[1200px] p-5 lg:p-8 fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
