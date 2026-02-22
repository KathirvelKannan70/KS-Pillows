import { useParams } from "react-router-dom";
import { useState } from "react";

export default function ProductDetails() {
  const { category, id } = useParams();
  const [qty, setQty] = useState(1);

  const allProducts = {
    "kapok-pillow": [
      {
        id: 1,
        name: "Kapok Pillow Soft",
        price: 499,
        description:
          "Premium natural kapok pillow designed for soft and breathable comfort.",
        image:
          "https://images.unsplash.com/photo-1582582621959-48d27397dc69?q=80&w=800",
      },
      {
        id: 2,
        name: "Kapok Pillow Premium",
        price: 699,
        description:
          "High quality kapok filling for better neck support and healthy sleep.",
        image:
          "https://images.unsplash.com/photo-1600369672770-985fd300b2f2?q=80&w=800",
      },
    ],

    "recron-pillow": [
      {
        id: 3,
        name: "Recron Pillow Classic",
        price: 399,
        description:
          "Soft recron fiber pillow suitable for daily comfortable sleep.",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
      },
    ],
  };

  const product = allProducts[category]?.find(
    (p) => p.id === Number(id)
  );

  if (!product) {
    return (
      <div className="text-center py-20 text-gray-500">
        Product not found
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="bg-white rounded-2xl shadow p-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[350px] object-cover rounded-xl"
          />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {product.name}
          </h1>

          <p className="text-red-600 text-2xl font-bold mt-3">
            ₹{product.price}
          </p>

          <p className="text-gray-600 mt-4 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <span className="font-medium">Quantity:</span>

            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-1 text-lg"
              >
                −
              </button>

              <span className="px-4">{qty}</span>

              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-1 text-lg"
              >
                +
              </button>
            </div>
          </div>

          <button className="mt-8 w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}