import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error("Cart fetch error:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchCart();

    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () =>
      window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (item, change) => {
    try {
      const newQty = item.quantity + change;

      // ❌ if becomes zero → remove
      if (newQty <= 0) {
        await removeItem(item.productId);
        return;
      }

      await api.post("/cart/update", {
        productId: item.productId,
        quantity: newQty,
      });

      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Qty update error:", err);
      toast.error("Quantity update failed");
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId) => {
    try {
      await api.post("/cart/remove", { productId });

      toast.success("Item removed");

      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Remove error:", err);
      toast.error("Remove failed");
    }
  };

  /* ================= TOTALS ================= */
  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems =
    cart.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  /* ================= LOADING ================= */
  if (loading) return <Loader />;

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart 🛒</h1>

      {/* Empty */}
      {cart.items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          Your cart is empty.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* 🛍️ Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 bg-white p-4 rounded-xl shadow-sm"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {item.name}
                  </h3>

                  <p className="text-red-600 font-bold">
                    ₹{item.price}
                  </p>

                  {/* 🔥 Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item, -1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                    >
                      −
                    </button>

                    <span className="font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item, +1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* 💰 Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4">
              Order Summary
            </h2>

            <div className="flex justify-between mb-2">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total Price</span>
              <span className="text-red-600">₹{totalPrice}</span>
            </div>

            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}