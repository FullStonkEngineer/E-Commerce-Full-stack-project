import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // Coupon code entered by the user at checkout
    // Unique across the entire system
    code: {
      type: String,
      required: true,
      unique: true, // creates an index automatically
    },

    // Discount percentage applied to the order
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Coupon expiration timestamp
    expirationDate: {
      type: Date,
      required: true,
    },

    // Indicates whether the coupon can still be used
    // Expired or redeemed coupons are marked inactive
    isActive: {
      type: Boolean,
      default: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

/*
Main lookup index for coupon validation and redemption.
This is the most common lookup pattern during checkout and webhooks.
*/
couponSchema.index({ code: 1, userId: 1, isActive: 1 });

/*
Index for retrieving a user's active coupon.
*/
couponSchema.index({ userId: 1, isActive: 1 });

/*
Partial unique index.

Guarantees that a user can only have ONE active coupon
while still allowing multiple historical coupons.

*/
couponSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
