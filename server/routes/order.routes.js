import express from "express";
import { body, param } from "express-validator";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";

const router = express.Router();

/* ─── CREATE ORDER ─── */
router.post(
    "/orders/create",
    authMiddleware,
    [body("addressId").isMongoId().withMessage("Valid addressId is required")],
    validate,
    async (req, res, next) => {
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
            const totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

            res.json({ success: true, message: "Order placed successfully", orderId: order._id });

            // Send order confirmation email in background
            User.findById(userId)
                .select("firstName email")
                .then((user) => {
                    if (user) {
                        sendOrderConfirmationEmail(user.email, user.firstName, order).catch((err) =>
                            console.error("Order confirmation email failed:", err.message)
                        );
                    }
                })
                .catch(() => { });
        } catch (err) {
            next(err);
        }
    }
);

/* ─── GET USER ORDERS ─── */
router.get("/orders", authMiddleware, async (req, res, next) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        next(err);
    }
});

/* ─── CANCEL ORDER (user-initiated, only if status is "Placed") ─── */
router.post(
    "/orders/:id/cancel",
    authMiddleware,
    [param("id").isMongoId().withMessage("Invalid order ID")],
    validate,
    async (req, res, next) => {
        try {
            const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }
            if (order.status !== "Placed") {
                return res.status(400).json({
                    success: false,
                    message: `Order cannot be cancelled. Current status: ${order.status}`,
                });
            }

            order.status = "Cancelled";
            await order.save();

            res.json({ success: true, message: "Order cancelled successfully", order });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
