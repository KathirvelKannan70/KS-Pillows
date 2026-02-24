// Migrate existing users — mark all as verified so they can still login
// Run: node scripts/migrateVerified.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGO_URI);
const result = await User.updateMany(
    { isVerified: { $ne: true } },
    { $set: { isVerified: true } }
);
console.log(`✅ Migrated ${result.modifiedCount} existing users to isVerified: true`);
await mongoose.disconnect();
process.exit(0);
