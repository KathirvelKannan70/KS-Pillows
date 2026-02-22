import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // ✅ basic validation
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/signup",
        form
      );

      if (res.data.success) {
        toast.success("Account created successfully 🎉");

        // ✅ redirect to login after short delay
        setTimeout(() => {
          navigate("/login");
        }, 1400);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid md:grid-cols-2">
      {/* 🔴 Left branding */}
      <div className="hidden md:flex bg-red-600 text-white items-center justify-center p-10">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">
            Join KS Pillows ✨
          </h1>
          <p className="text-red-100">
            Create your account and experience premium comfort
            products made with care.
          </p>
        </div>
      </div>

      {/* ⚪ Right form */}
      <div className="flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create account
          </h2>

          <input
            placeholder="First Name"
            className="w-full border p-3 mb-3 rounded-lg focus:outline-red-500"
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
          />

          <input
            placeholder="Last Name"
            className="w-full border p-3 mb-3 rounded-lg focus:outline-red-500"
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 mb-3 rounded-lg focus:outline-red-500"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* 🔐 Password */}
          <div className="relative mb-6">
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

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader small /> : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}