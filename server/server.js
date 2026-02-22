import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ FORCE LOAD ENV
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("JWT_SECRET:", process.env.JWT_SECRET);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "./models/User.js";
import Cart from "./models/Cart.js";
import Product from "./models/Product.js"; // ✅ NEW

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= AUTH MIDDLEWARE ================= */
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

/* ================= MONGODB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch((err) => console.log(err));

/* ================= SIGNUP ================= */
app.post("/api/signup", async (req, res) => {
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
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= LOGIN ================= */
app.post("/api/login", async (req, res) => {
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

    // ✅ CREATE JWT TOKEN
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      name: user.firstName,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* =======================================================
   🛍️ PRODUCT APIs (NEW — VERY IMPORTANT)
======================================================= */

/* ✅ GET PRODUCTS BY CATEGORY */
app.get("/api/products/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
    }).sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ✅ GET SINGLE PRODUCT */
app.get("/api/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.json({ success: true, product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* =======================================================
   🛒 CART APIs
======================================================= */

/* ================= ADD TO CART ================= */
app.post("/api/cart/add", authMiddleware, async (req, res) => {
  try {
    const { product, quantity } = req.body;
    const userId = req.userId;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ ...product, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId === product.productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ ...product, quantity });
      }
    }

    await cart.save();

    res.json({
      success: true,
      message: "Added to cart",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Cart error",
    });
  }
});

/* ================= GET CART ================= */
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId });

    res.json(cart || { items: [] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= REMOVE ITEM ================= */
app.post("/api/cart/remove", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.json({ success: true });

    cart.items = cart.items.filter(
      (item) => item.productId !== productId
    );

    await cart.save();

    res.json({
      success: true,
      message: "Item removed",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= SERVER ================= */
app.listen(5000, () =>
  console.log("Server running on port 5000 🚀")
);