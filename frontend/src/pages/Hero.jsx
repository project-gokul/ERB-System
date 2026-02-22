import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  Sun,
  Moon,
  GraduationCap,
  Users,
  User
} from "lucide-react";

function Hero() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("");

  const handleNavigate = (role, path) => {
    setActive(role);
    navigate(path);
  };

  return (
    <div className={`container ${dark ? "dark" : ""}`}>

      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

        {/* Top Section */}
        <div className="top">
          <button
            className="icon-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar"
          >
            <Menu />
          </button>

          {!collapsed && <h2 className="logo">ERB System</h2>}
        </div>

        {/* Menu */}
        <nav>
          <button
            className={active === "HOD" ? "active" : ""}
            onClick={() => handleNavigate("HOD", "/login")}
          >
            <GraduationCap />
            {!collapsed && <span>HOD Login</span>}
          </button>

          <button
            className={active === "Faculty" ? "active" : ""}
            onClick={() => handleNavigate("Faculty", "/faculty/login")}
          >
            <Users />
            {!collapsed && <span>Faculty Login</span>}
          </button>

          <button
            className={active === "Student" ? "active" : ""}
            onClick={() => handleNavigate("Student", "/student/login")}
          >
            <User />
            {!collapsed && <span>Student Login</span>}
          </button>
        </nav>
      </aside>

      {/* ================= THEME TOGGLE ================= */}
      <button
        className="theme-toggle"
        onClick={() => setDark(!dark)}
        aria-label="Toggle Theme"
      >
        {dark ? <Sun /> : <Moon />}
      </button>

      {/* ================= HERO ================= */}
     <main className="hero">
  <div>
    <h1>Welcome to ERB Management System</h1>
    <p>
      A complete platform to manage students, faculty, and academic records efficiently.
    </p>
  </div>
</main>
    </div>
  );
}

export default Hero;