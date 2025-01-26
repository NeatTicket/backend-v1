const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const User = require("../models/User");

/**
 * Middleware to protect routes and verify JWT token.
 * @param {Array<string>} roles - Array of allowed roles (optional).
 * @returns {Function} - Express middleware function.
 */
const protect = (roles = []) => {
  return async (req, res, next) => {
    // Extract token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(401, "Access denied: No token provided"));
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return next(createError(401, "Access denied: No token provided"));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from database
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(createError(401, "Access denied: User not found"));
      }

      req.user = user;

      // Check if user has the required role
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return next(createError(403, "Forbidden: Insufficient permissions"));
      }

      // Proceed to the next middleware/route handler
      next();
    } catch (err) {
      // Handle token verification errors
      if (err.name === "TokenExpiredError") {
        return next(createError(401, "Access denied: Token has expired"));
      }
      if (err.name === "JsonWebTokenError") {
        return next(createError(401, "Access denied: Invalid token"));
      }
      return next(createError(500, "Internal server error"));
    }
  };
};

module.exports = { protect };
