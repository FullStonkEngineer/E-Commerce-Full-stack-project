import express from "express";
import {
  addToCart,
  deleteAllFromCart,
  updateQuantity,
  getCart,
} from "../controllers/cart.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, deleteAllFromCart);
router.put("/:id", protectRoute, updateQuantity);
router.get("/", protectRoute, getCart);

export default router;
