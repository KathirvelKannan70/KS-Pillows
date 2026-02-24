import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!email) return toast.error("Enter your email");
        try {
            setLoading(true);
            const res = await api.post("/forgot-password", { email });
            if (res.data.success) setSent(true);
            else toast.error(res.data.message);
        } catch (err) {
            toast.error("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
                    <div className="text-5xl mb-4">📧</div>
                    <h1 className="text-2xl font-bold text-gray-800">Check Your Email</h1>
                    <p className="text-gray-500 mt-3">
                        If an account exists for <strong>{email}</strong>, we've sent a
                        password reset link. It expires in <strong>1 hour</strong>.
                    </p>
                    <p className="text-xs text-gray-400 mt-4">Didn't receive it? Check spam folder.</p>
                    <Link to="/login" className="mt-6 inline-block text-red-600 font-semibold hover:underline text-sm">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
                <p className="text-gray-500 text-sm mb-6">
                    Enter your email and we'll send you a reset link.
                </p>

                <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full border p-3 rounded-lg focus:outline-red-500 mb-4 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-lg font-semibold transition text-sm"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="text-center mt-4 text-sm text-gray-500">
                    Remembered it?{" "}
                    <Link to="/login" className="text-red-600 font-semibold hover:underline">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
