import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setMsg("Password updated successfully");
    } catch {
      setMsg("Link expired or invalid");
    }
  };

  return (
    <div className="auth-card">
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button>Reset Password</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}

export default ResetPassword;