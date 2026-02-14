import { useState } from "react";
import api from "../services/api";
import "./Login.css";
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message);
    } catch (err) {
      console.error("Forgot password error:", err);
      setMsg(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Enter registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default ForgotPassword;