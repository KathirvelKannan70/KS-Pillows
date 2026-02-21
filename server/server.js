import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch((err) => console.log(err));

/* ================= SIGNUP ================= */
app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

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
    res.status(500).json({ success: false });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));