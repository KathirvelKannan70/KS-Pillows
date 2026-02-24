import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState("verifying"); // verifying | success | error
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link.");
            return;
        }

        const verify = async () => {
            try {
                const res = await api.get(`/verify-email/${token}`);
                if (res.data.success) {
                    setStatus("success");
                    setMessage(res.data.message);
                } else {
                    setStatus("error");
                    setMessage(res.data.message);
                }
            } catch (err) {
                setStatus("error");
                setMessage(err.response?.data?.message || "Verification failed. Link may have expired.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">

                {status === "verifying" && (
                    <>
                        <div className="text-4xl mb-4 animate-pulse">📧</div>
                        <h1 className="text-xl font-bold text-gray-800">Verifying your email...</h1>
                        <p className="text-gray-500 mt-2">Please wait a moment.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="text-5xl mb-4">✅</div>
                        <h1 className="text-2xl font-bold text-gray-800">Email Verified!</h1>
                        <p className="text-gray-500 mt-2">{message}</p>
                        <Link
                            to="/login"
                            className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                        >
                            Login Now →
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="text-5xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-gray-800">Verification Failed</h1>
                        <p className="text-gray-500 mt-2">{message}</p>
                        <Link
                            to="/signup"
                            className="mt-6 inline-block border border-red-600 text-red-600 hover:bg-red-50 px-8 py-3 rounded-lg font-semibold transition"
                        >
                            Back to Signup
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
}
