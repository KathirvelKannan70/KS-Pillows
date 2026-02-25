import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* ─── GET PRODUCTS BY CATEGORY ─── */
router.get("/products/:category", async (req, res, next) => {
    try {
        const products = await Product.find({ category: req.params.category }).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (err) {
        next(err);
    }
});

/* ─── GET SINGLE PRODUCT ─── */
router.get("/product/:id", async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, product });
    } catch (err) {
        next(err);
    }
});

export default router;
