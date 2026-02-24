// ✅ One-time script — run once to grant admin access
// Usage: node scripts/makeAdmin.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const email = "kstraders1509@gmail.com";

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const result = await User.findOneAndUpdate(
            { email },
            { $set: { isAdmin: true } },
            { new: true }
        );

        if (!result) {
            console.log(`❌ No user found with email: ${email}`);
            console.log("   Make sure you have signed up first.");
        } else {
            console.log(`✅ Admin granted to: ${result.email}`);
        }
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}

makeAdmin();
