import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load ENV
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import { body, param, validationResult } from "express-validator";

import User from "./models/User.js";
import Cart from "./models/Cart.js";
import Product from "./models/Product.js";
import Address from "./models/Address.js";
import Order from "./models/Order.js";

const app = express();

/* =======================================================
   🧩 MIDDLEWARE
======================================================= */
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
   �️ RATE LIMITING
======================================================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* =======================================================
   �🔐 AUTH MIDDLEWARE
======================================================= */
const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token" });
  }
};

/* =======================================================
   🛠️ VALIDATION HELPER
======================================================= */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

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
   🔐 AUTH APIs
======================================================= */

/* ================= SIGNUP ================= */
app.post(
  "/api/signup",
  authLimiter,
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.json({
          success: false,
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      await user.save();

      res.json({
        success: true,
        message: "User registered successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* ================= LOGIN ================= */
app.post(
  "/api/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        name: user.firstName,
        isAdmin: user.isAdmin,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =======================================================
   🛍️ PRODUCT APIs
======================================================= */

/* ================= GET PRODUCTS BY CATEGORY ================= */
app.get("/api/products/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
    }).sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= GET SINGLE PRODUCT ================= */
app.get("/api/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= DYNAMIC SITEMAP ================= */
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

    xml += `
</urlset>`;

    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("SITEMAP ERROR:", err);
    res.status(500).json({ success: false, message: "Sitemap generation failed" });
  }
});

/* =======================================================
   🛒 CART APIs
======================================================= */

/* ================= ADD TO CART ================= */
app.post(
  "/api/cart/add",
  authMiddleware,
  [
    body("productId").notEmpty().withMessage("productId is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  ],
  validate,
  async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.userId;

      // ✅ SECURITY: always fetch price from DB — never trust client
      const dbProduct = await Product.findById(productId);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const cartItem = {
        productId: String(dbProduct._id),
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.image,
        quantity,
      };

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [cartItem] });
      } else {
        const existingItem = cart.items.find(
          (item) => item.productId === cartItem.productId
        );

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.items.push(cartItem);
        }
      }

      await cart.save();

      res.json({ success: true, message: "Added to cart" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Cart error" });
    }
  }
);

/* ================= GET CART ================= */
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    res.json(cart || { items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= UPDATE QUANTITY ================= */
app.post(
  "/api/cart/update",
  authMiddleware,
  [
    body("productId").notEmpty().withMessage("productId is required"),
    body("quantity").isInt({ min: 0 }).withMessage("Quantity must be >= 0"),
  ],
  validate,
  async (req, res) => {
    try {
      const { productId, quantity } = req.body;

      const cart = await Cart.findOne({ userId: req.userId });

      if (!cart) {
        return res.json({ success: false, message: "Cart not found" });
      }

      const item = cart.items.find((i) => i.productId === productId);

      if (!item) {
        return res.json({ success: false, message: "Item not found" });
      }

      if (quantity <= 0) {
        cart.items = cart.items.filter((i) => i.productId !== productId);
      } else {
        item.quantity = quantity;
      }

      await cart.save();

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* ================= REMOVE ITEM ================= */
app.post(
  "/api/cart/remove",
  authMiddleware,
  [body("productId").notEmpty().withMessage("productId is required")],
  validate,
  async (req, res) => {
    try {
      const { productId } = req.body;

      const cart = await Cart.findOne({ userId: req.userId });

      if (!cart) return res.json({ success: true });

      cart.items = cart.items.filter((item) => item.productId !== productId);

      await cart.save();

      res.json({ success: true, message: "Item removed" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =======================================================
   📍 ADDRESS APIs
======================================================= */

const addressValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("phone")
    .trim()
    .customSanitizer((val) => val.replace(/[\s\-().+]/g, "")) // strip +91, spaces, dashes
    .matches(/^[0-9]{10}$/)
    .withMessage("Valid 10-digit phone number is required"),
  body("street").trim().notEmpty().withMessage("Street is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("pincode")
    .trim()
    .customSanitizer((val) => val.replace(/\s/g, "")) // strip spaces
    .matches(/^[0-9]{6}$/)
    .withMessage("Valid 6-digit pincode is required"),
];

/* ================= ADD ADDRESS ================= */
app.post(
  "/api/address/add",
  authMiddleware,
  addressValidation,
  validate,
  async (req, res) => {
    try {
      const address = new Address({
        userId: req.userId,
        fullName: req.body.fullName,
        phone: req.body.phone,
        street: req.body.street,
        city: req.body.city,
        pincode: req.body.pincode,
      });

      await address.save();

      res.json({ success: true, message: "Address saved", address });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Address save failed" });
    }
  }
);

/* ================= GET ADDRESSES ================= */
app.get("/api/address", authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Fetch address failed" });
  }
});

/* ================= DELETE ADDRESS ================= */
app.delete(
  "/api/address/:id",
  authMiddleware,
  [param("id").isMongoId().withMessage("Invalid address ID")],
  validate,
  async (req, res) => {
    try {
      await Address.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

      res.json({ success: true, message: "Address deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Delete failed" });
    }
  }
);

/* =======================================================
   📦 ORDER APIs
======================================================= */

/* ================= CREATE ORDER ================= */
app.post(
  "/api/orders/create",
  authMiddleware,
  [body("addressId").isMongoId().withMessage("Valid addressId is required")],
  validate,
  async (req, res) => {
    try {
      const { addressId } = req.body;
      const userId = req.userId;

      const selectedAddress = await Address.findOne({ _id: addressId, userId });

      if (!selectedAddress) {
        return res.json({ success: false, message: "Address not found" });
      }

      const cart = await Cart.findOne({ userId });

      if (!cart || cart.items.length === 0) {
        return res.json({ success: false, message: "Cart is empty" });
      }

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const order = new Order({
        userId,
        items: cart.items,
        address: selectedAddress,
        totalItems,
        totalPrice,
      });

      await order.save();

      cart.items = [];
      await cart.save();

      res.json({
        success: true,
        message: "Order placed successfully",
        orderId: order._id,
      });
    } catch (err) {
      console.error("ORDER ERROR:", err);
      res.status(500).json({ success: false, message: "Order creation failed" });
    }
  }
);

/* ================= GET USER ORDERS ================= */
app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =======================================================
   🔐 OTP 2FA — ADMIN LOGIN
======================================================= */

// In-memory OTP store — { email: { otp, expiresAt } }
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP via Gmail
const sendEmailOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"KS Pillows Admin" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your Admin Login OTP — KS Pillows",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto">
        <h2 style="color:#dc2626">KS Pillows Admin Login</h2>
        <p>Your one-time password (OTP) is:</p>
        <h1 style="letter-spacing:8px;color:#111;font-size:36px">${otp}</h1>
        <p style="color:#666">This OTP expires in <strong>5 minutes</strong>.</p>
        <p style="color:#666;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

// Send OTP via Fast2SMS
const sendSMSOTP = async (otp) => {
  const phone = process.env.ADMIN_PHONE;
  if (!phone || !process.env.FAST2SMS_API_KEY) return;

  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&variables_values=${otp}&route=otp&numbers=${phone}`;
  await fetch(url);
};

/* ≡ STEP 1 — Verify credentials, send OTP */
app.post(
  "/api/admin/login/initiate",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !user.isAdmin) {
        return res.status(403).json({ success: false, message: "Admin account not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid password" });
      }

      // Generate OTP
      const otp = generateOTP();
      otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

      // Send via both channels simultaneously
      const [emailResult, smsResult] = await Promise.allSettled([
        sendEmailOTP(email, otp),
        sendSMSOTP(otp),
      ]);

      if (emailResult.status === "rejected") {
        console.error("Email OTP failed:", emailResult.reason?.message);
      }
      if (smsResult.status === "rejected") {
        console.error("SMS OTP failed:", smsResult.reason?.message);
      }

      // If both failed, inform admin
      if (emailResult.status === "rejected" && smsResult.status === "rejected") {
        return res.status(500).json({ success: false, message: "Failed to send OTP. Check server config." });
      }

      res.json({
        success: true,
        message: `OTP sent to your email${process.env.ADMIN_PHONE ? " and phone" : ""}`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* ≡ STEP 2 — Verify OTP, issue JWT */
app.post(
  "/api/admin/login/verify",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      const stored = otpStore.get(email);

      if (!stored) {
        return res.status(400).json({ success: false, message: "OTP not found. Please login again." });
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ success: false, message: "OTP expired. Please login again." });
      }

      if (stored.otp !== otp) {
        return res.status(401).json({ success: false, message: "Incorrect OTP" });
      }

      // OTP verified — clear and issue JWT
      otpStore.delete(email);

      const user = await User.findOne({ email });
      const token = jwt.sign(
        { userId: user._id, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );

      res.json({
        success: true,
        token,
        name: user.firstName,
        isAdmin: true,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =======================================================
   🔐 ADMIN MIDDLEWARE
======================================================= */
const adminMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ success: false, message: "No token" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/* =======================================================
   🛠️ ADMIN — STATS
======================================================= */
app.get("/api/admin/stats", adminMiddleware, async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, orders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.find({}, "totalPrice"),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.json({ success: true, totalOrders, totalUsers, totalProducts, totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =======================================================
   🛠️ ADMIN — PRODUCTS
======================================================= */

/* ≡ GET ALL PRODUCTS (admin) */
app.get("/api/admin/products", adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ≡ ADD PRODUCT */
app.post(
  "/api/admin/product",
  adminMiddleware,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("productCode").trim().notEmpty().withMessage("Product code is required"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, productCode, category, price, size, weight, description, image } = req.body;
      const product = new Product({ name, productCode, category, price, size, weight, description, image });
      await product.save();
      res.json({ success: true, message: "Product added", product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* ≡ UPDATE PRODUCT */
app.put(
  "/api/admin/product/:id",
  adminMiddleware,
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Valid price required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, productCode, category, price, size, weight, description, image } = req.body;
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { name, productCode, category, price, size, weight, description, image },
        { new: true, runValidators: true }
      );
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      res.json({ success: true, message: "Product updated", product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* ≡ DELETE PRODUCT */
app.delete(
  "/api/admin/product/:id",
  adminMiddleware,
  [param("id").isMongoId().withMessage("Invalid product ID")],
  validate,
  async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Product deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =======================================================
   🛠️ ADMIN — ORDERS
======================================================= */

/* ≡ GET ALL ORDERS */
app.get("/api/admin/orders", adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ≡ UPDATE ORDER STATUS */
app.put(
  "/api/admin/order/:id/status",
  adminMiddleware,
  [
    param("id").isMongoId().withMessage("Invalid order ID"),
    body("status")
      .isIn(["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"])
      .withMessage("Invalid status"),
  ],
  validate,
  async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });
      res.json({ success: true, message: "Status updated", order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =======================================================
   🚀 SERVER
======================================================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
