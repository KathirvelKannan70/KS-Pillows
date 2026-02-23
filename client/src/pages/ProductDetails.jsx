import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { category, id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/product/${id}`);

        if (res.data.success) {
          setProduct(res.data.product);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Product details error:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    try {
      if (!product) return;

      setAdding(true);

      await api.post("/cart/add", {
        product: {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
        },
        quantity: 1,
      });

      toast.success("Added to cart 🛒");

      // 🔥 notify navbar badge
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Cart error:", err);

      if (err.response?.status === 401) {
        toast.error("Please login first");
      } else {
        toast.error("Cart error");
      }
    } finally {
      setAdding(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) return <Loader />;

  /* ================= NOT FOUND ================= */
  if (!product) {
    return (
      <div className="text-center py-20 text-gray-500">
        Product not found.
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
      {/* 🖼 Image */}
      <div className="bg-white rounded-2xl shadow p-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover rounded-xl"
        />
      </div>

      {/* 📦 Details */}
      <div>
        <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

        <p className="text-red-600 text-2xl font-bold mb-4">
          ₹{product.price}
        </p>

        <p className="text-gray-600 mb-6">
          {product.description || "Premium quality product."}
        </p>

        <div className="space-y-2 mb-6 text-sm text-gray-700">
          <p>
            <b>Product Code:</b> {product.productCode || "—"}
          </p>
          <p>
            <b>Size:</b> {product.size || "—"}
          </p>
          <p>
            <b>Weight:</b> {product.weight || "—"}
          </p>
        </div>

        {/* ✅ Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-8 py-3 rounded-xl font-semibold transition"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}