import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navConfig = {
  student: [
    { to: '/student/dashboard', icon: '📊', label: 'Мой статус' },
    { to: '/student/checkin', icon: '✅', label: 'Чек-ин' },
    { to: '/student/screening', icon: '🧠', label: 'Скрининг' },
    { to: '/student/chat', icon: '💬', label: 'ИИ-помощник' },
    { to: '/student/psychologists', icon: '👨‍⚕️', label: 'Психологи' },
    { to: '/student/appointments', icon: '📅', label: 'Мои записи' },
  ],
  psychologist: [
    { to: '/psychologist/schedule', icon: '📋', label: 'Расписание' },
    { to: '/psychologist/stats', icon: '📈', label: 'Статистика' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: '🏛️', label: 'Дашборд' },
    { to: '/admin/psychologists', icon: '👨‍⚕️', label: 'Психологи' },
    { to: '/admin/slots', icon: '🗓️', label: 'Расписание' },
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

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItems = navConfig[user?.role] || [];
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div>
            <div className="sidebar-logo-text">MindSpace</div>
            <div className="sidebar-logo-sub" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Психологическая поддержка</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Навигация</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Пользователь'}</div>
              <div className="sidebar-user-role">{roleLabels[user?.role]}</div>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout} title="Выйти">⏏</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
