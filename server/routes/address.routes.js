import express from "express";
import { body, param } from "express-validator";

import Address from "../models/Address.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const addressValidation = [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("phone")
        .trim()
        .customSanitizer((val) => val.replace(/[\s\-().+]/g, ""))
        .matches(/^[0-9]{10}$/)
        .withMessage("Valid 10-digit phone number is required"),
    body("street").trim().notEmpty().withMessage("Street is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("pincode")
        .trim()
        .customSanitizer((val) => val.replace(/\s/g, ""))
        .matches(/^[0-9]{6}$/)
        .withMessage("Valid 6-digit pincode is required"),
];

/* ─── ADD ADDRESS ─── */
router.post("/address/add", authMiddleware, addressValidation, validate, async (req, res, next) => {
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
        next(err);
    }
});

/* ─── GET ADDRESSES ─── */
router.get("/address", authMiddleware, async (req, res, next) => {
    try {
        const addresses = await Address.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, addresses });
    } catch (err) {
        next(err);
    }
});

/* ─── DELETE ADDRESS ─── */
router.delete(
    "/address/:id",
    authMiddleware,
    [param("id").isMongoId().withMessage("Invalid address ID")],
    validate,
    async (req, res, next) => {
        try {
            await Address.findOneAndDelete({ _id: req.params.id, userId: req.userId });
            res.json({ success: true, message: "Address deleted" });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
