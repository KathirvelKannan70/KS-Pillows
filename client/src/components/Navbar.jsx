import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const location = useLocation();

  // ✅ sync auth state
  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUserName(name);
  }, [location]);

  // ✅ logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="KS Pillows"
              className="h-14 md:h-16 w-auto object-contain"
            />
            <span className="text-xl md:text-2xl font-bold text-red-600">
              KS Pillows
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 font-medium">
            <Link className="text-gray-700 hover:text-red-600 transition" to="/">
              Home
            </Link>

            <Link className="text-gray-700 hover:text-red-600 transition" to="/about">
              About
            </Link>

            {/* ✅ IF LOGGED IN */}
            {userName ? (
              <>
                <span className="text-red-600 font-semibold">
                  👤 {userName}
                </span>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="text-gray-700 hover:text-red-600 transition"
                  to="/login"
                >
                  Login
                </Link>

                <Link
                  className="text-gray-700 hover:text-red-600 transition"
                  to="/signup"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-3xl text-red-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-60 mt-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col space-y-3 font-medium pb-2">
            <Link onClick={() => setMenuOpen(false)} to="/">
              Home
            </Link>

            <Link onClick={() => setMenuOpen(false)} to="/about">
              About
            </Link>

            {userName ? (
              <>
                <span className="text-red-600 font-semibold">
                  👤 {userName}
                </span>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg w-fit"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link onClick={() => setMenuOpen(false)} to="/login">
                  Login
                </Link>

                <Link onClick={() => setMenuOpen(false)} to="/signup">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}