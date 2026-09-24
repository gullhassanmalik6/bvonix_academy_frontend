import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRegister from './pages/admin/AdminRegister';
import StudentLMS from './pages/StudentLMS';
import CourseLMSDetail from './pages/CourseLMSDetail';
import Settings from './pages/Settings';
import { AboutPage, ContactPage, PrivacyPolicyPage, TermsPage, CookiePolicyPage } from './pages/StaticPages';
import CardPrintPreview from './pages/CardPrintPreview';
import VerifyCard from './pages/VerifyCard';

function App() {
  return (
    <AuthProvider>
      <BreadcrumbProvider>
        <ToastProvider>
          <Router>
        <Routes>
          {/* Routes with Layout (Header/Footer) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/verify/:cardNumber" element={<VerifyCard />} />
          </Route>

          <Route
            path="/card-preview/:enrollmentId"
            element={
              <ProtectedRoute>
                <CardPrintPreview />
              </ProtectedRoute>
            }
          />

          {/* Dashboard routes with sidebar layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/lms"
            element={
              <ProtectedRoute>
                <StudentLMS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lms/course/:id"
            element={
              <ProtectedRoute>
                <CourseLMSDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
        </ToastProvider>
      </BreadcrumbProvider>
    </AuthProvider>
  );
}

export default App;
