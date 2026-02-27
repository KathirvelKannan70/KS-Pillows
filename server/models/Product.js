import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    productCode: { type: String, required: true },
    category: { type: String, required: true }, // slug
    price: { type: Number, required: true },
    size: String,
    weight: String,
    description: String,
    image: String,
    images: { type: [String], default: [] }, // multiple images for carousel
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);