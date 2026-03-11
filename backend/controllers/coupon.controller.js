import Coupon from "../models/coupon.model.js";

/**
 * Retrieve the currently active coupon for the authenticated user.
 *
 * The system assumes each user can only have one active coupon at a time.
 * If a coupon exists, it is serialized before being returned to the client
 * to avoid exposing unnecessary database fields.
 */
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
    console.log("Error retrieving coupon:", error);

    res.status(500).json({
      message: "Unable to retrieve coupon. Please try again later.",
    });
  }
};

/**
 * Validate a coupon code submitted by the user.
 *
 * Validation checks:
 * 1. Coupon code must be provided
 * 2. Coupon must exist for the current user
 * 3. Coupon must still be active
 * 4. Coupon must not be expired
 *
 * If the coupon is expired, it is immediately deactivated in the database
 * to prevent future validation attempts.
 */
export const validateCoupon = async (req, res) => {
  try {
    const code = (req.body.code || "").trim();

    if (!code) {
      return res.status(400).json({
        message: "Coupon code is required.",
      });
    }

    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({
        message: "Invalid coupon code.",
      });
    }

    // Check expiration
    if (coupon.expirationDate < Date.now()) {
      coupon.isActive = false;
      await coupon.save();

      return res.status(400).json({
        message: "Coupon has expired.",
      });
    }

    res.json({
      message: "Coupon is valid.",
      coupon: serializeCoupon(coupon),
    });
  } catch (error) {
    console.log("Error validating coupon:", error);

    res.status(500).json({
      message: "Unable to validate coupon. Please try again later.",
    });
  }
};

/**
 * Serialize a coupon before sending it to the client.
 *
 * This prevents exposing internal database fields
 * such as userId or isActive while returning only
 * the information required by the frontend.
 */
function serializeCoupon(coupon) {
  return {
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
    expirationDate: coupon.expirationDate,
  };
}
