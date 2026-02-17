import "./Navbar.css";

function Navbar({ onLogout }) {
  return (
    <div className="navbar">
      <div className="navbar-title">🏫 Dept System</div>

      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;
