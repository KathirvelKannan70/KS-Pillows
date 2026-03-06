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
import { adminLimiter } from "../middleware/rateLimiter.js";
import { uploadImages } from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ─── STEP 1: Verify credentials, store OTP in DB, send email ─── */
router.post(
    "/login/initiate",
    adminLimiter,
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
    adminLimiter,
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
        body("price").optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("Valid price is required"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { name, productCode, category, size, weight, description, image, images, variants } = req.body;
            // If variants exist, use the first variant's price as the base price
            const parsedVariants = Array.isArray(variants) ? variants.filter(v => v.label && v.price) : [];
            const basePrice = parsedVariants.length > 0 ? parsedVariants[0].price : (req.body.price || 0);
            const product = new Product({
                name, productCode, category,
                price: basePrice, size, weight, description,
                image, images: images || [],
                variants: parsedVariants,
            });
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
        body("price").optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("Valid price required"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { name, productCode, category, size, weight, description, image, images, variants } = req.body;
            const parsedVariants = Array.isArray(variants) ? variants.filter(v => v.label && v.price) : [];
            const basePrice = parsedVariants.length > 0 ? parsedVariants[0].price : (req.body.price || 0);
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { name, productCode, category, price: basePrice, size, weight, description, image, images: images || [], variants: parsedVariants },
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

/* ─── GET ALL USERS (paginated) ─── */
router.get("/users", adminMiddleware, async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find({}).select("-password -adminOtp -adminOtpExpiry -verificationToken -resetToken").sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(),
        ]);
        res.json({ success: true, users, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
});

/* ─── GET ALL ORDERS (paginated) ─── */
router.get("/orders", adminMiddleware, async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(),
        ]);
        res.json({ success: true, orders, total, page, totalPages: Math.ceil(total / limit) });
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

/* ─── CLOUDINARY IMAGE UPLOAD ─── */
router.post(
    "/upload-image",
    adminMiddleware,
    (req, res, next) => {
        uploadImages(req, res, (err) => {
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }
            next();
        });
    },
    async (req, res, next) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, message: "No images provided" });
            }
            const urls = await Promise.all(
                req.files.map((file) => uploadToCloudinary(file.buffer, file.originalname))
            );
            res.json({ success: true, urls });
        } catch (err) {
            console.error("Cloudinary upload error:", err.message);
            next(err);
        }
    }
);

export default router;
