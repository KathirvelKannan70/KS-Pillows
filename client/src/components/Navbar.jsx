import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-blue-600">
          KS Pillows
        </h1>

        <div className="space-x-6">
          <Link to="/">Home</Link>
          <Link to="/">Products</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          <Link to="/about">About</Link>
        </div>
      </div>
    </div>
  );
}