import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navConfig = {
  student: [
    { to: '/student/dashboard', icon: BarChart2, label: 'Мой статус' },
    { to: '/student/checkin', icon: CheckSquare, label: 'Чек-ин' },
    { to: '/student/screening', icon: Brain, label: 'Скрининг' },
    { to: '/student/chat', icon: MessageSquare, label: 'ИИ-помощник' },
    { to: '/student/psychologists', icon: Users, label: 'Психологи' },
    { to: '/student/appointments', icon: CalendarDays, label: 'Мои записи' },
    { to: '/student/profile', icon: UserCircle, label: 'Мой профиль' },
  ],
  psychologist: [
    { to: '/psychologist/schedule', icon: ClipboardList, label: 'Расписание' },
    { to: '/psychologist/stats', icon: TrendingUp, label: 'Статистика' },
    { to: '/psychologist/profile', icon: UserCircle, label: 'Мой профиль' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/admin/students', icon: Users, label: 'Студенты' },
    { to: '/admin/psychologists', icon: UserCircle, label: 'Психологи' },
    { to: '/admin/slots', icon: Settings, label: 'Расписание' },
  ],
};

const roleLabels = {
  student: 'Студент',
  psychologist: 'Психолог',
  admin: 'Администратор',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  const navItems = navConfig[user?.role] || [];
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 h-14 flex items-center gap-3 border-b border-zinc-800 shrink-0">
        <div className="w-7 h-7 rounded-md bg-zinc-50 flex items-center justify-center shrink-0">
          <BrainCircuit className="w-4 h-4 text-zinc-900" />
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-50 leading-none">MindSpace</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Поддержка студентов</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Навигация
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

      {/* User footer */}
      <div className="px-3 py-3 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-zinc-800/50">
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-zinc-200 truncate">
              {user?.name || 'Пользователь'}
            </div>
            <div className="text-[10px] text-zinc-500">{roleLabels[user?.role]}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors shrink-0"
            title="Выйти"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Mobile top bar */}
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar drawer */}
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

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 w-[248px] h-screen bg-zinc-900 border-r border-zinc-800 flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-[248px] min-h-screen pt-14 lg:pt-0">
        <div className="max-w-[1200px] p-5 lg:p-8 fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
