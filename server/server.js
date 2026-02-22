import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Cart from "./models/Cart.js"; // ✅ NEW

const app = express();

app.use(cors());
app.use(express.json());

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
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.json({ success: true, message: "User registered" });
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
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= ADD TO CART ================= */
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userEmail, product, quantity } = req.body;

    let cart = await Cart.findOne({ userEmail });

    if (!cart) {
      cart = new Cart({
        userEmail,
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

    res.json({ success: true, message: "Added to cart" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Cart error" });
  }
});

/* ================= GET CART ================= */
app.post("/api/cart", async (req, res) => {
  try {
    const { userEmail } = req.body;

    const cart = await Cart.findOne({ userEmail });

    res.json(cart || { items: [] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Cart fetch error" });
  }
});

/* ================= REMOVE ITEM ================= */
app.post("/api/cart/remove", async (req, res) => {
  try {
    const { userEmail, productId } = req.body;

    const cart = await Cart.findOne({ userEmail });

    if (!cart) return res.json({ success: true });

    cart.items = cart.items.filter(
      (item) => item.productId !== productId
    );

    await cart.save();

    res.json({ success: true, message: "Item removed" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= SERVER ================= */
app.listen(5000, () =>
  console.log("Server running on port 5000 🚀")
);