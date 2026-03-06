// 🧹 Full DB cleanup — deletes all test data, keeps admin + products
// Run: node scripts/cleanupDB.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected ✅\n");

// Delete all non-admin users
const users = await User.deleteMany({ isAdmin: { $ne: true } });
console.log(`🗑️  Users deleted:     ${users.deletedCount}`);

// Delete all orders
const orders = await Order.deleteMany({});
console.log(`🗑️  Orders deleted:    ${orders.deletedCount}`);

// Delete all carts
const carts = await Cart.deleteMany({});
console.log(`🗑️  Carts deleted:     ${carts.deletedCount}`);

// Delete all addresses
const addresses = await Address.deleteMany({});
console.log(`🗑️  Addresses deleted: ${addresses.deletedCount}`);

// Confirm admin still exists
const admin = await User.findOne({ isAdmin: true });
console.log(`\n✅ Admin kept: ${admin?.email || "⚠️  No admin found!"}`);

await mongoose.disconnect();
console.log("\nCleanup complete — fresh start! 🚀");
process.exit(0);
