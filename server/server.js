import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load ENV first — before any other imports that might read process.env
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import Product from "./models/Product.js";

const app = express();

/* =======================================================
   🧩 MIDDLEWARE
======================================================= */
app.use(helmet({
  crossOriginOpenerPolicy: false,   // Required for Google OAuth popup postMessage
  crossOriginEmbedderPolicy: false, // Required for external images
}));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ks-pillows-nd5s.vercel.app",
      "https://ks-pillows-nd5s.vercel.app/",
      "https://www.kspillows.in",
      "https://kspillows.in",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.options("*", cors());

/* =======================================================
   🗄️ MONGODB
======================================================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch((err) => console.error(err));

/* =======================================================
   🏥 HEALTH CHECK
======================================================= */
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running ✅" });
});

/* =======================================================
   🗺️ DYNAMIC SITEMAP (root-level, not under /api)
======================================================= */
app.get("/sitemap.xml", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const products = await Product.find({}).sort({ createdAt: -1 });
    const domain = "https://www.kspillows.in";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    const staticPages = [
      { url: "/", changefreq: "weekly", priority: "1.0" },
      { url: "/products", changefreq: "weekly", priority: "0.9" },
      { url: "/about", changefreq: "monthly", priority: "0.7" },
    ];

    staticPages.forEach((page) => {
      xml += `
  <url>
    <loc>${domain}${page.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    const categories = ["kapok-pillow", "recron-pillow", "kapok-mattresses", "travel-quilt-bed", "korai-pai-bed"];
    categories.forEach((cat) => {
      xml += `
  <url>
    <loc>${domain}/products/${cat}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    products.forEach((product) => {
      xml += `
  <url>
    <loc>${domain}/product/${product.category}/${product._id}</loc>
    <lastmod>${new Date(product.updatedAt || product.createdAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("SITEMAP ERROR:", err);
    res.status(500).json({ success: false, message: "Sitemap generation failed" });
  }
});

/* =======================================================
   🚦 ROUTES
======================================================= */
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", addressRoutes);
app.use("/api", orderRoutes);
app.use("/api/admin", adminRoutes);

/* =======================================================
   🛑 GLOBAL ERROR HANDLER
   Catches any error passed via next(err) in route handlers
======================================================= */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

/* =======================================================
   🚀 START SERVER
======================================================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
