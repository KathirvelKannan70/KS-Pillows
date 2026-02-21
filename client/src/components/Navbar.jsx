import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-6 py-3">
      <div className="flex justify-between items-center">

        {/* ✅ Logo */}
        <div className="flex items-center gap-3">
        <img
            src={logo}
            alt="KS Pillows"
            className="h-16 md:h-20 w-auto"
        />
        <span className="text-xl font-bold text-red-600">
            KS Pillows
        </span>
        </div>

        {/* ✅ Desktop Menu */}
        <div className="hidden md:flex space-x-8 font-medium">
          <Link className="text-gray-700 hover:text-red-600" to="/">Home</Link>
          <Link className="text-gray-700 hover:text-red-600" to="/login">Login</Link>
          <Link className="text-gray-700 hover:text-red-600" to="/signup">Sign Up</Link>
          <Link className="text-gray-700 hover:text-red-600" to="/about">About</Link>
        </div>

        {/* ✅ Mobile Hamburger */}
        <button
          className="md:hidden text-3xl text-red-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* ✅ Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-3 font-medium">
          <Link onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-red-600" to="/">Home</Link>
          <Link onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-red-600" to="/login">Login</Link>
          <Link onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-red-600" to="/signup">Sign Up</Link>
          <Link onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-red-600" to="/about">About</Link>
        </div>
      )}
    </nav>
  );
}