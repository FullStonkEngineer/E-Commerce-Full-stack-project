import mongoose from "mongoose";
import Product from "../models/product.model.js";

const getCartWithDetails = async (user) => {
  const productIds = user.cartItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  return products.map((product) => {
    const cartItem = user.cartItems.find(
      (item) => item.product.toString() === product._id.toString(),
    );
    return { ...product, quantity: cartItem?.quantity || 1 };
  });
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing product ID." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const user = req.user;
    if (!user.cartItems) user.cartItems = [];

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId, quantity: 1 });
    }

    await user.save();

    const cartWithDetails = await getCartWithDetails(user);
    res.json(cartWithDetails);
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({
      message: "Failed to add product to cart.",
      error: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = req.user;
    if (!user.cartItems || user.cartItems.length === 0) return res.json([]);

    const cartWithDetails = await getCartWithDetails(user);
    res.json(cartWithDetails);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      message: "Failed to fetch cart items.",
      error: error.message,
    });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing product ID." });
    }

    if (quantity == null || quantity < 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a non-negative number." });
    }

    const user = req.user;
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId,
    );

    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    if (quantity === 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId,
      );
    } else {
      existingItem.quantity = quantity;
    }

    await user.save();
    const cartWithDetails = await getCartWithDetails(user);
    res.json(cartWithDetails);
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({
      message: "Failed to update cart quantity.",
      error: error.message,
    });
  }
};

export const deleteAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!user.cartItems || user.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is already empty." });
    }

    if (!productId) {
      user.cartItems = [];
    } else {
      const exists = user.cartItems.some(
        (item) => item.product.toString() === productId,
      );
      if (!exists) {
        return res.status(404).json({ message: "Product not found in cart." });
      }
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId,
      );
    }

    await user.save();
    const cartWithDetails = await getCartWithDetails(user);
    res.json(cartWithDetails);
  } catch (error) {
    console.error("Error deleting cart items:", error);
    res.status(500).json({
      message: "Failed to delete cart items.",
      error: error.message,
    });
  }
};
