import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../utils/categories";
import { setMetaTags } from "../utils/seoHelper";

export default function Products() {
  const navigate = useNavigate();

  // ✅ SEO
  useEffect(() => {
    setMetaTags(
      "All Products - Kapok Pillows, Mattresses & Beds | KS Pillows",
      "Browse our full range of kapok pillows, recron pillows, kapok mattresses, travel quilt beds and korai pai beds. Natural comfort products from Tamil Nadu.",
      "https://www.kspillows.in/products",
      "https://www.kspillows.in/images/kapok-pillow.jpg"
    );
  }, []);

  const handleClick = (slug) => {
    navigate(`/products/${slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      {/* 🔴 Page Header */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
          Our Products
        </h1>
        <p className="mt-3 text-gray-600 md:text-lg">
          Explore our premium collection of kapok pillows, mattresses, and more for the perfect sleep experience.
        </p>
      </div>

      {/* 🔴 Products Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {CATEGORIES.map((item) => (
          <div
            key={item.slug}
            onClick={() => handleClick(item.slug)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition overflow-hidden group cursor-pointer"
          >
            {/* 🖼 Image */}
            <div className="overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            {/* 📦 Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {item.name}
              </h3>

              <p className="text-gray-500 mt-2">
                High quality premium product for better comfort.
              </p>

              <button className="mt-4 text-red-600 font-semibold hover:underline">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
