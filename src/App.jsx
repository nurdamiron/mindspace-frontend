import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import CheckIn from './pages/student/CheckIn';
import Screening from './pages/student/Screening';
import AIChat from './pages/student/AIChat';
import Psychologists from './pages/student/Psychologists';
import Appointments from './pages/student/Appointments';
import Profile from './pages/student/Profile';

// Psychologist pages
import PsychSchedule from './pages/psychologist/Schedule';
import StudentCard from './pages/psychologist/StudentCard';
import PsychStats from './pages/psychologist/Stats';
import PsychProfile from './pages/psychologist/Profile';
import PsychStudents from './pages/psychologist/Students';
import PsychSlots from './pages/psychologist/Slots';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import PsychologistManagement from './pages/admin/PsychologistManagement';
import SlotManagement from './pages/admin/SlotManagement';
import AdminStudents from './pages/admin/Students';
import AdminStudentDetail from './pages/admin/StudentDetail';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Landing />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'psychologist') return <Navigate to="/psychologist/schedule" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
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
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student */}
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

          {/* Psychologist */}
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

          {/* Admin */}
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
