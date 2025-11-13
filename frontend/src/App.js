import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminInstitutions from './pages/admin/Institutions';
import AdminFaculties from './pages/admin/Faculties';
import AdminCourses from './pages/admin/Courses';
import AdminLinkInstitute from './pages/admin/LinkInstitute';
import AdminCompanies from './pages/admin/Companies';
import AdminReports from './pages/admin/Reports';

// Institute Pages
import InstituteDashboard from './pages/institute/Dashboard';
import InstituteFaculties from './pages/institute/Faculties';
import InstituteCourses from './pages/institute/Courses';
import InstituteApplications from './pages/institute/Applications';
import InstituteProfile from './pages/institute/Profile';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentHEISResults from './pages/student/HEISResults';
import StudentApplications from './pages/student/Applications';
import StudentJobs from './pages/student/Jobs';
import StudentProfile from './pages/student/Profile';
import StudentTranscript from './pages/student/Transcript';

// Company Pages
import CompanyDashboard from './pages/company/Dashboard';
import CompanyJobs from './pages/company/Jobs';
import CompanyApplicants from './pages/company/Applicants';
import CompanyProfile from './pages/company/Profile';

// Public Pages
import LandingPage from './pages/public/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/institutions" element={<PrivateRoute role="admin"><AdminInstitutions /></PrivateRoute>} />
            <Route path="/admin/faculties" element={<PrivateRoute role="admin"><AdminFaculties /></PrivateRoute>} />
            <Route path="/admin/courses" element={<PrivateRoute role="admin"><AdminCourses /></PrivateRoute>} />
            <Route path="/admin/link-institute" element={<PrivateRoute role="admin"><AdminLinkInstitute /></PrivateRoute>} />
            <Route path="/admin/companies" element={<PrivateRoute role="admin"><AdminCompanies /></PrivateRoute>} />
            <Route path="/admin/reports" element={<PrivateRoute role="admin"><AdminReports /></PrivateRoute>} />
            
            {/* Institute Routes */}
            <Route path="/institute" element={<PrivateRoute role="institute"><InstituteDashboard /></PrivateRoute>} />
            <Route path="/institute/faculties" element={<PrivateRoute role="institute"><InstituteFaculties /></PrivateRoute>} />
            <Route path="/institute/courses" element={<PrivateRoute role="institute"><InstituteCourses /></PrivateRoute>} />
            <Route path="/institute/applications" element={<PrivateRoute role="institute"><InstituteApplications /></PrivateRoute>} />
            <Route path="/institute/profile" element={<PrivateRoute role="institute"><InstituteProfile /></PrivateRoute>} />
            
            {/* Student Routes */}
            <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
            <Route path="/student/heis-results" element={<PrivateRoute role="student"><StudentHEISResults /></PrivateRoute>} />
            <Route path="/student/applications" element={<PrivateRoute role="student"><StudentApplications /></PrivateRoute>} />
            <Route path="/student/jobs" element={<PrivateRoute role="student"><StudentJobs /></PrivateRoute>} />
            <Route path="/student/profile" element={<PrivateRoute role="student"><StudentProfile /></PrivateRoute>} />
            <Route path="/student/transcript" element={<PrivateRoute role="student"><StudentTranscript /></PrivateRoute>} />
            
            {/* Company Routes */}
            <Route path="/company" element={<PrivateRoute role="company"><CompanyDashboard /></PrivateRoute>} />
            <Route path="/company/jobs" element={<PrivateRoute role="company"><CompanyJobs /></PrivateRoute>} />
            <Route path="/company/applicants/:jobId" element={<PrivateRoute role="company"><CompanyApplicants /></PrivateRoute>} />
            <Route path="/company/profile" element={<PrivateRoute role="company"><CompanyProfile /></PrivateRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

