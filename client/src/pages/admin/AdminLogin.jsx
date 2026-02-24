import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const res = await api.post("/login", form);

            if (!res.data.success) {
                toast.error(res.data.message);
                return;
            }

            if (!res.data.isAdmin) {
                toast.error("Access denied. Admin only.");
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userName", res.data.name);
            localStorage.setItem("isAdmin", "true");

            toast.success("Welcome, Admin!");
            navigate("/admin");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
                    <p className="text-gray-500 mt-1 text-sm">KS Pillows Admin Panel</p>
                </div>

                <input
                    type="email"
                    placeholder="Admin Email"
                    className="w-full border p-3 mb-4 rounded-lg focus:outline-red-500"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 mb-6 rounded-lg focus:outline-red-500"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-lg font-semibold transition"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </div>
        </div>
    );
}
