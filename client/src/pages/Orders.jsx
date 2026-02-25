import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"];

const STATUS_COLORS = {
  Placed: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  Shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ICONS = {
  Placed: "🛒",
  Confirmed: "✅",
  Shipped: "🚚",
  Delivered: "📦",
  Cancelled: "❌",
};

function OrderProgressBar({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 mt-4 text-sm text-red-600 font-medium">
        <span>❌</span> Order Cancelled
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(status);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between relative">
        {/* Progress line bg */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        {/* Progress line fill */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-red-500 z-0 transition-all duration-500"
          style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIdx;
          return (
            <div key={step} className="flex flex-col items-center z-10 gap-1" style={{ minWidth: 60 }}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                  ${isDone ? "bg-red-600 border-red-600 text-white" : "bg-white border-gray-300 text-gray-400"}`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span className={`text-[11px] text-center font-medium ${isDone ? "text-red-600" : "text-gray-400"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null); // orderId awaiting confirmation

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        if (res.data.success) setOrders(res.data.orders || []);
        else toast.error("Failed to load orders");
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  /* ─── Cancel Order ─── */
  const handleCancelOrder = async (orderId) => {
    console.log("[Cancel] orderId:", orderId, "type:", typeof orderId);
    setCancelling(orderId);
    setCancelConfirm(null);
    try {
      const res = await api.post(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        toast.success("Order cancelled successfully");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: "Cancelled" } : o))
        );
      } else {
        toast.error(res.data.message || "Could not cancel order");
      }
    } catch (err) {
      console.error("[Cancel] Error:", err.response?.status, err.response?.data);
      // Show the actual server error message if available
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to cancel order";
      toast.error(msg);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Orders 📦</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            >
              {/* ── Order header ── */}
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    #{order._id.slice(-10).toUpperCase()}
                  </p>
                  <p className="font-semibold text-gray-800">
                    {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Status badge */}
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_ICONS[order.status]} {order.status}
                  </span>

                  <span className="font-bold text-red-600 text-lg">₹{order.totalPrice}</span>

                  {/* ✅ Inline cancel confirmation — no native browser dialog */}
                  {order.status === "Placed" && cancelling !== order._id && cancelConfirm !== order._id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setCancelConfirm(order._id); }}
                      className="text-xs text-red-500 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition"
                    >
                      Cancel Order
                    </button>
                  )}

                  {/* Inline Yes / No prompt */}
                  {order.status === "Placed" && cancelConfirm === order._id && (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-gray-600 font-medium">Cancel order?</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full transition"
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCancelConfirm(null); }}
                        className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full transition"
                      >
                        No
                      </button>
                    </div>
                  )}

                  {/* Loading state */}
                  {cancelling === order._id && (
                    <span className="text-xs text-gray-400 italic">Cancelling...</span>
                  )}

                  <span className="text-gray-400 text-sm">{expanded === order._id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* ── Progress bar ── */}
              <div className="px-5 pb-4">
                <OrderProgressBar status={order.status} />
              </div>

              {/* ── Expanded details ── */}
              {expanded === order._id && (
                <div className="border-t px-5 py-5 grid md:grid-cols-2 gap-6">
                  {/* Items */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-3">Items Ordered</p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex gap-3 items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                            onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-sm text-red-600">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-3">Delivery Address</p>
                    <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-xl p-4">
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
      )}
    </div>
  );
}