import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Middleware to protect routes that require authentication.
 * Verifies JWT access token and attaches the corresponding user to req.user.
 *
 */
export const protectRoute = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      message: "Unauthorized - No access token provided",
    });
  }

  try {
    // Verify JWT token using server secret
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Fetch user from DB to ensure token corresponds to a valid user
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
      });
    }

    // Attach user to request for downstream route handlers
    req.user = user;
    next();
  } catch (err) {
    // Handle expired token explicitly
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Unauthorized - Access token expired",
      });
    }

    // Default: invalid token
    return res.status(401).json({
      message: "Unauthorized - Invalid token",
    });
  }
};

/**
 * Middleware to protect admin-only routes.
 * Checks if authenticated user has admin role.
 */
export const adminRoute = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admins only" });
  }

  next();
};
