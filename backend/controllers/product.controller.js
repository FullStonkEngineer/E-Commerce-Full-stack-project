import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    res.json({ success: true, data: { products } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const cached = await redis.get("featured_products");
    if (cached) {
      return res.json({
        success: true,
        data: { products: JSON.parse(cached) },
      });
    }

    const featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (featuredProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No featured products found",
      });
    }

    await redis.set(
      "featured_products",
      JSON.stringify(featuredProducts),
      "EX",
      60 * 60,
    );

    res.json({ success: true, data: { products: featuredProducts } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
    });

    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    await updateFeaturedProductsCache();

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 4 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json({ success: true, data: { products } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category }).lean();
    res.json({ success: true, data: { products } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();
    await updateFeaturedProductsCache();

    res.json({ success: true, data: { product: updatedProduct } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set(
      "featured_products",
      JSON.stringify(featuredProducts),
      "EX",
      60 * 60,
    );
  } catch (error) {}
}
