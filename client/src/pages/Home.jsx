export default function Home() {
  const products = [
    "Kapok Pillow",
    "Recron Pillow",
    "Kapok Mattresses",
    "Travel Quilt Bed",
    "Korai Pai Bed",
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-blue-50 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Premium Comfort from KS Pillows
        </h1>
        <p className="text-gray-600">
          Experience the best sleep with our premium products.
        </p>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Our Products
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map((item, index) => (
            <div
              key={index}
              className="p-6 border rounded-xl shadow hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold">{item}</h3>
              <p className="text-gray-500 mt-2">
                High quality premium product for better comfort.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center p-6">
        <p>© 2026 KS Pillows. All rights reserved.</p>

        <div className="space-x-4 mt-2">
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
          <a href="#">WhatsApp</a>
          <a href="#">Email</a>
        </div>
      </footer>
    </div>
  );
}