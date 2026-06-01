// Маршруттау компоненттері
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Хабарлама тостері
import { Toaster } from 'sonner';
// Аутентификация провайдері мен хук
import { AuthProvider, useAuth } from './context/AuthContext';
// Ортақ бүйірлік панель орналасуы
import Layout from './components/Layout';
// Басты бет
import Landing from './pages/Landing';
// Кіру беті
import Login from './pages/Login';
// Тіркелу беті
import Register from './pages/Register';
// 404 қате беті
import NotFound from './pages/NotFound';

// Студент бақылау тақтасы
import StudentDashboard from './pages/student/Dashboard';
// Күнделікті чекин беті
import CheckIn from './pages/student/CheckIn';
// Психологиялық скрининг беті
import Screening from './pages/student/Screening';
// AI чат беті
import AIChat from './pages/student/AIChat';
// Психологтар тізімі мен жазылу беті
import Psychologists from './pages/student/Psychologists';
// Студенттің кездесулер тізімі
import Appointments from './pages/student/Appointments';
// Студент профилі
import Profile from './pages/student/Profile';

// Психолог кесте беті
import PsychSchedule from './pages/psychologist/Schedule';
// Студент картасы
import StudentCard from './pages/psychologist/StudentCard';
// Психолог статистикасы
import PsychStats from './pages/psychologist/Stats';
// Психолог профилі
import PsychProfile from './pages/psychologist/Profile';
// Психологтың студенттер тізімі
import PsychStudents from './pages/psychologist/Students';
// Бос уақыт слоттары беті
import PsychSlots from './pages/psychologist/Slots';

// Әкімші бақылау тақтасы
import AdminDashboard from './pages/admin/Dashboard';
// Психологтарды басқару беті
import PsychologistManagement from './pages/admin/PsychologistManagement';
// Психологтың толық ақпараты
import AdminPsychologistDetail from './pages/admin/PsychologistDetail';
// Слоттарды басқару беті
import SlotManagement from './pages/admin/SlotManagement';
// Әкімшінің студенттер тізімі
import AdminStudents from './pages/admin/Students';
// Студенттің толық ақпараты
import AdminStudentDetail from './pages/admin/StudentDetail';
// Шағымдарды басқару беті
import AdminComplaints from './pages/admin/Complaints';

// Рөл бойынша маршрут қорғанысы
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  // Жүктелу кезінде спиннер көрсету
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-6 h-6 border-2 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
    </div>
  );
  // Кірмеген пайдаланушыны логинге бағыттау
  if (!user) return <Navigate to="/login" replace />;
  // Рөлі сәйкес келмесе басты бетке бағыттау
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// Тек верификацияланған (active/probation) психологқа рұқсат, қалғаны профильге
function VerifiedPsychOnly({ children }) {
  const { user } = useAuth();
  const allowed = ['active', 'probation'].includes(user?.verification_status);
  if (!allowed) return <Navigate to="/psychologist/profile" replace />;
  return children;
}

// Рөлге қарай бастапқы бетке бағыттау
function RootRedirect() {
  const { user, loading } = useAuth();
  // Жүктелу спиннері
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-6 h-6 border-2 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
    </div>
  );
  // Кірмесе Landing беті
  if (!user) return <Landing />;
  // Рөлге қарай бағыттау
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'psychologist') return <Navigate to="/psychologist/schedule" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

// Қосымшаның тамырлық компоненті: маршруттар мен провайдерлер
export default function App() {
  return (
    <AuthProvider>
      {/* Хабарлама тостері (жоғарғы оң жақта) */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Тамырлық бет: рөлге қарай бағыттау */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Студент маршруттары */}
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

          {/* Психолог маршруттары */}
          <Route path="/psychologist" element={
            <ProtectedRoute roles={['psychologist']}><Layout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="schedule" replace />} />
            <Route path="schedule" element={<VerifiedPsychOnly><PsychSchedule /></VerifiedPsychOnly>} />
            <Route path="students/:id" element={<VerifiedPsychOnly><StudentCard /></VerifiedPsychOnly>} />
            <Route path="stats" element={<VerifiedPsychOnly><PsychStats /></VerifiedPsychOnly>} />
            <Route path="profile" element={<PsychProfile />} />
            <Route path="students" element={<VerifiedPsychOnly><PsychStudents /></VerifiedPsychOnly>} />
            <Route path="slots" element={<VerifiedPsychOnly><PsychSlots /></VerifiedPsychOnly>} />
          </Route>

          {/* Әкімші маршруттары */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="psychologists" element={<PsychologistManagement />} />
            <Route path="psychologists/:id" element={<AdminPsychologistDetail />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="slots" element={<SlotManagement />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="students/:id" element={<AdminStudentDetail />} />
          </Route>

          {/* Белгісіз маршруттар: 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
