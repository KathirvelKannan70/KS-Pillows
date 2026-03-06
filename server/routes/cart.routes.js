import express from "express";
import { body } from "express-validator";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/* ─── ADD TO CART ─── */
router.post(
    "/cart/add",
    authMiddleware,
    [
        body("productId").notEmpty().withMessage("productId is required"),
        body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
        body("variantLabel").optional().isString(),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { productId, quantity, variantLabel } = req.body;
            const userId = req.userId;

            // ✅ SECURITY: always fetch price from DB — never trust client
            const dbProduct = await Product.findById(productId);
            if (!dbProduct) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            // ── Resolve price / size / weight based on variant ──
            let resolvedPrice = dbProduct.price;
            let resolvedVariantLabel = "";

            if (variantLabel && dbProduct.variants && dbProduct.variants.length > 0) {
                const variant = dbProduct.variants.find(
                    (v) => v.label.toLowerCase() === variantLabel.toLowerCase()
                );
                if (!variant) {
                    return res.status(400).json({ success: false, message: `Variant "${variantLabel}" not found` });
                }
                resolvedPrice = variant.price;
                resolvedVariantLabel = variant.label;
            }

            const cartItem = {
                productId: dbProduct._id,
                name: dbProduct.name,
                price: resolvedPrice,
                image: dbProduct.image,
                quantity,
                variantLabel: resolvedVariantLabel,
            };

            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = new Cart({ userId, items: [cartItem] });
            } else {
                // Match by both productId AND variantLabel so different sizes stay separate
                const existingItem = cart.items.find(
                    (item) =>
                        item.productId.toString() === cartItem.productId.toString() &&
                        (item.variantLabel || "") === resolvedVariantLabel
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
            next(err);
        }
    }
);

/* ─── GET CART ─── */
router.get("/cart", authMiddleware, async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId });
        res.json(cart || { items: [] });
    } catch (err) {
        next(err);
    }
});

/* ─── UPDATE QUANTITY ─── */
router.post(
    "/cart/update",
    authMiddleware,
    [
        body("productId").notEmpty().withMessage("productId is required"),
        body("quantity").isInt({ min: 0 }).withMessage("Quantity must be >= 0"),
        body("variantLabel").optional().isString(),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { productId, quantity, variantLabel } = req.body;
            const resolvedVariantLabel = variantLabel || "";
            const cart = await Cart.findOne({ userId: req.userId });
            if (!cart) return res.json({ success: false, message: "Cart not found" });

            const item = cart.items.find(
                (i) => i.productId.toString() === productId &&
                    (i.variantLabel || "") === resolvedVariantLabel
            );
            if (!item) return res.json({ success: false, message: "Item not found" });

            if (quantity <= 0) {
                cart.items = cart.items.filter(
                    (i) => !(i.productId.toString() === productId &&
                        (i.variantLabel || "") === resolvedVariantLabel)
                );
            } else {
                item.quantity = quantity;
            }

            await cart.save();
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
);

/* ─── REMOVE ITEM ─── */
router.post(
    "/cart/remove",
    authMiddleware,
    [
        body("productId").notEmpty().withMessage("productId is required"),
        body("variantLabel").optional().isString(),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { productId, variantLabel } = req.body;
            const resolvedVariantLabel = variantLabel || "";
            const cart = await Cart.findOne({ userId: req.userId });
            if (!cart) return res.json({ success: true });
            cart.items = cart.items.filter(
                (item) => !(item.productId.toString() === productId &&
                    (item.variantLabel || "") === resolvedVariantLabel)
            );
            await cart.save();
            res.json({ success: true, message: "Item removed" });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
