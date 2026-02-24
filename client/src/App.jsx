import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Checkout from "./pages/Checkout";
import Products from "./pages/Products";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetails from "./pages/ProductDetails";
import Orders from "./pages/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAuth from "./components/ProtectedAuth";

function App() {
  const location = useLocation();

  // ✅ Hide footer on auth pages
  const hideFooterRoutes = ["/login", "/signup"];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ✅ Sticky Navbar */}
      <Navbar />

      {/* ✅ Main Content */}
      <main className="flex-grow">
        <Routes>
          {/* 🌐 Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          {/* 🔐 Block if already logged in */}
          <Route
            path="/login"
            element={
              <ProtectedAuth>
                <Login />
              </ProtectedAuth>
            }
          />

          <Route
            path="/signup"
            element={
              <ProtectedAuth>
                <Signup />
              </ProtectedAuth>
            }
          />

          {/* 📦 Category page (public) */}
          <Route path="/products/:category" element={<CategoryProducts />} />

          {/* � Product details - public, only add to cart needs login */}
          <Route path="/product/:category/:id" element={<ProductDetails />} />
          <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
          />
          <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        </Routes>
      </main>

      {/* ✅ Footer conditional */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default App;