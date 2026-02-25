import jwt from "jsonwebtoken";

/* ─── User Auth Middleware ─── */
export const authMiddleware = (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

/* ─── Admin Auth Middleware ─── */
export const adminMiddleware = (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ success: false, message: "No token" });
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ success: false, message: "Admin access only" });
        }
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
