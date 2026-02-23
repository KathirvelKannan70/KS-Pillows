import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");

      if (res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Orders 📦</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          You have no orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
                <div>
                  <p className="font-semibold">
                    Order ID:{" "}
                    <span className="text-gray-600 text-sm">
                      {order._id}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-red-600 font-bold text-lg">
                  ₹{order.totalPrice}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 border-t pt-4">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="font-semibold text-red-600">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div className="mt-5 pt-4 border-t text-sm text-gray-600">
                <p className="font-semibold mb-1">Delivery Address</p>
                <p>{order.address.fullName}</p>
                <p>
                  {order.address.street}, {order.address.city} -{" "}
                  {order.address.pincode}
                </p>
                <p>📞 {order.address.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}