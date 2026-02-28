import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h3>HOD Panel</h3>

      <ul>
        <li className="active">📊 Dashboard</li>
        <li>👨‍🏫 Faculty</li>
        <li>🎓 Students</li>
        <li>📁 Reports</li>
        <li>⚙️ Settings</li>
        <li> ChatBhot</li>
      </ul>
    </div>
  );
}

export default Sidebar;
