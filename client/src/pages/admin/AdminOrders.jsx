import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS = {
    Placed: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Shipped: "bg-indigo-100 text-indigo-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/admin/orders");
                if (res.data.success) setOrders(res.data.orders);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdating(orderId);
            await api.put(`/admin/order/${orderId}/status`, { status: newStatus });
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
            );
            toast.success(`Status → ${newStatus}`);
        } catch (err) {
            toast.error("Update failed");
        } finally { setUpdating(null); }
    };

    if (loading) return <AdminLayout><Loader /></AdminLayout>;

    return (
        <AdminLayout>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                All Orders <span className="text-base font-normal text-gray-400">({orders.length})</span>
            </h2>

            <div className="space-y-4">
                {orders.length === 0 && (
                    <div className="bg-white rounded-2xl p-10 text-center text-gray-400">No orders yet.</div>
                )}

                {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        {/* Header row */}
                        <div
                            className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                        >
                            <div>
                                <p className="text-xs text-gray-400">#{order._id.slice(-10)}</p>
                                <p className="font-semibold">{order.address?.fullName}</p>
                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-bold text-red-600">₹{order.totalPrice}</span>

                                {/* Status selector */}
                                <select
                                    value={order.status}
                                    disabled={updating === order._id}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className={`text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer outline-none ${STATUS_COLORS[order.status]}`}
                                >
                                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>

                                <span className="text-gray-400 text-sm">{expanded === order._id ? "▲" : "▼"}</span>
                            </div>
                        </div>

                        {/* Expanded detail */}
                        {expanded === order._id && (
                            <div className="border-t px-4 py-4 grid md:grid-cols-2 gap-6">
                                {/* Items */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-3">Items ({order.totalItems})</p>
                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <div key={item.productId} className="flex gap-3 items-center">
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-sm text-red-600">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-3">Delivery Address</p>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="font-medium">{order.address?.fullName}</p>
                                        <p>{order.address?.street}</p>
                                        <p>{order.address?.city} — {order.address?.pincode}</p>
                                        <p>📞 {order.address?.phone}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
