import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";
import Loader from "../../components/Loader";

function StatCard({ label, value, color }) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${color}`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    api.get("/admin/stats"),
                    api.get("/admin/orders"),
                ]);
                if (statsRes.data.success) setStats(statsRes.data);
                if (ordersRes.data.success) setRecentOrders(ordersRes.data.orders.slice(0, 8));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <AdminLayout><Loader /></AdminLayout>;

    return (
        <AdminLayout>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

            {/* Stats */}
            {stats && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <StatCard label="Total Orders" value={stats.totalOrders} color="border-blue-500" />
                    <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="border-green-500" />
                    <StatCard label="Total Products" value={stats.totalProducts} color="border-yellow-500" />
                    <StatCard label="Total Users" value={stats.totalUsers} color="border-red-500" />
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b text-gray-500">
                                <th className="pb-3">Order ID</th>
                                <th className="pb-3">Customer</th>
                                <th className="pb-3">Items</th>
                                <th className="pb-3">Total</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {recentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="py-3 text-xs text-gray-500">{order._id.slice(-8)}</td>
                                    <td className="py-3">{order.address?.fullName || "—"}</td>
                                    <td className="py-3">{order.totalItems}</td>
                                    <td className="py-3 font-semibold text-red-600">₹{order.totalPrice}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === "Delivered" ? "bg-green-100 text-green-700"
                                                : order.status === "Shipped" ? "bg-blue-100 text-blue-700"
                                                    : order.status === "Cancelled" ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
