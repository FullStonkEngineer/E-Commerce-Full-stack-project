import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Product display name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Product description shown on product page
    description: {
      type: String,
      required: true,
    },

    // Product price stored as decimal number
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Image URL (Cloudinary / CDN)
    image: {
      type: String,
      required: [true, "Image is required"],
    },

    // Product category used for browsing/filtering
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Determines whether product appears in featured section
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
/*
Optimizes category browsing.
*/
productSchema.index({ category: 1 });

/*
Optimizes featured product queries.
*/
productSchema.index({ isFeatured: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
