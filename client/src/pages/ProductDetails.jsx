import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { setMetaTags } from "../utils/seoHelper";

export default function ProductDetails() {
  const { category, id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = product?.images?.length > 0 ? product.images : [product?.image].filter(Boolean);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/product/${id}`);

        if (res.data.success) {
          const product = res.data.product;
          setProduct(product);

          // ✅ Set SEO meta tags
          const productUrl = `https://www.kspillows.in/product/${category}/${id}`;
          const productTitle = `${product.name} - KS Pillows`;
          const productDescription = product.description || `Premium ${product.name} from KS Pillows. High quality comfort products.`;
          const productImage = product.image || "https://images.unsplash.com/photo-1582582621959-48d27397dc69?q=80&w=800";

          setMetaTags(productTitle, productDescription, productUrl, productImage);

          // ✅ JSON-LD structured data for Google Rich Results
          const existingScript = document.getElementById("product-jsonld");
          if (existingScript) existingScript.remove();

          const script = document.createElement("script");
          script.id = "product-jsonld";
          script.type = "application/ld+json";
          script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description:
              product.description ||
              `Premium ${product.name} from KS Pillows. Natural comfort for healthy sleep.`,
            image: product.image,
            sku: product.productCode || product._id,
            brand: {
              "@type": "Brand",
              name: "KS Pillows",
            },
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              url: productUrl,
              seller: {
                "@type": "Organization",
                name: "KS Pillows",
              },
            },
          });
          document.head.appendChild(script);
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
  }, [id, category]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    try {
      // ✅ Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      if (!product) return;

      setAdding(true);

      await api.post("/cart/add", {
        productId: product._id,
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
      {/* 🖼 Image Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div className="bg-white rounded-2xl shadow p-6 relative h-[450px] flex items-center justify-center group overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain rounded-xl transition-all duration-300"
              />

              {/* Overlay Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg border border-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg border border-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="text-gray-400">No Image Available</div>
          )}
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`snap-center flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentIndex === idx ? "border-red-600 shadow-md scale-[1.03]" : "border-transparent opacity-70 hover:opacity-100 shadow-sm"
                  }`}
              >
                <img
                  src={imgUrl}
                  className="w-full h-full object-cover bg-white"
                  alt={`Thumbnail ${idx + 1}`}
                />
              </button>
            ))}
          </div>
        )}
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