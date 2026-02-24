import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../utils/categories";
import { setMetaTags } from "../utils/seoHelper";

export default function Home() {
  const navigate = useNavigate();

  // ✅ SEO meta tags for Home page
  useEffect(() => {
    setMetaTags(
      "KS Pillows - Buy Kapok Pillows Online | Tamil Nadu",
      "Shop premium kapok pillows, recron pillows, mattresses & travel beds online. Natural, eco-friendly comfort products made in Tamil Nadu. Free delivery available.",
      "https://www.kspillows.in",
      "https://www.kspillows.in/images/kapok-pillow.jpg"
    );
  }, []);

  const handleClick = (slug) => {
    navigate(`/products/${slug}`);
  };

  return (
    <div>
      {/* 🔴 Hero */}
      <div className="bg-red-50 py-20 text-center px-4">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
            Buy Kapok Pillows Online in Tamil Nadu
          </h1>

          <h2 className="mt-3 text-xl md:text-2xl font-semibold text-gray-700">
            Natural Kapok Pillows & Mattresses for Healthy Sleep
          </h2>

          <p className="mt-2 text-red-600 font-semibold text-lg">
            KS Pillows — Premium Comfort, Made in India
          </p>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Experience the best sleep with our premium <strong>kapok pillows</strong>,
            recron pillows, and natural mattresses. Trusted by thousands across
            Tamil Nadu. Eco-friendly, hypoallergenic, and made with natural kapok fiber.
          </p>

          {/* ✅ CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold shadow cursor-pointer"
            >
              Shop Now
            </button>

            <a
              href="https://wa.me/919943723279"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-red-600 text-red-600 hover:bg-red-50 px-8 py-3 rounded-lg font-semibold"
            >
              WhatsApp Order
            </a>
          </div>

        </div>
      </div>

      {/* 🔴 Products */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Our Products
        </h2>
        <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
          From traditional <strong>kapok pillows</strong> to korai pai beds —
          all crafted for natural comfort and long-lasting quality.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {CATEGORIES.map((item) => (
            <div
              key={item.slug}
              onClick={() => handleClick(item.slug)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition overflow-hidden group cursor-pointer"
            >
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={`${item.name} - Buy Online | KS Pillows`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

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

      {/* ✅ SEO Content Section — helps Google understand what this site is about */}
      <div className="bg-white border-t py-12 px-4">
        <div className="max-w-4xl mx-auto text-gray-600 text-sm leading-relaxed space-y-3">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Why Choose KS Pillows?
          </h2>
          <p>
            <strong>KS Pillows</strong> is a trusted manufacturer and seller of premium
            <strong> kapok pillows</strong> in Tamil Nadu. Our products are made from
            100% natural kapok fiber — a hypoallergenic, breathable, and eco-friendly
            alternative to synthetic fillings.
          </p>
          <p>
            We offer a wide range of products including <strong>kapok pillows</strong>,
            <strong> recron pillows</strong>, <strong>kapok mattresses</strong>,
            <strong> travel quilt beds</strong>, and <strong>korai pai beds</strong> —
            all crafted for durability, comfort, and healthy sleep.
          </p>
          <p>
            Order online across India or WhatsApp us for bulk and wholesale enquiries.
          </p>
        </div>
      </div>
    </div>
  );
}