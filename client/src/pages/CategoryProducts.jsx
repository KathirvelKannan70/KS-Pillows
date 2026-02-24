import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { setMetaTags } from "../utils/seoHelper";

// ✅ Per-category SEO data
const CATEGORY_SEO = {
  "kapok-pillow": {
    title: "Kapok Pillow - Buy Natural Kapok Pillows Online | KS Pillows",
    description:
      "Buy premium kapok pillows online in Tamil Nadu. 100% natural, hypoallergenic, eco-friendly kapok fiber pillows for healthy sleep. Shop KS Pillows.",
  },
  "recron-pillow": {
    title: "Recron Pillow - Buy Recron Fibre Pillows Online | KS Pillows",
    description:
      "Shop high-quality recron fibre pillows online. Soft, durable, and affordable recron pillows from KS Pillows, Tamil Nadu.",
  },
  "kapok-mattresses": {
    title: "Kapok Mattress - Buy Natural Kapok Mattresses Online | KS Pillows",
    description:
      "Buy natural kapok mattresses online. Eco-friendly, breathable, and comfortable kapok mattresses made in Tamil Nadu by KS Pillows.",
  },
  "travel-quilt-bed": {
    title: "Travel Quilt Bed - Buy Online | KS Pillows",
    description:
      "Shop lightweight travel quilt beds online. Perfect for travel, camping, and guest use. Natural comfort from KS Pillows, Tamil Nadu.",
  },
  "korai-pai-bed": {
    title: "Korai Pai Bed - Buy Traditional Korai Mat Bed Online | KS Pillows",
    description:
      "Buy traditional korai pai (reed mat) beds online. Natural, cool, and durable korai mat beds from KS Pillows, Tamil Nadu.",
  },
};

export default function CategoryProducts() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH FROM MONGODB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/products/${category}`
        );

        if (res.data.success) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Product fetch error", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // ✅ Set per-category SEO tags
    const seo = CATEGORY_SEO[category];
    if (seo) {
      setMetaTags(
        seo.title,
        seo.description,
        `https://www.kspillows.in/products/${category}`,
        "https://www.kspillows.in/images/kapok-pillow.jpg"
      );
    }
  }, [category]);

  const formatTitle = (slug) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // ✅ LOADING STATE
  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-10">
        {formatTitle(category)}
      </h1>

      {/* Empty state */}
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() =>
                navigate(`/product/${category}/${product._id}`)
              }
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={`${product.name} - Buy Online | KS Pillows`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {product.name}
                </h3>

                <p className="text-red-600 font-bold mt-1">
                  ₹{product.price}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${category}/${product._id}`);
                  }}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}