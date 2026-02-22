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
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
          Premium Comfort from{" "}
          <span className="text-red-600">KS Pillows</span>
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the best sleep with our premium kapok and comfort
          products designed for healthy and peaceful rest.
        </p>
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