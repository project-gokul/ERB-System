import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "./FacultyDashboard.css";

function FacultyDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  // ================= UI STATE =================
  const [collapsed, setCollapsed] = useState(false);

  // ================= YEAR STATE (ADDED) =================
  const years = ["I Year", "II Year", "III Year", "IV Year"];
  const [year, setYear] = useState("II Year");

  // ================= SUBJECT STATE =================
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [materialLink, setMaterialLink] = useState("");

  // ================= NOTIFICATION STATE =================
  const [notifications, setNotifications] = useState([]);

  // ================= FETCH SUBJECTS =================
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get(`/subjects/${encodeURIComponent(year)}`);
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, [year]);

  // ================= FETCH NOTIFICATIONS =================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications/my");
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  // ================= ADD SUBJECT =================
  const addSubject = async () => {
    if (!subjectName.trim() || !subjectCode.trim()) {
      alert("Enter subject name and subject code");
      return;
    }

    try {
      await api.post("/subjects/add", {
        subjectName,
        subjectCode,
        department: user?.department || "CSE",
        year,
      });

      setSubjectName("");
      setSubjectCode("");

      const res = await api.get(`/subjects/${encodeURIComponent(year)}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error adding subject:", err);
      alert("Failed to add subject");
    }
  };

  // ================= DELETE SUBJECT =================
  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      await api.delete(`/subjects/${id}`);
      const res = await api.get(`/subjects/${encodeURIComponent(year)}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error deleting subject:", err);
    }
  };

  // ================= ADD MATERIAL LINK =================
  const addMaterialLink = async (subjectId) => {
    if (!materialLink.trim()) {
      alert("Paste material link");
      return;
    }

    try {
      await api.put(`/subjects/material/${subjectId}`, { materialLink });
      setMaterialLink("");

      const res = await api.get(`/subjects/${encodeURIComponent(year)}`);
      setSubjects(res.data);

      alert("Material link added");
    } catch (err) {
      console.error("Error adding material link:", err);
      alert("Failed to add link");
    }
  };

  return (
    <div className={`faculty-layout ${collapsed ? "collapsed" : ""}`}>
      {/* ===== SIDEBAR ===== */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <h2 className="logo">{collapsed ? "🎓" : "👨‍🏫 Faculty"}</h2>

        <button className="icon-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "➡" : "⬅"}
        </button>

        <Link to="/faculty/dashboard" className="menu-item active">
          📊 {!collapsed && "Dashboard"}
        </Link>

        <Link to="/student" className="menu-item">
          👨‍🎓 {!collapsed && "Student Data"}
        </Link>

        <Link to="/faculty" className="menu-item">
          👨‍🏫 {!collapsed && "Faculty Data"}
        </Link>

        <Link to="/admin/certificates" className="menu-item">
          📄 {!collapsed && "Verify Certificates"}
          {!collapsed && notifications.length > 0 && (
            <span className="badge">{notifications.length}</span>
          )}
        </Link>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          {!collapsed && "Logout"}
        </button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="content">
        <h1>📊 Faculty Dashboard</h1>

        {/* ===== YEAR TABS (ADDED) ===== */}
        <div className="year-tabs">
          {years.map((y) => (
            <button
              key={y}
              className={`year-tab ${year === y ? "active" : ""}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>

        {/* USER INFO */}
        <div className="info-card">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Department:</strong> {user?.department}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>

        {/* NOTIFICATIONS */}
        <div className="notification-card">
          <h2>🔔 Notifications</h2>

          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className="notification-item">
                <p>{n.message}</p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
                <Link to="/admin/certificates" className="view-link">
                  View
                </Link>
              </div>
            ))
          )}
        </div>

        {/* SUBJECT MANAGEMENT */}
        <div className="subject-card">
          <h2>📚 Manage {year} Subjects</h2>

          <div className="subject-input">
            <input
              type="text"
              placeholder="Enter Subject Name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter Subject Code"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />

            <button onClick={addSubject}>➕ Add Subject</button>
          </div>

          <ul className="subject-list">
            {subjects.length === 0 && <p>No subjects found</p>}

            {subjects.map((s) => (
              <li key={s._id}>
                <strong>{s.subjectName}</strong> ({s.subjectCode})

                <input
                  type="text"
                  placeholder="Paste material link"
                  defaultValue={s.materialLink || ""}
                  onChange={(e) => setMaterialLink(e.target.value)}
                />

                <button onClick={() => addMaterialLink(s._id)}>
                  📎 Add Link
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteSubject(s._id)}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
       <div className="material-buttons">
        <button
          className="student-btn"
          onClick={() => (window.location.href = "/iiyear")}
        >
          🎓 View II Year Materials
        </button>
        <button
          className="student-btn"
          onClick={() => (window.location.href = "/iiiyear")}
        >
          🎓 View III Year Materials
        </button>
        <button className="student-btn" onClick={() => (window.location.href = "/ivyear")}>
          🎓 View IV Year Materials
        </button>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;