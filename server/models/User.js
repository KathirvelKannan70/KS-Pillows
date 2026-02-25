import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    // ✅ Admin OTP stored in DB — persists across restarts & multi-instance
    adminOtp: { type: String },
    adminOtpExpiry: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
