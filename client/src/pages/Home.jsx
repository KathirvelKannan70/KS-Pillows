import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const products = [
    "Kapok Pillow",
    "Recron Pillow",
    "Kapok Mattresses",
    "Travel Quilt Bed",
    "Korai Pai Bed",
  ];

  const handleClick = (index) => {
    navigate(`/product/${index}`);
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
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
          Our Products
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((item, index) => (
            <div
              key={index}
              onClick={() => handleClick(index)}
              className="p-6 border rounded-2xl shadow-sm hover:shadow-xl transition cursor-pointer bg-white"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {item}
              </h3>
              <p className="text-gray-500 mt-2">
                High quality premium product for better comfort.
              </p>

              <button className="mt-4 text-red-600 font-semibold hover:underline">
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}