import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function Checkout() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    pincode: "",
  });

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= TOTALS ================= */
  const totalItems =
    cart.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const totalPrice =
    cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) || 0;

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    try {
      // ✅ validation
      if (
        !address.name ||
        !address.phone ||
        !address.street ||
        !address.city ||
        !address.pincode
      ) {
        toast.error("Please fill delivery address");
        return;
      }

      setPlacingOrder(true);

      // ✅ SAVE ADDRESS TO MONGODB
      await api.post("/address/add", {
        fullName: address.name,
        phone: address.phone,
        houseNo: address.street,
        city: address.city,
        pincode: address.pincode,
        type: "Home",
      });

      toast.success("Address saved & Order placed 🎉");

      // ✅ clear form
      setAddress({
        name: "",
        phone: "",
        street: "",
        city: "",
        pincode: "",
      });

    } catch (err) {
      console.error("Order error:", err);
      toast.error("Order failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) return <Loader />;

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout 🧾</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          Your cart is empty.
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">

          {/* ================= ADDRESS ================= */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6">
              Delivery Address
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                value={address.name}
                placeholder="Full Name"
                className="border p-3 rounded-lg focus:outline-red-500"
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
              />

              <input
                value={address.phone}
                placeholder="Phone Number"
                className="border p-3 rounded-lg focus:outline-red-500"
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
              />

              <input
                value={address.street}
                placeholder="Street Address"
                className="border p-3 rounded-lg md:col-span-2 focus:outline-red-500"
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
              />

              <input
                value={address.city}
                placeholder="City"
                className="border p-3 rounded-lg focus:outline-red-500"
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />

              <input
                value={address.pincode}
                placeholder="Pincode"
                className="border p-3 rounded-lg focus:outline-red-500"
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
              />
            </div>
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6 max-h-60 overflow-auto">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total Price</span>
                <span className="text-red-600">₹{totalPrice}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition"
            >
              {placingOrder ? "Placing Order..." : "Place Order 🚀"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}