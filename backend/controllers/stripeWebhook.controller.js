import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";

// re-fetch products in the webhook to guard against tampered metadata and deleted products,
// while still trusting Stripe for the final amount
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;

  try {
    /**
     * 1️⃣ Idempotency guard
     */
    const existingOrder = await Order.findOne({
      stripeSessionId: session.id,
    });

    if (existingOrder) {
      return res.status(200).json({ received: true });
    }

    /**
     * 2️⃣ Parse metadata
     */
    const products = JSON.parse(session.metadata.products || "[]");

    if (!products.length) {
      throw new Error("No products found in session metadata");
    }

    /**
     * 3️⃣ Fetch products from DB (authoritative pricing & existence)
     */
    const dbProducts = await Product.find({
      _id: { $in: products.map((p) => p.id) },
    });

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    /**
     * 4️⃣ Build order line items using DB products
     */
    const orderProducts = products.map((p) => {
      const product = productMap.get(p.id);

      if (!product) {
        throw new Error("Product missing during webhook");
      }

      return {
        product: product._id,
        quantity: p.quantity,
        price: product.price, // DB price wins
      };
    });

    /**
     * 5️⃣ Create order (Stripe total is source of truth)
     */
    const newOrder = new Order({
      user: session.metadata.userId,
      products: orderProducts,
      totalAmount: session.amount_total / 100,
      stripeSessionId: session.id,
    });

    await newOrder.save();

    /**
     * 6️⃣ Deactivate coupon AFTER successful payment
     */
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
