import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UniversityDashboard from './pages/UniversityDashboard';
import StudentPortal from './pages/StudentPortal';
import VerifierPortal from './pages/VerifierPortal';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import './index.css';

function App() {
  const { restoreAuth } = useAuthStore();

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/university-dashboard"
          element={
            <ProtectedRoute requiredRole="UNIVERSITY_ISSUER">
              <Layout>
                <UniversityDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-portal"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <Layout>
                <StudentPortal />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/verifier-portal"
          element={
            <ProtectedRoute requiredRole="VERIFIER">
              <Layout>
                <VerifierPortal />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
