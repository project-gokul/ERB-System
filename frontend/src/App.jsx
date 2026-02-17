import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageWrapper from "./components/PageWrapper";

/* PAGES */
import Hero from "./pages/Hero";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Student from "./pages/Student";

import Faculty from "./pages/Faculty";
import FacultyLogin from "./pages/FacultyLogin";
import Facultyregister from "./pages/Facultyregister";
import FacultyDashboard from "./pages/FacultyDashboard";

import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCertificates from "./pages/StudentCertificates";
import IIYear from "./components/IIYear";
import IIIYear from "./components/IIIYear";
import IVYear from "./components/IVYear";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FacultyVerify from "./pages/FacultyVerify";
import AdminCertificates from "./pages/AdminCertificates";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Hero /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />

        <Route path="/faculty" element={<PageWrapper><Faculty /></PageWrapper>} />
        <Route path="/faculty/login" element={<PageWrapper><FacultyLogin /></PageWrapper>} />
        <Route path="/faculty/register" element={<PageWrapper><Facultyregister /></PageWrapper>} />
        <Route path="/faculty/dashboard" element={<PageWrapper><FacultyDashboard /></PageWrapper>} />
        <Route path="/faculty/verify" element={<PageWrapper><FacultyVerify /></PageWrapper>} />

        <Route path="/student" element={<PageWrapper><Student /></PageWrapper>} />
        <Route path="/student/login" element={<PageWrapper><StudentLogin /></PageWrapper>} />
        <Route path="/student/register" element={<PageWrapper><StudentRegister /></PageWrapper>} />
        <Route path="/student/dashboard" element={<PageWrapper><StudentDashboard /></PageWrapper>} />
        <Route path="/student/certificates" element={<PageWrapper><StudentCertificates /></PageWrapper>} />

        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />

        <Route path="/iiyear" element={<PageWrapper><IIYear /></PageWrapper>} />
        <Route path="/iiiyear" element={<PageWrapper><IIIYear /></PageWrapper>} />
        <Route path="/ivyear" element={<PageWrapper><IVYear /></PageWrapper>} />
        <Route path="/admin/certificates" element={<PageWrapper><AdminCertificates /></PageWrapper>} />

        <Route path="*" element={<PageWrapper><h1>404 Page</h1></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;