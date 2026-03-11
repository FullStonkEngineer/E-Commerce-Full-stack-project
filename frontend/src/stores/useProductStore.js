import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

/**
 * Extract a user-friendly error message from an Axios error object.
 * Falls back to a generic message if the response does not include one.
 */
const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

/**
 * Product store
 *
 * Responsibilities:
 * - Manage product state in the frontend
 * - Handle product CRUD operations
 * - Fetch filtered product collections
 * - Surface API errors to the UI
 *
 * Notes:
 * - Actions update local state after successful API calls to avoid unnecessary refetches.
 * - Errors are stored in state and also surfaced through toast notifications.
 */

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  /**
   * Replace the current product list in state.
   */
  setProducts: (products) => set({ products }),

  /**
   * Create a new product.
   * Adds the returned product to the local state on success.
   */
  createProduct: async (productData) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.post("/products", productData);

      set((state) => ({
        products: [...state.products, res.data],
        loading: false,
      }));

      toast.success("Product created successfully");
      return res.data;
    } catch (error) {
      const message = getErrorMessage(error);

      set({ loading: false, error: message });
      toast.error(message);

      throw error;
    }
  },

  /**
   * Delete a product by ID.
   * Removes the product from local state after successful deletion.
   */
  deleteProduct: async (productId) => {
    set({ loading: true, error: null });

    try {
      await axios.delete(`/products/${productId}`);

      set((state) => ({
        products: state.products.filter((p) => p._id !== productId),
        loading: false,
      }));

      toast.success("Product deleted successfully");
    } catch (error) {
      const message = getErrorMessage(error);

      set({ loading: false, error: message });
      toast.error(message);
    }
  },

  /**
   * Fetch all products from the API.
   */
  fetchAllProducts: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get("/products");

      set({
        products: res.data.products,
        loading: false,
      });

      return res.data.products;
    } catch (error) {
      const message = getErrorMessage(error);

      set({ loading: false, error: message });
      toast.error(message);

      return [];
    }
  },

  /**
   * Toggle the featured flag for a product.
   * Updates the product in local state with the returned value.
   */
  toggleFeatured: async (productId) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.patch(`/products/${productId}`);
      const { isFeatured } = res.data;

      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId ? { ...p, isFeatured } : p,
        ),
        loading: false,
      }));

      toast.success("Product updated successfully");
    } catch (error) {
      const message = getErrorMessage(error);

      set({ loading: false, error: message });
      toast.error(message);
    }
  },

  /**
   * Fetch products by category.
   */
  fetchByCategory: async (category) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get(`/products/category/${category}`);

      set({
        products: res.data.products,
        loading: false,
      });

      return res.data.products;
    } catch (error) {
      const message = getErrorMessage(error);

      set({ loading: false, error: message });
      toast.error(message);

      return [];
    }
  },

  /**
   * Fetch featured products for the homepage.
   */
  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get("/products/featured");

      set({
        products: res.data.products,
        loading: false,
      });

      return res.data.products;
    } catch (error) {
      const message = getErrorMessage(error);

      set({ loading: false, error: message });
      toast.error(message);

      return [];
    }
  },
}));
