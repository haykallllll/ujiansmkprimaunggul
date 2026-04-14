import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from 'lucide-react';

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

function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as any}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
    />
  );
}

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
