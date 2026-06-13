/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicThemeProvider } from './context/PublicThemeContext';
import LandingPage from './pages/LandingPage';
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import AcademyPage from "./pages/public/AcademyPage";
import DisciplinesPage from "./pages/public/DisciplinesPage";
import PublicInstructorsPage from "./pages/public/PublicInstructorsPage";
import EventsPage from "./pages/public/EventsPage";
import JoinMyDojoPage from "./pages/public/JoinMyDojoPage";
import Dashboard from './pages/Dashboard';
import GradingRoadmap from './pages/GradingRoadmap';
import GradingRequirements from './pages/GradingRequirements';
import PaymentHistory from './pages/PaymentHistory';
import MyFees from './pages/MyFees';
import SubmitPayment from './pages/SubmitPayment';
import Notifications from './pages/Notifications';
import Checkout from './pages/Checkout';
import Registration from './pages/Registration';
import InstructorQueue from './pages/InstructorQueue';
import LoginPage from './pages/LoginPage';
import Instructors from './pages/Instructors';
import About from './pages/About';
import Programs from './pages/Programs';
import Events from './pages/Events';
import Contact from './pages/Contact';
import AttendancePage from './pages/Attendance';
import StudentAttendance from './pages/StudentAttendance';
import Profile from './pages/Profile';
import SpecializedPrograms from './pages/SpecializedPrograms';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StudentProtectedRoute } from './components/student/StudentProtectedRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { FlashToastProvider } from './components/ui/FlashToast';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTrainingCenters from './pages/admin/AdminTrainingCenters';
import AdminInstructors from './pages/admin/AdminInstructors';
import AdminDisciplines from './pages/admin/AdminDisciplines';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import AdminFeeRequests from './pages/admin/AdminFeeRequests';
import AdminPaymentReview from './pages/admin/AdminPaymentReview';
import AdminInstructorApplications from './pages/admin/AdminInstructorApplications';
import AdminChat from './pages/admin/AdminChat';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import InstructorRegistrationPage from './pages/public/InstructorRegistrationPage';
import { Seo } from './components/Seo';

// Instructor Admin Panel
import { InstructorProtectedRoute } from './components/instructor/InstructorProtectedRoute';
import { InstructorLayout } from './layouts/InstructorLayout';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorStudents from './pages/instructor/InstructorStudents';
import InstructorAttendance from './pages/instructor/InstructorAttendance';
import InstructorGrading from './pages/instructor/InstructorGrading';
import InstructorProfile from './pages/instructor/InstructorProfile';
import InstructorLoginPage from './pages/instructor/InstructorLoginPage';
import StudentLoginPage from './pages/student/StudentLoginPage';

const routerBaseName = '/';

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <LanguageProvider>
          <FlashToastProvider>
            <AttendanceProvider>
              <Router basename={routerBaseName}>
                <Seo />
                <PublicThemeProvider>
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminProtectedRoute>
                        <SuperAdminLayout />
                      </AdminProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="students" element={<AdminStudents />} />
                    <Route path="training-centers" element={<AdminTrainingCenters />} />
                    <Route path="instructors" element={<AdminInstructors />} />
                    <Route path="instructor-applications" element={<AdminInstructorApplications />} />
                    <Route path="disciplines" element={<AdminDisciplines />} />
                    <Route path="users" element={<AdminUsers />} />
                  <Route path="fees" element={<AdminFeeRequests />} />
                  <Route path="fee-requests" element={<AdminFeeRequests />} />
                  <Route path="payments" element={<AdminPaymentReview />} />
                  <Route path="payment-review" element={<AdminPaymentReview />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="chat" element={<AdminChat />} />
                  </Route>

                  {/* Public Auth Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/academy" element={<AcademyPage />} />
                  <Route path="/disciplines" element={<DisciplinesPage />} />
                  <Route path="/instructors" element={<PublicInstructorsPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/join-mydojo" element={<JoinMyDojoPage />} />
                  <Route path="/instructor/login" element={<InstructorLoginPage />} />
                  <Route path="/student/login" element={<StudentLoginPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register/student" element={<Registration />} />
                  <Route path="/register" element={<Navigate to="/register/student" replace />} />
                  <Route path="/register/instructor" element={<InstructorRegistrationPage />} />
                  <Route path="/instructor/register" element={<Navigate to="/register/instructor" replace />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected Student Routes */}
                  <Route element={<StudentProtectedRoute><StudentLayout /></StudentProtectedRoute>}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="grading" element={<GradingRoadmap />} />
                    <Route path="grading/requirements" element={<GradingRequirements />} />
                    <Route path="my-programs" element={<SpecializedPrograms />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="fees" element={<MyFees />} />
                  <Route path="fees/:feeRequestId/submit" element={<SubmitPayment />} />
                    <Route path="payments" element={<PaymentHistory />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="attendance" element={<StudentAttendance />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* Public Info Routes */}
                  <Route path="/about" element={<About />} />
                  <Route path="/programs" element={<Programs />} />
                  <Route path="/instructors" element={<Instructors />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Instructor Admin Panel Routes */}
                  <Route
                    path="/instructor"
                    element={
                      <InstructorProtectedRoute>
                        <InstructorLayout />
                      </InstructorProtectedRoute>
                    }
                  >
                    <Route index element={<InstructorDashboard />} />
                    <Route path="students" element={<InstructorStudents />} />
                    <Route path="attendance" element={<InstructorAttendance />} />
                    <Route path="grading" element={<InstructorGrading />} />
                    <Route path="profile" element={<InstructorProfile />} />
                  </Route>

                  {/* Legacy Instructor Routes */}
                  <Route path="/instructor/queue" element={<ProtectedRoute><InstructorQueue /></ProtectedRoute>} />
                  <Route path="/instructor/attendance-legacy" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PublicThemeProvider>
              </Router>
            </AttendanceProvider>
          </FlashToastProvider>
        </LanguageProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}



