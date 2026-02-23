import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  createProduct: async (productData) => {
    set({ loading: true });
    console.log("trying to create product now");
    try {
      const res = await axios.post("/products", productData);
      set((previousState) => ({
        products: [...previousState.products, res.data],
        loading: false,
      }));
      toast.success("Product created successfully");
    } catch (error) {
      toast.error(error.response.data.message || "Something went wrong");
      set({ loading: false });
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      const res = await axios.delete(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.filter(
          (product) => product._id !== productId,
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: "failed to delete product", loading: false });
      toast.error(error.response.data.message || "Something went wrong");
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.products, loading: false });
    } catch (error) {
      set({ error: "failed to fetch products", loading: false });
      toast.error(error.response.data.message || "Something went wrong");
    }
  },

  toggleFeatured: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === productId
            ? {
                ...product,
                isFeatured: response.data.isFeatured,
              }
            : product,
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "Something went wrong");
    }
  },

  fetchByCategory: async (category) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/products/category/${category}`);
      set({ products: res.data.products, loading: false });
    } catch (error) {
      set({ error: "failed to fetch products", loading: false });
      toast.error(error.response.data.message || "Something went wrong");
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`/products/featured`);
      set({ products: res.data, loading: false });
    } catch (error) {
      set({ error: "failed to fetch products", loading: false });
      toast.error(error.response.data.message || "Something went wrong");
    }
  },
}));
