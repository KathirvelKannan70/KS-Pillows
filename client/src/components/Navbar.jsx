import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import api from "../api/axios";

export default function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));

  const profileRef = useRef(null);

  /* ================= FETCH CART COUNT ================= */
  const fetchCartCount = async () => {
    try {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        setCartCount(0);
        return;
      }

      const res = await api.get("/cart");

      const count =
        res.data?.items?.reduce(
          (sum, item) => sum + item.quantity,
          0
        ) || 0;

      setCartCount(count);
    } catch (err) {
      console.error("Cart count error", err);
      setCartCount(0);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => fetchCartCount();

    const handleAuthChange = () => {
      setToken(localStorage.getItem("token"));
      setUserName(localStorage.getItem("userName"));
      fetchCartCount();
    };

    // close dropdown on outside click
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("authChanged", handleAuthChange);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("authChanged", handleAuthChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    // clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    // notify whole app
    window.dispatchEvent(new Event("authChanged"));

    // reset local state
    setToken(null);
    setUserName(null);
    setCartCount(0);
    setProfileOpen(false);

    // ✅ redirect away from protected pages
    navigate("/");
  };

  /* ================= AVATAR LETTER ================= */
  const avatarLetter = userName
    ? userName.charAt(0).toUpperCase()
    : "U";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">

          {/* ✅ Logo */}
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

          {/* ✅ Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 font-medium">

            <Link className="text-gray-700 hover:text-red-600" to="/">
              Home
            </Link>

            <Link className="text-gray-700 hover:text-red-600" to="/about">
              About
            </Link>

            {/* 🛒 Cart */}
            {token && (
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-red-600"
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* 🔐 Auth */}
            {!token ? (
              <>
                <Link className="text-gray-700 hover:text-red-600" to="/login">
                  Login
                </Link>
                <Link className="text-gray-700 hover:text-red-600" to="/signup">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative" ref={profileRef}>
                {/* Avatar */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold hover:bg-red-700 transition"
                >
                  {avatarLetter}
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">

                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      Signed in as
                      <div className="font-semibold text-gray-800">
                        {userName}
                      </div>
                    </div>

                    <Link
                      to="/cart"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      🛒 My Cart
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 📱 Mobile */}
          <button
            className="md:hidden text-3xl text-red-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>

        {/* 📱 Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col space-y-3 font-medium pb-2">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>

            <Link to="/about" onClick={() => setMenuOpen(false)}>
              About
            </Link>

            {token && (
              <Link to="/cart" onClick={() => setMenuOpen(false)}>
                🛒 Cart ({cartCount})
              </Link>
            )}

            {!token ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-left text-red-600 font-semibold"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}