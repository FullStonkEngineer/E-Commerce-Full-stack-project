import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  setProducts: (products) => set({ products }),

  // Create a product
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

  // Delete a product
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

  // Fetch all products
  fetchAllProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.products, loading: false });
      return res.data.products;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message });
      toast.error(message);
      return [];
    }
  },

  // Toggle featured flag
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

  // Fetch by category
  fetchByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/products/category/${category}`);
      set({ products: res.data.products, loading: false });
      return res.data.products;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message });
      toast.error(message);
      return [];
    }
  },

  // Fetch featured products
  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/products/featured");
      set({ products: res.data, loading: false });
      return res.data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message });
      toast.error(message);
      return [];
    }
  },
}));
