import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import { stripeWebhook } from "../controllers/stripeWebhook.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);
export default router;
