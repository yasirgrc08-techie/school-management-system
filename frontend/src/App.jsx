import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ClassesPage from './pages/ClassesPage';
import SubjectsPage from './pages/SubjectsPage';
import AttendancePage from './pages/AttendancePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Layout><UsersPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/classes" element={
        <ProtectedRoute>
          <Layout><ClassesPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/subjects" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Layout><SubjectsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute>
          <Layout><AttendancePage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
