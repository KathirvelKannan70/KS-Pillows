import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, param } from "express-validator";

import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { adminMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { sendAdminOTP } from "../utils/email.js";

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ─── STEP 1: Verify credentials, store OTP in DB, send email ─── */
router.post(
    "/login/initiate",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("password").notEmpty().withMessage("Password required"),
    ],
    validate,
    async (req, res, next) => {
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

            const otp = generateOTP();
            // ✅ Store OTP in DB instead of in-memory Map (survives restarts & multi-instance)
            user.adminOtp = otp;
            user.adminOtpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            await user.save();

            res.json({ success: true, message: "OTP sent to your email" });

            sendAdminOTP(email, otp).catch((err) => console.error("Email OTP failed:", err.message));
        } catch (err) {
            next(err);
        }
    }
);

/* ─── STEP 2: Verify OTP from DB, issue JWT ─── */
router.post(
    "/login/verify",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { email, otp } = req.body;
            const user = await User.findOne({ email });

            if (!user || !user.adminOtp) {
                return res.status(400).json({ success: false, message: "OTP not found. Please login again." });
            }

            if (Date.now() > new Date(user.adminOtpExpiry).getTime()) {
                user.adminOtp = undefined;
                user.adminOtpExpiry = undefined;
                await user.save();
                return res.status(400).json({ success: false, message: "OTP expired. Please login again." });
            }

            if (user.adminOtp !== otp) {
                return res.status(401).json({ success: false, message: "Incorrect OTP" });
            }

            // Clear OTP after successful use
            user.adminOtp = undefined;
            user.adminOtpExpiry = undefined;
            await user.save();

            const token = jwt.sign({ userId: user._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "12h" });

            res.json({ success: true, token, name: user.firstName, isAdmin: true });
        } catch (err) {
            next(err);
        }
    }
);

/* ─── STATS ─── */
router.get("/stats", adminMiddleware, async (req, res, next) => {
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
        next(err);
    }
});

/* ─── GET ALL PRODUCTS ─── */
router.get("/products", adminMiddleware, async (req, res, next) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (err) {
        next(err);
    }
});

/* ─── ADD PRODUCT ─── */
router.post(
    "/product",
    adminMiddleware,
    [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("productCode").trim().notEmpty().withMessage("Product code is required"),
        body("category").trim().notEmpty().withMessage("Category is required"),
        body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { name, productCode, category, price, size, weight, description, image, images } = req.body;
            const product = new Product({ name, productCode, category, price, size, weight, description, image, images: images || [] });
            await product.save();
            res.json({ success: true, message: "Product added", product });
        } catch (err) {
            next(err);
        }
    }
);

/* ─── UPDATE PRODUCT ─── */
router.put(
    "/product/:id",
    adminMiddleware,
    [
        param("id").isMongoId().withMessage("Invalid product ID"),
        body("price").optional().isFloat({ min: 0 }).withMessage("Valid price required"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { name, productCode, category, price, size, weight, description, image, images } = req.body;
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { name, productCode, category, price, size, weight, description, image, images: images || [] },
                { new: true, runValidators: true }
            );
            if (!product) return res.status(404).json({ success: false, message: "Product not found" });
            res.json({ success: true, message: "Product updated", product });
        } catch (err) {
            next(err);
        }
    }
);

/* ─── DELETE PRODUCT ─── */
router.delete(
    "/product/:id",
    adminMiddleware,
    [param("id").isMongoId().withMessage("Invalid product ID")],
    validate,
    async (req, res, next) => {
        try {
            await Product.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: "Product deleted" });
        } catch (err) {
            next(err);
        }
    }
);

/* ─── GET ALL USERS ─── */
router.get("/users", adminMiddleware, async (req, res, next) => {
    try {
        const users = await User.find({}).select("-password -adminOtp -adminOtpExpiry -verificationToken -resetToken").sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) {
        next(err);
    }
});

/* ─── GET ALL ORDERS ─── */
router.get("/orders", adminMiddleware, async (req, res, next) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        next(err);
    }
});

/* ─── UPDATE ORDER STATUS ─── */
router.put(
    "/order/:id/status",
    adminMiddleware,
    [
        param("id").isMongoId().withMessage("Invalid order ID"),
        body("status")
            .isIn(["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"])
            .withMessage("Invalid status"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status: req.body.status },
                { new: true }
            );
            if (!order) return res.status(404).json({ success: false, message: "Order not found" });
            res.json({ success: true, message: "Status updated", order });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
