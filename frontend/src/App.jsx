import { BrowserRouter, Routes, Route } from "react-router-dom";

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

import IIYear from "./compnents/IIYear";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Hero />} />

        {/* HOD ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* FACULTY ROUTES */}
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/faculty/register" element={<Facultyregister />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />

        {/* STUDENT ROUTES */}
        <Route path="/student" element={<Student />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* ✅ PASSWORD RESET ROUTES (FIXED) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* MATERIALS */}
        <Route path="/iiyear" element={<IIYear />} />

        {/* FALLBACK */}
        <Route path="*" element={<h1>404 Page</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;