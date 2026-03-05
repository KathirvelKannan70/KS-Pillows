import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, message: "Too many attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for admin login — 5 attempts per 15 minutes
export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many admin login attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});
