import { useParams, useNavigate } from "react-router-dom";

export default function CategoryProducts() {
  const { category } = useParams();
  const navigate = useNavigate();

  // ✅ Mock database (MongoDB-ready structure)
  const allProducts = {
    "kapok-pillow": [
      {
        id: 1,
        name: "Kapok Pillow Soft",
        price: 499,
        image:
          "https://images.unsplash.com/photo-1582582621959-48d27397dc69?q=80&w=800",
      },
      {
        id: 2,
        name: "Kapok Pillow Premium",
        price: 699,
        image:
          "https://images.unsplash.com/photo-1600369672770-985fd300b2f2?q=80&w=800",
      },
      {
        id: 3,
        name: "Kapok Pillow Deluxe",
        price: 899,
        image:
          "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800",
      },
    ],

    "recron-pillow": [
      {
        id: 4,
        name: "Recron Pillow Classic",
        price: 399,
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
      },
      {
        id: 5,
        name: "Recron Pillow Ultra",
        price: 549,
        image:
          "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=800",
      },
    ],

    "kapok-mattresses": [
      {
        id: 6,
        name: "Kapok Mattress Single",
        price: 2999,
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800",
      },
      {
        id: 7,
        name: "Kapok Mattress Double",
        price: 4999,
        image:
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800",
      },
    ],

    "travel-quilt-bed": [
      {
        id: 8,
        name: "Travel Quilt Bed Basic",
        price: 1299,
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
      },
      {
        id: 9,
        name: "Travel Quilt Bed Premium",
        price: 1799,
        image:
          "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=800",
      },
    ],

    "korai-pai-bed": [
      {
        id: 10,
        name: "Korai Pai Bed Classic",
        price: 899,
        image:
          "https://images.unsplash.com/photo-1583845112239-97ef1341b271?q=80&w=800",
      },
      {
        id: 11,
        name: "Korai Pai Bed Premium",
        price: 1199,
        image:
          "https://images.unsplash.com/photo-1616627453795-3b2b5d2c22fc?q=80&w=800",
      },
    ],
  };

  const products = allProducts[category] || [];

  const formatTitle = (slug) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* ✅ Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-10">
        {formatTitle(category)}
      </h1>

      {/* ❌ Empty state */}
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() =>
                navigate(`/product/${category}/${product.id}`)
              }
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden group cursor-pointer"
            >
              {/* 🖼 Image */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* 📦 Content */}
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
                    navigate(`/product/${category}/${product.id}`);
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