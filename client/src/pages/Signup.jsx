import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    const res = await axios.post("http://localhost:5000/api/signup", form);
    alert(res.data.message);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <input
          placeholder="First Name"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) =>
            setForm({ ...form, firstName: e.target.value })
          }
        />

        <input
          placeholder="Last Name"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) =>
            setForm({ ...form, lastName: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={handleSignup}
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}