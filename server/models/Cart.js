import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
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
      variantLabel: { type: String, default: "" }, // e.g. "Small", "Medium"
    },
  ],
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);