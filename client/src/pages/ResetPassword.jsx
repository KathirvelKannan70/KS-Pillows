import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleReset = async () => {
        if (!password || !confirm) return toast.error("Fill both fields");
        if (password.length < 6) return toast.error("Password must be at least 6 characters");
        if (password !== confirm) return toast.error("Passwords do not match");
        if (!token) return toast.error("Invalid reset link");

        try {
            setLoading(true);
            const res = await api.post("/reset-password", { token, password });
            if (res.data.success) {
                setDone(true);
                toast.success("Password reset successfully!");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
                    <div className="text-5xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-gray-800">Invalid Link</h1>
                    <p className="text-gray-500 mt-2">This reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className="mt-6 inline-block text-red-600 font-semibold hover:underline">
                        Request a new link →
                    </Link>
                </div>
            </div>
        );
    }

    if (done) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
                    <div className="text-5xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-gray-800">Password Reset!</h1>
                    <p className="text-gray-500 mt-2">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h1>
                <p className="text-gray-500 text-sm mb-6">Choose a strong password for your account.</p>

                {/* New password */}
                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New password"
                        className="w-full border p-3 rounded-lg focus:outline-red-500 text-sm pr-16"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-3 text-xs text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                {/* Confirm password */}
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="w-full border p-3 rounded-lg focus:outline-red-500 text-sm mb-4"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                />

                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-lg font-semibold transition text-sm"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </div>
        </div>
    );
}
