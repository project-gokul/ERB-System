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
  const [active, setActive] = useState("HOD");

  return (
    <div className={`container ${dark ? "dark" : ""}`}>

      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

        {/* Top Section */}
        <div className="top">
          <button className="icon-btn" onClick={() => setCollapsed(!collapsed)}>
            <Menu />
          </button>

          {!collapsed && <h2 className="logo">ERB System</h2>}
        </div>

        {/* Menu */}
        <nav>
          <button
            className={active === "HOD" ? "active" : ""}
            onClick={() => {
              setActive("HOD");
              navigate("/Login");
            }}
          >
            <GraduationCap />
            {!collapsed && <span>HOD Login</span>}
          </button>

          <button
            className={active === "Faculty" ? "active" : ""}
            onClick={() => {
              setActive("Faculty");
              navigate("/faculty/login");
            }}
          >
            <Users />
            {!collapsed && <span>Faculty Login</span>}
          </button>

          <button
            className={active === "Student" ? "active" : ""}
            onClick={() => {
              setActive("Student");
              navigate("/student/login");
            }}
          >
            <User />
            {!collapsed && <span>Student Login</span>}
          </button>
        </nav>
      </aside>

      {/* ================= TOP RIGHT THEME TOGGLE ================= */}
      <button
        className="theme-toggle"
        onClick={() => setDark(!dark)}
        aria-label="Toggle Theme"
      >
        {dark ? <Sun /> : <Moon />}
      </button>

      {/* ================= HERO ================= */}
      <main className="hero">
        <h1>Welcome to ERB Management System</h1>
        <p>
          A complete platform to manage students, faculty, and academic records
          efficiently.
        </p>
      </main>

    </div>
  );
}

export default Hero;
