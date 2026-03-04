import Coupon from "../models/coupon.model.js";

export const getCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    res.json({
      coupon: coupon ? serializeCoupon(coupon) : null,
    });
  } catch (error) {
    console.log("Error in getting coupons:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// TODO: Separate validate coupon from check coupon expiration date
export const validateCoupon = async (req, res) => {
  try {
    const code = (req.body.code || "").trim();
    if (!code)
      return res.status(400).json({ message: "Coupon code is required." });

    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    if (coupon.expirationDate < Date.now()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon has expired" });
    }
    res.json({
      message: "Coupon is valid",
      coupon: serializeCoupon(coupon),
    });
  } catch (error) {
    console.log("Error in validating coupon:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

function serializeCoupon(coupon) {
  return {
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
    expirationDate: coupon.expirationDate,
  };
}
