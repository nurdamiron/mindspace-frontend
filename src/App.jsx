import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import CheckIn from './pages/student/CheckIn';
import Screening from './pages/student/Screening';
import AIChat from './pages/student/AIChat';
import Psychologists from './pages/student/Psychologists';
import Appointments from './pages/student/Appointments';

// Psychologist pages
import PsychSchedule from './pages/psychologist/Schedule';
import StudentCard from './pages/psychologist/StudentCard';
import PsychStats from './pages/psychologist/Stats';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import PsychologistManagement from './pages/admin/PsychologistManagement';
import SlotManagement from './pages/admin/SlotManagement';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-center">
      <div className="spinner"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'psychologist') return <Navigate to="/psychologist/schedule" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student */}
          <Route path="/student" element={
            <ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="screening" element={<Screening />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="psychologists" element={<Psychologists />} />
            <Route path="appointments" element={<Appointments />} />
          </Route>

          {/* Psychologist */}
          <Route path="/psychologist" element={
            <ProtectedRoute roles={['psychologist']}><Layout /></ProtectedRoute>
          }>
            <Route path="schedule" element={<PsychSchedule />} />
            <Route path="students/:id" element={<StudentCard />} />
            <Route path="stats" element={<PsychStats />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="psychologists" element={<PsychologistManagement />} />
            <Route path="slots" element={<SlotManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
