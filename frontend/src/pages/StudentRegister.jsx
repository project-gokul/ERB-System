import { useState } from "react";
import api from "../services/api";
import "./Login.css";

function StudentRegister() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        department: "",
        year: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await api.post("/auth/register", {
                ...form,
                role: "Student",
            });

            setSuccess("Student account created successfully ✅");
            setForm({
                name: "",
                email: "",
                password: "",
                department: "",
                year: "",
            });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Create Student Account</h2>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <form onSubmit={handleRegister}>
                    <input
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="department"
                        placeholder="Department (e.g. CSE)"
                        value={form.department}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="year"
                        value={form.year}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Year</option>
                        <option value="1st">1st</option>
                        <option value="2nd">2nd</option>
                        <option value="3rd">3rd</option>
                        <option value="4th">4th</option>
                    </select>

                    <button type="submit">Create Student Account</button>
                </form>

                <p>
                    Already have an account? <a href="/student/login">Login</a>
                </p>
            </div>
        </div>
    );
}

export default StudentRegister;
