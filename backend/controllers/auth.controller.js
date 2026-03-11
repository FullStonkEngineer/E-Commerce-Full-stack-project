import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Standard cookie configuration used for authentication tokens.
 * Cookies are httpOnly to prevent XSS access from client-side JS.
 */
const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict",
  maxAge,
});

/**
 * Generates short-lived access tokens and long-lived refresh tokens.
 *
 * Access token:
 * - Used for authenticating API requests
 * - Short lifespan (15 minutes) to reduce impact if compromised
 *
 * Refresh token:
 * - Used only to generate new access tokens
 * - Stored server-side in Redis for validation
 */
const generateTokens = (userId) => {
  const accessTokenCookie = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  const refreshTokenCookie = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );

  return { accessTokenCookie, refreshTokenCookie };
};

/**
 * Stores refresh tokens in Redis so they can be invalidated server-side.
 * This allows forced logout and protection against token replay attacks.
 */
const storeRefreshToken = async (userId, refreshTokenCookie) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshTokenCookie,
    "EX",
    7 * 24 * 60 * 60,
  );
};

/**
 * Attaches authentication cookies to the response.
 */
const setCookies = (res, accessTokenCookie, refreshTokenCookie) => {
  res.cookie("accessToken", accessTokenCookie, cookieOptions(15 * 60 * 1000));

  res.cookie(
    "refreshToken",
    refreshTokenCookie,
    cookieOptions(7 * 24 * 60 * 60 * 1000),
  );
};

/**
 * POST /api/auth/signup
 *
 * Creates a new user account and logs them in immediately.
 */
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password });

    const { accessTokenCookie, refreshTokenCookie } = generateTokens(user._id);

    await storeRefreshToken(user._id, refreshTokenCookie);

    setCookies(res, accessTokenCookie, refreshTokenCookie);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Mongo duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    res.status(500).json({
      message: "Unable to create account. Please try again later.",
    });
  }
};

/**
 * POST /api/auth/login
 *
 * Authenticates a user and issues access + refresh tokens.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const { accessTokenCookie, refreshTokenCookie } = generateTokens(user._id);

    await storeRefreshToken(user._id, refreshTokenCookie);

    setCookies(res, accessTokenCookie, refreshTokenCookie);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Unable to log in at this time.",
    });
  }
};

/**
 * POST /api/auth/logout
 *
 * Invalidates the stored refresh token and clears cookies.
 */
export const logout = async (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (refreshTokenCookie) {
      const decoded = jwt.verify(
        refreshTokenCookie,
        process.env.REFRESH_TOKEN_SECRET,
      );

      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    res.status(500).json({ message: "Server error." });
  }
};

/**
 * POST /api/auth/refresh-token
 *
 * Generates a new access token using a valid refresh token.
 */
export const refreshTokenController = async (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const decoded = jwt.verify(
      refreshTokenCookie,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    // Ensure token matches the one stored server-side
    if (storedToken !== refreshTokenCookie) {
      return res.status(401).json({
        message: "Unauthorized session.",
      });
    }

    const accessTokenCookie = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", accessTokenCookie, cookieOptions(15 * 60 * 1000));

    res.json({ message: "Access token refreshed." });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /api/auth/profile
 *
 * Returns the currently authenticated user's profile.
 * User data is attached to the request by authentication middleware.
 */
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Profile fetch error:", error);

    res.status(500).json({
      message: "Unable to fetch profile. Please try again later.",
    });
  }
};
