import { Link } from "react-router-dom";
import "./StudentDashboard.css";

function StudentDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="student-layout">

            {/* ===== SIDEBAR ===== */}
            <aside className="sidebar">
                <h2 className="sidebar-title">Student Panel</h2>

                <ul className="menu">
                    <li className="menu-item active">
                        <Link
                            to="/student/certificates"
                            className="menu-link"
                        >
                            🎓 Student Certificates
                        </Link>
                    </li>
                </ul>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="dashboard-content">
                <h1>🎓 Student Dashboard</h1>

                <div className="info-card">
                    <p><strong>Name:</strong> {user?.name}</p>
                    <p><strong>Department:</strong> {user?.department}</p>
                </div>
            </main>

        </div>
    );
}

export default StudentDashboard;