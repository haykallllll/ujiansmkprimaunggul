import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Toaster } from '@/components/ui/toaster';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import ExamPage from '@/pages/ExamPage';
import ResultPage from '@/pages/ResultPage';

// Admin Pages
import QuestionManagement from '@/pages/admin/QuestionManagement';
import UserManagement from '@/pages/admin/UserManagement';
import AdminResults from '@/pages/admin/AdminResults';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected App Routes */}
          <Route path="/app" element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            <Route path="exam" element={<ExamPage />} />
            <Route path="result" element={<ResultPage />} />
            
            {/* Admin Only Routes */}
            <Route path="admin/questions" element={
              <AuthGuard allowedRoles={['admin']}>
                <QuestionManagement />
              </AuthGuard>
            } />
            <Route path="admin/users" element={
              <AuthGuard allowedRoles={['admin']}>
                <UserManagement />
              </AuthGuard>
            } />
            <Route path="admin/results" element={
              <AuthGuard allowedRoles={['admin']}>
                <AdminResults />
              </AuthGuard>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
