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

import User from "./models/User.js";
import Cart from "./models/Cart.js";
import Product from "./models/Product.js";
import Address from "./models/Address.js";
import Order from "./models/Order.js";

const app = express();

/* =======================================================
   🧩 MIDDLEWARE
======================================================= */
app.use(cors());
app.use(express.json());

/* =======================================================
   🔐 AUTH MIDDLEWARE
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
   🗄️ MONGODB
======================================================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch((err) => console.log(err));

/* =======================================================
   🔐 AUTH APIs
======================================================= */

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
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= GET SINGLE PRODUCT ================= */
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
    const cart = await Cart.findOne({ userId: req.userId });
    res.json(cart || { items: [] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= UPDATE QUANTITY ================= */
app.post("/api/cart/update", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.productId === productId
    );

    if (!item) {
      return res.json({ success: false, message: "Item not found" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => i.productId !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= REMOVE ITEM ================= */
app.post("/api/cart/remove", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId: req.userId });

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

/* =======================================================
   📍 ADDRESS APIs (SEPARATE COLLECTION — PRO)
======================================================= */

/* ================= ADD ADDRESS ================= */
app.post("/api/address/add", authMiddleware, async (req, res) => {
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

    res.json({
      success: true,
      message: "Address saved",
      address,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Address save failed",
    });
  }
});

/* ================= GET ADDRESSES ================= */
app.get("/api/address", authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      addresses,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Fetch address failed",
    });
  }
});

/* ================= DELETE ADDRESS ================= */
app.post("/api/address/delete", authMiddleware, async (req, res) => {
  try {
    const { addressId } = req.body;

    await Address.findOneAndDelete({
      _id: addressId,
      userId: req.userId,
    });

    res.json({
      success: true,
      message: "Address deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});
/* ================= CREATE ORDER ================= */
app.post("/api/orders/create", authMiddleware, async (req, res) => {
  try {
    const { addressId } = req.body;
    const userId = req.userId;

    // ✅ get address from Address collection (FIXED)
    const selectedAddress = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!selectedAddress) {
      return res.json({
        success: false,
        message: "Address not found",
      });
    }

    // ✅ get cart
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ✅ totals
    const totalItems = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ✅ create order
    const order = new Order({
      userId,
      items: cart.items,
      address: selectedAddress, // ✅ now correct
      totalItems,
      totalPrice,
    });

    await order.save();

    // ✅ clear cart
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (err) {
    console.log("ORDER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});
/* ================= GET USER ORDERS ================= */
app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});
/* =======================================================
   🚀 SERVER
======================================================= */
app.listen(5000, () =>
  console.log("Server running on port 5000 🚀")
);