import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "./FacultyDashboard.css";

function FacultyDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  // ================= STATE =================
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [materialLink, setMaterialLink] = useState("");

  const year = "II Year";

  // ================= FETCH SUBJECTS (ESLINT SAFE) =================
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get(
          `/subjects/${encodeURIComponent(year)}`
        );
        setSubjects(res.data); // ✅ allowed inside async callback
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };

    fetchSubjects();
  }, [year]);

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

      // 🔁 reload subjects
      const res = await api.get(`/subjects/${encodeURIComponent(year)}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error adding subject", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to add subject");
    }
  };

  // ================= DELETE SUBJECT =================
  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      await api.delete(`/subjects/${id}`);

      // 🔁 reload subjects
      const res = await api.get(`/subjects/${encodeURIComponent(year)}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error deleting subject", err);
    }
  };

  // ================= ADD / UPDATE MATERIAL LINK =================
  const addMaterialLink = async (subjectId) => {
    if (!materialLink.trim()) {
      alert("Paste material link");
      return;
    }

    try {
      await api.put(`/subjects/material/${subjectId}`, {
        materialLink,
      });

      setMaterialLink("");

      // 🔁 reload subjects
      const res = await api.get(`/subjects/${encodeURIComponent(year)}`);
      setSubjects(res.data);

      alert("Material link added");
    } catch (err) {
      console.error("Error adding material link", err);
      alert("Failed to add link");
    }
  };

  return (
    <div className="faculty-layout">
      {/* ===== SIDEBAR ===== */}
      <div className="sidebar">
        <h2 className="logo">👨‍🏫 Faculty</h2>

        <Link to="/faculty/dashboard" className="menu-item active">
          Dashboard
        </Link>

        <Link to="/student" className="menu-item">
          Student Data
        </Link>

        <Link to="/faculty" className="menu-item">
          Faculty Data
        </Link>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="content">
        <h1>📊 Faculty Dashboard</h1>

        <div className="info-card">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Department:</strong> {user?.department}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>

        <div className="subject-card">
          <h2>📚 Manage II Year Subjects</h2>

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

        <button
          className="student-btn"
          onClick={() => (window.location.href = "/IIYear")}
        >
          🎓 View 2nd Year Materials
        </button>
      </div>
    </div>
  );
}

export default FacultyDashboard;