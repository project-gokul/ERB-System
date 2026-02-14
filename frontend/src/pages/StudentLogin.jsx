import { useState } from "react";
import { Link } from "react-router-dom"; // ✅ Added
import api from "../services/api";
import "./Login.css";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // ❌ BLOCK IF NOT STUDENT
      if (user.role !== "Student") {
        setError("Access denied: Student only");
        return;
      }

      // ✅ SAVE DATA
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ REDIRECT
      window.location.href = "/student/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Student Login</h2>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="student@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />

          <button type="submit">Login</button>

          {/* ✅ FORGOT PASSWORD */}
          <p style={{ marginTop: "10px" }}>
            <Link to="/forgot-password" style={{ color: "#4da3ff" }}>
              Forgot Password?
            </Link>
          </p>

          {/* ✅ REGISTER */}
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/student/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default StudentLogin;