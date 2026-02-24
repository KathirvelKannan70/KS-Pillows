import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
    const navigate = useNavigate();

    // step 1 = credentials, step 2 = OTP
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    /* ===== STEP 1: submit credentials ===== */
    const handleInitiate = async () => {
        if (!email || !password) return toast.error("Enter email and password");
        try {
            setLoading(true);
            const res = await api.post("/admin/login/initiate", { email, password });
            if (res.data.success) {
                toast.success(res.data.message); // "OTP sent to your email and phone"
                setStep(2);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    /* ===== STEP 2: verify OTP ===== */
    const handleVerify = async () => {
        if (otp.length !== 6) return toast.error("Enter the 6-digit OTP");
        try {
            setLoading(true);
            const res = await api.post("/admin/login/verify", { email, otp });
            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userName", res.data.name);
                localStorage.setItem("isAdmin", "true");
                toast.success("Welcome, Admin! 🎉");
                navigate("/admin");
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">{step === 1 ? "🔐" : "📱"}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {step === 1 ? "Admin Login" : "Verify OTP"}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {step === 1
                            ? "KS Pillows Admin Panel"
                            : `OTP sent to your email${process.env.ADMIN_PHONE ? " & phone" : ""}`}
                    </p>

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-red-600" : "bg-gray-300"}`} />
                        <div className={`w-8 h-0.5 ${step >= 2 ? "bg-red-600" : "bg-gray-300"}`} />
                        <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-red-600" : "bg-gray-300"}`} />
                    </div>
                </div>

                {/* ===== STEP 1: Credentials ===== */}
                {step === 1 && (
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Admin Email"
                            className="w-full border p-3 rounded-lg focus:outline-red-500 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleInitiate()}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border p-3 rounded-lg focus:outline-red-500 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleInitiate()}
                        />
                        <button
                            onClick={handleInitiate}
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-lg font-semibold transition text-sm"
                        >
                            {loading ? "Sending OTP..." : "Send OTP →"}
                        </button>
                    </div>
                )}

                {/* ===== STEP 2: OTP ===== */}
                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 text-center">
                            Check <strong>{email}</strong> for your 6-digit OTP. Valid for 5 minutes.
                        </p>

                        {/* OTP input */}
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="w-full border p-3 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-red-500"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                            autoFocus
                        />

                        <button
                            onClick={handleVerify}
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-lg font-semibold transition text-sm"
                        >
                            {loading ? "Verifying..." : "Verify & Login ✓"}
                        </button>

                        {/* Resend */}
                        <button
                            onClick={() => { setStep(1); setOtp(""); }}
                            className="w-full text-sm text-gray-400 hover:text-gray-600"
                        >
                            ← Back / Resend OTP
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
