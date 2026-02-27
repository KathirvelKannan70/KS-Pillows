import { Link, useNavigate, useLocation } from "react-router-dom";

const navItems = [
    { label: "📊 Dashboard", path: "/admin" },
    { label: "👥 Users", path: "/admin/users" },
    { label: "📦 Products", path: "/admin/products" },
    { label: "🛒 Orders", path: "/admin/orders" },
];

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAdmin");
        navigate("/admin/login");
    };

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-60 bg-gray-900 text-white flex flex-col flex-shrink-0">
                <div className="px-6 py-5 border-b border-gray-700">
                    <h1 className="text-lg font-bold text-red-400">KS Pillows</h1>
                    <p className="text-xs text-gray-400">Admin Panel</p>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname === item.path
                                ? "bg-red-600 text-white"
                                : "text-gray-300 hover:bg-gray-800"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-sm text-red-400 hover:text-red-300 px-2 py-1"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
    );
}
