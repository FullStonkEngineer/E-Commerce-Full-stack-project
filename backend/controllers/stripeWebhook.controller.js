import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";

/**
 * Stripe webhook handler for checkout session completions.
 * Ensures idempotency, validates products, and creates orders.
 *
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    // Verify webhook signature to prevent fraudulent requests
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Only handle completed checkout sessions
  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;

  try {
    // Idempotency guard: Avoid creating duplicate orders if Stripe retries webhook
    const existingOrder = await Order.findOne({
      stripeSessionId: session.id,
    });

    if (existingOrder) {
      return res.status(200).json({ received: true });
    }

    // Parse metadata: Products array and user info from session
    const products = JSON.parse(session.metadata.products || "[]");

    if (!products.length) {
      throw new Error("No products found in session metadata");
    }

    // Fetch products from DB (authoritative source)
    // Ensures correct pricing & prevents deleted products from being charged incorrectly
    const dbProducts = await Product.find({
      _id: { $in: products.map((p) => p.id) },
    });

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    // Build order line items using DB products
    // Quantity comes from Stripe metadata, price comes from DB
    const orderProducts = products.map((p) => {
      const product = productMap.get(p.id);

      if (!product) {
        throw new Error("Product missing during webhook");
      }

      return {
        product: product._id,
        quantity: p.quantity,
        price: product.price,
      };
    });

    // Create order: Stripe total is source of truth to prevent client tampering
    const newOrder = new Order({
      user: session.metadata.userId,
      products: orderProducts,
      totalAmount: session.amount_total / 100, // Convert cents to dollars
      stripeSessionId: session.id,
    });

    await newOrder.save();

    // Deactivate coupon after successful payment
    if (session.metadata.couponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: session.metadata.couponCode,
          userId: session.metadata.userId,
          isActive: true,
        },
        { isActive: false },
      );
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
};
