import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/components/landing/LandingPage";
import LoginPage from "@/components/auth/LoginPage";
import RegisterPage from "@/components/auth/RegisterPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TeacherLayout from "@/components/teacher/TeacherLayout";
import TeacherDashboard from "@/components/teacher/TeacherDashboard";
import { CreateExam, ExamDetails } from "@/components/teacher/exams";

import {
  QuestionsList,
  CreateQuestion,
  EditQuestion,
} from "@/components/teacher/questions";
import { ExamsList } from "@/components/teacher/exams";

// Placeholder components
const StudentDashboard = () => (
  <div className="flex items-center justify-center min-h-screen text-2xl">
    Student Dashboard (Coming Soon)
  </div>
);
const AdminDashboard = () => (
  <div className="flex items-center justify-center min-h-screen text-2xl">
    Admin Dashboard (Coming Soon)
  </div>
);
const Unauthorized = () => (
  <div className="flex items-center justify-center min-h-screen text-2xl text-red-500">
    Unauthorized Access
  </div>
);

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
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Teacher */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="questions" element={<QuestionsList />} />
            <Route path="questions/create" element={<CreateQuestion />} />
            <Route path="questions/edit/:id" element={<EditQuestion />} />
            <Route path="exams" element={<ExamsList />} />
            <Route path="exams" element={<ExamsList />} />
            <Route path="exams/create" element={<CreateExam />} />
            <Route path="exams" element={<ExamsList />} />
            <Route path="exams/create" element={<CreateExam />} />
            <Route path="exams/:id" element={<ExamDetails />} />
            {/* We'll add more routes here */}
          </Route>

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
