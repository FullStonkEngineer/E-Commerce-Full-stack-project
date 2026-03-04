import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const cookieOptions = (mA) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: mA,
});

const generateTokens = (userId) => {
  const accessTokenCookie = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const refreshTokenCookie = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return { accessTokenCookie, refreshTokenCookie };
};

const storeRefreshToken = async (userId, refreshTokenCookie) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshTokenCookie,
    "EX",
    7 * 24 * 60 * 60,
  );
};

const setCookies = (res, accessTokenCookie, refreshTokenCookie) => {
  res.cookie("accessToken", accessTokenCookie, cookieOptions(15 * 60 * 1000));
  res.cookie(
    "refreshToken",
    refreshTokenCookie,
    cookieOptions(7 * 24 * 60 * 60 * 1000),
  );
};

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    // Authentication
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
      message: "User signed up successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    res
      .status(500)
      .json({ message: "Unable to create account, please try again later" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessTokenCookie, refreshTokenCookie } = generateTokens(
        user._id,
      );
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
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

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
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      refreshTokenCookie,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshTokenCookie) {
      return res.status(401).json({
        message: "Unauthorized, Stored token is not equal to refresh token",
      });
    }

    const accessTokenCookie = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", accessTokenCookie, cookieOptions(15 * 60 * 1000));

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch profile, please try again later" });
  }
};
