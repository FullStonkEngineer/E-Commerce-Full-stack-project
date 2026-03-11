import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // User who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ordered products snapshot
    // Price is stored to preserve historical accuracy
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // Final order total
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Stripe checkout session ID
    // Used to guarantee webhook idempotency
    stripeSessionId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

/*
Optimizes analytics queries that filter by date range.
*/
orderSchema.index({ createdAt: 1 });

/*
Optimizes queries that retrieve a user's order history.
*/
orderSchema.index({ user: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
