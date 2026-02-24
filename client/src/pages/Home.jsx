import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  // ✅ Categories with images
  const products = [
    {
      name: "Kapok Pillow",
      slug: "kapok-pillow",
      image:
        "https://images.unsplash.com/photo-1582582621959-48d27397dc69?q=80&w=800",
    },
    {
      name: "Recron Pillow",
      slug: "recron-pillow",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
    },
    {
      name: "Kapok Mattresses",
      slug: "kapok-mattresses",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800",
    },
    {
      name: "Travel Quilt Bed",
      slug: "travel-quilt-bed",
      image:
        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=800",
    },
    {
      name: "Korai Pai Bed",
      slug: "korai-pai-bed",
      image:
        "https://images.unsplash.com/photo-1583845112239-97ef1341b271?q=80&w=800",
    },
  ];

  const handleClick = (slug) => {
    navigate(`/products/${slug}`);
  };

  return (
    <div>
{/* 🔴 Hero */}
<div className="bg-red-50 py-20 text-center px-4">
  <div className="max-w-4xl mx-auto">
    
    {/* Main Heading */}
    <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
      Premium Kapok Pillows in Tamil Nadu
    </h1>

    {/* Sub Heading */}
    <h2 className="mt-3 text-xl md:text-2xl font-semibold text-gray-700">
      Natural Comfort for Healthy Sleep
    </h2>

    {/* Brand Line */}
    <p className="mt-2 text-red-600 font-semibold text-lg">
      From KS Pillows
    </p>

    {/* Description */}
    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
      Experience the best sleep with our premium kapok pillows and mattresses
      designed for healthy and peaceful rest.
    </p>

    {/* ✅ CTA Buttons (VERY IMPORTANT) */}
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
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
          Our Products
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((item) => (
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
    </div>
  );
}