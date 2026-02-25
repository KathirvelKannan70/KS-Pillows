import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        image: String,
        quantity: Number,
      },
    ],
    address: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      pincode: String,
    },
    totalItems: Number,
    totalPrice: Number,
    status: {
      type: String,
      default: "Placed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);