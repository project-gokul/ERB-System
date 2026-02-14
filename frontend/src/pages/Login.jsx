import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // ❌ BLOCK IF NOT HOD
      if (user.role !== "HOD") {
        setError("Access denied: HOD only");
        return;
      }

      // ✅ SAVE DATA
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ REDIRECT TO HOD DASHBOARD
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>HOD Login</h2>
        <p className="subtitle">Sign in to access dashboard</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="hod@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* ✅ FORGOT PASSWORD LINK */}
          <p className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <p>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;