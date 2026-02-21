import logo from "../assets/logo.jpg";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Top section */}
        <div className="flex flex-col items-center gap-6">

          {/* Logo + text */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="KS Pillows" className="h-12 w-auto" />
            <div>
              <h2 className="text-xl font-bold text-red-600">KS Pillows</h2>
              <p className="text-gray-500 text-sm">
                For Comfort Dreams
              </p>
            </div>
          </div>

          {/* Social Links — CENTERED */}
          <div className="flex justify-center gap-6 font-medium">
            <a className="text-gray-600 hover:text-red-600" href="#">Facebook</a>
            <a className="text-gray-600 hover:text-red-600" href="#">Instagram</a>
            <a className="text-gray-600 hover:text-red-600" href="#">WhatsApp</a>
            <a className="text-gray-600 hover:text-red-600" href="#">Email</a>
          </div>

        </div>

        {/* Bottom line */}
        <div className="text-center text-gray-500 text-sm mt-8 border-t pt-6">
          © {new Date().getFullYear()} KS Pillows. All rights reserved.
        </div>

      </div>
    </footer>
  );
}