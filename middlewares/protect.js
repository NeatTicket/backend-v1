const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const User = require("../models/User");

/**
 * Middleware to protect routes by verifying JWT token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const protect = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createError(401, "No token, authorization denied"));
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(createError(401, "Access denied: User not found"));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(createError(401, "Token has expired"));
    }
    if (err.name === "JsonWebTokenError") {
      return next(createError(401, "Invalid token"));
    }
    return next(createError(500, "Internal server error"));
  }
};

module.exports = { protect };
