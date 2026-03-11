import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

/**
 * Extract a readable error message from Axios errors.
 */
const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

/**
 * Global cart store using Zustand.
 *
 * Responsibilities:
 * - Manage cart items
 * - Handle coupon logic
 * - Calculate totals
 * - Sync cart state with backend API
 *
 * Design considerations:
 * - Optimistic updates are used for quantity changes to improve UX.
 * - Totals are recalculated locally to avoid unnecessary API calls.
 * - Errors are surfaced to the user via toast notifications.
 */

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  loading: false,
  isCouponApplied: false,

  /**
   * Fetch the current user's active coupon from the backend.
   */
  getMyCoupon: async () => {
    try {
      const res = await axios.get("/coupons");
      set({ coupon: res.data.coupon });
      return res.data.coupon;
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  /**
   * Apply a coupon code to the cart.
   * Updates totals after successful validation.
   */
  applyCoupon: async (code) => {
    try {
      const res = await axios.post("/coupons/validate", { code });

      set({
        coupon: res.data.coupon,
        isCouponApplied: true,
      });

      get().calculateTotals();
      toast.success("Coupon applied successfully");

      return res.data.coupon;
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  /**
   * Remove the currently applied coupon and recalculate totals.
   */
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  /**
   * Fetch cart items from the backend.
   */
  getCartItems: async () => {
    set({ loading: true });

    try {
      const res = await axios.get("/cart");

      set({
        cart: res.data,
        loading: false,
      });

      get().calculateTotals();
      return res.data;
    } catch (error) {
      set({ cart: [], loading: false });
      toast.error(getErrorMessage(error));
    }
  },

  /**
   * Add a product to the cart.
   * If it already exists, increment its quantity.
   */
  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id,
        );

        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...prevState.cart, { ...product, quantity: 1 }];

        return { cart: newCart };
      });

      toast.success("Product added to cart");
      get().calculateTotals();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  /**
   * Calculate subtotal and total prices.
   * Coupon discounts are applied if present.
   */
  calculateTotals: () => {
    const { cart, coupon } = get();

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );

    const total = coupon
      ? subtotal - (subtotal * (coupon.discountPercentage || 0)) / 100
      : subtotal;

    set({ subtotal, total });
  },

  /**
   * Remove a product from the cart.
   */
  removeFromCart: async (productId) => {
    try {
      await axios.delete("/cart", { data: { productId } });

      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));

      get().calculateTotals();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  /**
   * Update the quantity of a product in the cart.
   * Uses optimistic updates for faster UI feedback.
   * If the request fails, the cart is re-fetched from the backend.
   */
  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) return get().removeFromCart(productId);

    // Optimistic update
    set((prevCartState) => ({
      cart: prevCartState.cart.map((item) =>
        item._id === productId ? { ...item, quantity } : item,
      ),
    }));

    get().calculateTotals();

    try {
      await axios.put(`/cart/${productId}`, { quantity });
    } catch (error) {
      toast.error(getErrorMessage(error));
      get().getCartItems();
    }
  },

  /**
   * Clear the entire cart and reset related state.
   */
  clearCart: async () => {
    try {
      await axios.delete("/cart");

      set({
        cart: [],
        coupon: null,
        total: 0,
        subtotal: 0,
        isCouponApplied: false,
      });

      toast.success("Cart cleared");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },
}));
