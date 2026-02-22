import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  price: Number,
  image: String,
  quantity: Number,
});

const cartSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
});

export default mongoose.model("Cart", cartSchema);