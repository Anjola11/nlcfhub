import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import AdminShell from './components/layout/AdminShell';

import MemberRegistrationPage from './pages/MemberRegistrationPage';
import MemberLoginPage from './pages/MemberLoginPage';
import MemberProfilePage from './pages/MemberProfilePage';
import MemberPendingPage from './pages/MemberPendingPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMembersPage from './pages/AdminMembersPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminNotificationLogPage from './pages/AdminNotificationLogPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<MemberRegistrationPage />} />
          <Route path="/login" element={<MemberLoginPage />} />
          <Route path="/profile" element={<MemberProfilePage />} />
          <Route path="/pending" element={<MemberPendingPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/console-7x/login" element={<AdminLoginPage />} />
          
          <Route path="/console-7x" element={<AdminShell />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="members" element={<AdminMembersPage />} />
            <Route path="approvals" element={<AdminApprovalsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="log" element={<AdminNotificationLogPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
