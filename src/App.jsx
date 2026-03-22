// BrowserRouter, Routes, Route, Navigate — маршруттау компоненттері
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Toaster — хабарлама тостерін көрсету компоненті
import { Toaster } from 'sonner';
// AuthProvider, useAuth — аутентификация провайдері және хук
import { AuthProvider, useAuth } from './context/AuthContext';
// Layout — барлық рөлдерге ортақ бүйірлік панель орналасуы
import Layout from './components/Layout';
// Landing — басты бет компоненті
import Landing from './pages/Landing';
// Login — кіру беті
import Login from './pages/Login';
// Register — тіркелу беті
import Register from './pages/Register';
// NotFound — 404 қате беті
import NotFound from './pages/NotFound';

// StudentDashboard — студент бақылау тақтасы
import StudentDashboard from './pages/student/Dashboard';
// CheckIn — студенттің күнделікті чекин беті
import CheckIn from './pages/student/CheckIn';
// Screening — психологиялық скрининг беті
import Screening from './pages/student/Screening';
// AIChat — AI чат беті
import AIChat from './pages/student/AIChat';
// Psychologists — психологтар тізімі және жазылу беті
import Psychologists from './pages/student/Psychologists';
// Appointments — студенттің кездесулер тізімі
import Appointments from './pages/student/Appointments';
// Profile — студент профилі беті
import Profile from './pages/student/Profile';

// PsychSchedule — психологтің кесте беті
import PsychSchedule from './pages/psychologist/Schedule';
// StudentCard — психологтің студент картасы
import StudentCard from './pages/psychologist/StudentCard';
// PsychStats — психолог статистикасы беті
import PsychStats from './pages/psychologist/Stats';
// PsychProfile — психолог профилі беті
import PsychProfile from './pages/psychologist/Profile';
// PsychStudents — психологтің студенттер тізімі
import PsychStudents from './pages/psychologist/Students';
// PsychSlots — психологтің бос уақыт слоттары беті
import PsychSlots from './pages/psychologist/Slots';

// AdminDashboard — әкімші бақылау тақтасы
import AdminDashboard from './pages/admin/Dashboard';
// PsychologistManagement — психологтарды басқару беті
import PsychologistManagement from './pages/admin/PsychologistManagement';
// SlotManagement — слоттарды басқару беті
import SlotManagement from './pages/admin/SlotManagement';
// AdminStudents — әкімшінің студенттер тізімі
import AdminStudents from './pages/admin/Students';
// AdminStudentDetail — студенттің толық ақпарат беті
import AdminStudentDetail from './pages/admin/StudentDetail';

// ProtectedRoute — рөл негізінде маршруттарды қорғайтын компонент
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  // Жүктелу кезінде спиннер көрсету
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );
  // Кірмеген пайдаланушыны логинге бағыттау
  if (!user) return <Navigate to="/login" replace />;
  // Рөлі сәйкес келмесе басты бетке бағыттау
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// RootRedirect — пайдаланушы рөліне қарай бастапқы бетке бағыттайды
function RootRedirect() {
  const { user, loading } = useAuth();
  // Жүктелу кезінде спиннер
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );
  // Кірмеген пайдаланушыға Landing беті
  if (!user) return <Landing />;
  // Рөлге қарай бастапқы бетке бағыттау
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'psychologist') return <Navigate to="/psychologist/schedule" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

// App — қосымшаның тамырлық компоненті: маршруттар мен провайдерлер
export default function App() {
  return (
    <AuthProvider>
      {/* Toaster — жоғарғы оң жақта хабарлама тостерін орнату */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#fafafa',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Тамырлық бет — рөлге қарай бағыттайды */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Студент маршруттары — тек student рөлі үшін */}
          <Route path="/student" element={
            <ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="screening" element={<Screening />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="psychologists" element={<Psychologists />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Психолог маршруттары — тек psychologist рөлі үшін */}
          <Route path="/psychologist" element={
            <ProtectedRoute roles={['psychologist']}><Layout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="schedule" replace />} />
            <Route path="schedule" element={<PsychSchedule />} />
            <Route path="students/:id" element={<StudentCard />} />
            <Route path="stats" element={<PsychStats />} />
            <Route path="profile" element={<PsychProfile />} />
            <Route path="students" element={<PsychStudents />} />
            <Route path="slots" element={<PsychSlots />} />
          </Route>

          {/* Әкімші маршруттары — тек admin рөлі үшін */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="psychologists" element={<PsychologistManagement />} />
            <Route path="slots" element={<SlotManagement />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="students/:id" element={<AdminStudentDetail />} />
          </Route>

          {/* Барлық белгісіз маршруттар үшін 404 беті */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
