import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "Small", "Medium"
    size: { type: String, default: "" },
    weight: { type: String, default: "" },
    price: { type: Number, required: true },
  },
  { _id: false }
);

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
    stock: { type: Number, default: 999 }, // inventory tracking
    variants: { type: [variantSchema], default: [] }, // size/price variants
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);