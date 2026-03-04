import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  loading: false,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const res = await axios.get("/coupons");
      set({ coupon: res.data });
      return res.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },

  applyCoupon: async (code) => {
    try {
      const res = await axios.post("/coupons/validate", { code });
      set({ coupon: res.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
      return res.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  getCartItems: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data, loading: false });
      get().calculateTotals();
      return res.data;
    } catch (error) {
      set({ cart: [], loading: false });
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },

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
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },

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

  removeFromCart: async (productId) => {
    try {
      await axios.delete("/cart", { data: { productId } });
      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));
      get().calculateTotals();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },

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

  clearCart: async () => {
    set({
      cart: [],
      coupon: null,
      total: 0,
      subtotal: 0,
      isCouponApplied: false,
    });
  },
}));
