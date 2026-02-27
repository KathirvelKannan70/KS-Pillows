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

// ✅ PRODUCT CARD COMPONENT
const ProductCard = ({ product, category, navigate }) => {
  const images = product.images?.length > 0 ? product.images : [product.image].filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      onClick={() => navigate(`/product/${category}/${product._id}`)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden group cursor-pointer flex flex-col h-full"
    >
      {/* Image Carousel */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex]}
              alt={`${product.name} - Buy Online | KS Pillows`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? "w-5 bg-white shadow" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-red-600 font-bold mt-1 mb-auto">
          ₹{product.price}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${category}/${product._id}`);
          }}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
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
            <ProductCard key={product._id} product={product} category={category} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}