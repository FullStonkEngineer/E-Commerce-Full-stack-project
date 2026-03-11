import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

/**
 * Create a Stripe Checkout session for the current user.
 *
 * This endpoint:
 * 1. Validates product list and quantities
 * 2. Fetches product details from DB to ensure correctness
 * 3. Calculates total amount
 * 4. Applies user-specific coupon if provided
 * 5. Optionally generates a new coupon for large orders
 * 6. Returns a Stripe checkout session URL
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    // Validate request payload
    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Product list is empty or invalid." });
    }

    const productIds = products.map((p) => p._id);

    // Fetch product details from database
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let totalAmount = 0;

    // Build Stripe line items and calculate total
    const lineItems = products.map((item) => {
      const product = productMap.get(item._id);

      if (!product) {
        // Fail fast if product is missing in DB
        throw new Error("Product not found in database.");
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Invalid product quantity.");
      }

      const amount = Math.round(product.price * 100); // Stripe expects cents
      totalAmount += amount * quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity,
      };
    });

    // Apply coupon if provided
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-canceled`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: coupon ? coupon.code : null,
        products: JSON.stringify(
          products.map((product) => ({
            productId: product._id,
            quantity: product.quantity,
          })),
        ),
      },
    });

    // Deactivate expired coupon
    if (coupon && coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      coupon = null;
    }

    // Reward user with a new coupon if order exceeds $200
    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    // Production-ready error: do not expose internal stack traces
    res.status(500).json({
      message: "Unable to create checkout session. Please try again later.",
    });
  }
};

/**
 * Create a one-time Stripe coupon.
 */
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

/**
 * Create a new internal coupon for the user.
 *
 * Replaces any existing coupon for the user.
 * Expires in 30 days and provides a 10% discount.
 */
async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    userId: userId,
  });

  await newCoupon.save();
  return newCoupon;
}
