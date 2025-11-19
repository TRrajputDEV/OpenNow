import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import LandingPage from '@/components/landing/LandingPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Placeholder components (we'll build these next)
const LoginPage = () => <div className="flex items-center justify-center min-h-screen text-2xl">Login Page (Coming Soon)</div>;
const RegisterPage = () => <div className="flex items-center justify-center min-h-screen text-2xl">Register Page (Coming Soon)</div>;
const StudentDashboard = () => <div className="flex items-center justify-center min-h-screen text-2xl">Student Dashboard (Coming Soon)</div>;
const TeacherDashboard = () => <div className="flex items-center justify-center min-h-screen text-2xl">Teacher Dashboard (Coming Soon)</div>;
const AdminDashboard = () => <div className="flex items-center justify-center min-h-screen text-2xl">Admin Dashboard (Coming Soon)</div>;
const Unauthorized = () => <div className="flex items-center justify-center min-h-screen text-2xl text-red-500">Unauthorized Access</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Student */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Teacher */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
