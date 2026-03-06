import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { body } from "express-validator";

import User from "../models/User.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
} from "../utils/email.js";

const router = express.Router();

// Lazy Google client — reads env only when first called (after dotenv is loaded)
let _googleClient = null;
const googleClient = () => {
    if (!_googleClient) _googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    return _googleClient;
};

/* ─── SIGNUP ─── */
router.post(
    "/signup",
    authLimiter,
    [
        body("firstName").trim().notEmpty().withMessage("First name is required"),
        body("lastName").trim().notEmpty().withMessage("Last name is required"),
        body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { firstName, lastName, email, password } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.json({ success: false, message: "User already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            const user = new User({ firstName, lastName, email, password: hashedPassword, verificationToken, verificationTokenExpiry, isVerified: false });
            await user.save();

            res.json({ success: true, message: "Account created! Please check your email to verify your account before logging in." });

            sendVerificationEmail(email, firstName, verificationToken)
                .catch((err) => console.error("Verification email failed:", err.message));
        } catch (err) {
            next(err);
        }
    }
);

/* ─── VERIFY EMAIL ─── */
router.get("/verify-email/:token", async (req, res, next) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification link" });
        }
        if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
            // ✅ Delete the unverified user so they can sign up again with the same email
            await User.deleteOne({ _id: user._id });
            return res.status(400).json({
                success: false,
                message: "Verification link expired. Please sign up again with the same email.",
            });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.json({ success: true, message: "Email verified! You can now login." });

        sendWelcomeEmail(user.email, user.firstName)
            .catch((err) => console.error("Welcome email failed:", err.message));
    } catch (err) {
        next(err);
    }
});

/* ─── LOGIN ─── */
router.post(
    "/login",
    authLimiter,
    [
        body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.json({ success: false, message: "User not found" });

            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email before logging in. Check your inbox for the verification link.",
                    needsVerification: true,
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.json({ success: false, message: "Invalid password" });

            const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "7d" });

            res.json({ success: true, message: "Login successful", token, name: user.firstName, isAdmin: user.isAdmin });
        } catch (err) {
            next(err);
        }
    }
);

/* ─── GOOGLE OAUTH ─── */
router.post("/auth/google", authLimiter, async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ success: false, message: "No credential" });

        const ticket = await googleClient().verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
        const { email: rawEmail, given_name, family_name, sub: googleId } = ticket.getPayload();

        // ✅ Normalize email the SAME way express-validator normalizeEmail() does during signup
        // This prevents duplicate accounts for Gmail users (e.g. john.doe vs johndoe)
        const email = rawEmail.toLowerCase().trim();

        let user = await User.findOne({ email });
        const isNewUser = !user;

        if (!user) {
            user = new User({
                firstName: given_name || "User",
                lastName: family_name || "",
                email,
                password: await bcrypt.hash(googleId + process.env.JWT_SECRET, 10),
                isVerified: true,
            });
            await user.save();
        } else if (!user.isVerified) {
            // Existing unverified email/password user — Google proves ownership, mark verified
            user.isVerified = true;
            await user.save();
        }

        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token, name: user.firstName, isAdmin: user.isAdmin });

        if (isNewUser) {
            sendWelcomeEmail(email, given_name || "User")
                .catch((err) => console.error("Google welcome email failed:", err.message));
        }
    } catch (err) {
        // Log detailed error for debugging on server
        console.error("Google OAuth error:", err.name, err.message);
        const userMessage = err.message?.includes("Token used too late") ? "Google session expired. Please try signing in again."
            : err.message?.includes("Invalid token signature") ? "Google authentication failed. Please try again."
                : err.message?.includes("Wrong number of segments") ? "Invalid Google credential."
                    : "Google login failed. Please try again.";
        res.status(401).json({ success: false, message: userMessage });
    }
});

/* ─── FORGOT PASSWORD ─── */
router.post(
    "/forgot-password",
    authLimiter,
    [body("email").isEmail().withMessage("Valid email required").normalizeEmail()],
    validate,
    async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            // Always success to prevent email enumeration
            res.json({ success: true, message: "If that email exists, a reset link has been sent." });

            if (!user) return;

            const resetToken = crypto.randomBytes(32).toString("hex");
            user.resetToken = resetToken;
            user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
            await user.save();

            sendPasswordResetEmail(email, resetToken)
                .catch((err) => console.error("Reset email failed:", err.message));
        } catch (err) {
            next(err);
        }
    }
);

/* ─── RESET PASSWORD ─── */
router.post(
    "/reset-password",
    [
        body("token").notEmpty().withMessage("Token required"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { token, password } = req.body;
            const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
            if (!user) {
                return res.status(400).json({ success: false, message: "Invalid or expired reset link. Please request a new one." });
            }
            user.password = await bcrypt.hash(password, 10);
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save();
            res.json({ success: true, message: "Password reset successful! You can now login." });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
