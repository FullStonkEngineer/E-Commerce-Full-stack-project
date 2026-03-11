import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";

/**
 * Get all products.
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    res.json({ products });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch products. Please try again later." });
  }
};

/**
 * Get featured products.
 */
export const getFeaturedProducts = async (req, res) => {
  try {
    const cached = await redis.get("featured_products");
    if (cached) {
      return res.json({ products: JSON.parse(cached) });
    }

    const featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set(
      "featured_products",
      JSON.stringify(featuredProducts),
      "EX",
      60 * 60,
    );

    res.json({ products: featuredProducts });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      message: "Unable to fetch featured products. Please try again later.",
    });
  }
};

/**
 * Create a new product.
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Product image is required." });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Unable to create product. Please try again later." });
  }
};

/**
 * Delete a product by ID.
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    await Product.findByIdAndDelete(req.params.id);
    await updateFeaturedProductsCache();

    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Unable to delete product. Please try again later." });
  }
};

/**
 * Get 4 recommended products randomly.
 */
export const getRecommendedProducts = async (req, res) => {
  try {
    const recommendations = await Product.aggregate([
      { $sample: { size: 4 } },
      { $project: { _id: 1, name: 1, description: 1, image: 1, price: 1 } },
    ]);

    res.json({ recommendations });
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    res.status(500).json({
      message: "Unable to fetch recommended products. Please try again later.",
    });
  }
};

/**
 * Get products by category.
 */
export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category }).lean();
    res.json({ products });
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    res.status(500).json({
      message:
        "Unable to fetch products for this category. Please try again later.",
    });
  }
};

/**
 * Toggle the "featured" status of a product.
 */
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();
    await updateFeaturedProductsCache();

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error("Error toggling featured product:", error);
    res.status(500).json({
      message: "Unable to update featured status. Please try again later.",
    });
  }
};

/**
 * Update the Redis cache for featured products.
 */
async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set(
      "featured_products",
      JSON.stringify(featuredProducts),
      "EX",
      60 * 60,
    );
  } catch (error) {
    console.error("Error updating featured products cache:", error);
  }
}
