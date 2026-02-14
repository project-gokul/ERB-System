import { useEffect, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";
import Card from "./card";


function Dashboard() {
  const [user, setUser] = useState(null);

  // ✅ ADD THESE STATES
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // ✅ AUTH CHECK
    api
      .get("/auth/dashboard")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });

    // ✅ FETCH FACULTY
    api
      .get("/faculty")
      .then((res) => {
        setFaculty(res.data);
      })
      .catch((err) => {
        console.error("Faculty fetch failed", err);
      });

    // ✅ FETCH STUDENTS
    api
      .get("/students")
      .then((res) => {
        setStudents(res.data);
      })
      .catch((err) => {
        console.error("Student fetch failed", err);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (!user) {
    return <p className="loading">Loading dashboard...</p>;
  }

  const expiryDate = new Date(user.exp * 1000).toLocaleString();

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <div className="navbar">
        <h2>🏫 Department Of Computer Science</h2>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="layout">
        {/* SIDEBAR */}
        <div className="sidebar">
          <h3>HOD Panel</h3>
          <div className="menu active">📊 Dashboard</div>

          <div>
            <a href="/faculty" className="menu">👨‍🏫 Faculty</a>
          </div>

          <div>
            <a href="/student" className="menu">🎓 Students</a>
          </div>

          <div className="menu">📁 Reports</div>
          <div className="menu">⚙️ Settings</div>
        </div>

        {/* MAIN CONTENT */}
        <div className="content">
          <h1>HOD Dashboard</h1>
          <p className="welcome">Welcome back 👋</p>

          {/* ✅ FIXED: PASS DATA TO CARD */}
          <Card
            facultyData={faculty}
            studentData={students}
          />

          {/* USER INFO */}
          <div className="info-card">
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p>
              <strong>Session expires:</strong><br />
              {expiryDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;