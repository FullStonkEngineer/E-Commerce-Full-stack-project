import mongoose from "mongoose";
import Product from "../models/product.model.js";

/**
 * Helper function that saturates the cart with full product data.
 *
 * The user document stores only:
 *   - productId
 *   - quantity
 *
 * This function fetches the matching Product documents and merges them
 * with the quantities stored in the user's cart.
 */
const getCartWithDetails = async (user) => {
  const productIds = user.cartItems.map((item) => item.product);

  // Fetch all products referenced in the cart
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  // Merge product data with stored cart quantity
  return products.map((product) => {
    const cartItem = user.cartItems.find(
      (item) => item.product.toString() === product._id.toString(),
    );

    return { ...product, quantity: cartItem?.quantity || 1 };
  });
};

/**
 * Add a product to the user's cart.
 *
 * Behaviour:
 * - If the product already exists in the cart, increment quantity
 * - Otherwise create a new cart item
 */
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate provided product id
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing product ID." });
    }

    // Ensure the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const user = req.user;

    // Ensure cart structure exists
    if (!user.cartItems) user.cartItems = [];

    // Check if the item is already present in the cart
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
      message: "Unable to add product to cart. Please try again later.",
    });
  }
};

/**
 * Retrieve the current user's cart.
 *
 * Returns the cart with full product details.
 */
export const getCart = async (req, res) => {
  try {
    const user = req.user;

    // If the cart is empty, return an empty array
    if (!user.cartItems || user.cartItems.length === 0) {
      return res.json([]);
    }

    const cartWithDetails = await getCartWithDetails(user);
    res.json(cartWithDetails);
  } catch (error) {
    console.error("Error fetching cart:", error);

    res.status(500).json({
      message: "Unable to retrieve cart items. Please try again later.",
    });
  }
};

/**
 * Update the quantity of a specific cart item.
 *
 * Behaviour:
 * - quantity = 0 → remove the item
 * - quantity > 0 → update the quantity
 */
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;

    // Validate product id
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing product ID." });
    }

    // Validate quantity
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
      // Remove item if quantity becomes zero
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
      message: "Unable to update cart quantity. Please try again later.",
    });
  }
};

/**
 * Remove items from the cart.
 *
 * Behaviour:
 * - If no productId is provided → clear the entire cart
 * - If productId is provided → remove only that item
 */
export const deleteAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!user.cartItems || user.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is already empty." });
    }

    if (!productId) {
      // Clear the entire cart
      user.cartItems = [];
    } else {
      const exists = user.cartItems.some(
        (item) => item.product.toString() === productId,
      );

      if (!exists) {
        return res.status(404).json({ message: "Product not found in cart." });
      }

      // Remove only the specified product
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
      message: "Unable to delete cart items. Please try again later.",
    });
  }
};
