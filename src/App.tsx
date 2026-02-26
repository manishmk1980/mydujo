/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import GradingRoadmap from './pages/GradingRoadmap';
import GradingRequirements from './pages/GradingRequirements';
import PaymentHistory from './pages/PaymentHistory';
import Checkout from './pages/Checkout';
import Registration from './pages/Registration';
import InstructorQueue from './pages/InstructorQueue';
import LoginPage from './pages/LoginPage';
import Instructors from './pages/Instructors';
import AttendancePage from './pages/Attendance';
import Profile from './pages/Profile';
import SpecializedPrograms from './pages/SpecializedPrograms';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AttendanceProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/instructors" element={<Instructors />} />
              <Route path="/programs" element={<SpecializedPrograms />} />

              {/* Protected Student Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/grading" element={<ProtectedRoute><GradingRoadmap /></ProtectedRoute>} />
              <Route path="/grading/requirements" element={<ProtectedRoute><GradingRequirements /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Instructor Routes (Protected) */}
              <Route path="/instructor/queue" element={<ProtectedRoute><InstructorQueue /></ProtectedRoute>} />
              <Route path="/instructor/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AttendanceProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
