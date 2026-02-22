import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/login",
        form
      );

      if (res.data.success) {
        // ✅ store auth
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.name);

        toast.success("Welcome back! 🎉");

        // ✅ smooth redirect
        setTimeout(() => navigate("/"), 800);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid md:grid-cols-2">
      
      {/* 🔴 Left branding panel */}
      <div className="hidden md:flex bg-red-600 text-white items-center justify-center p-10">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">
            Welcome Back 👋
          </h1>
          <p className="text-red-100">
            Login to continue your comfortable journey with
            KS Pillows premium products.
          </p>
        </div>
      </div>

      {/* ⚪ Right form */}
      <div className="flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login to your account
          </h2>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 mb-4 rounded-lg focus:outline-red-500"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* Password */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border p-3 rounded-lg focus:outline-red-500"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-sm text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* 🔥 NEW USER LINK */}


          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-semibold transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
                    <p className="text-sm text-gray-600 mb-6 mt-3 text-center">
            New User?{" "}
            <Link
              to="/signup"
              className="text-red-600 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}