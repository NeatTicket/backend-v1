const createError = require("http-errors");

/**
 * Middleware to authorize access based on user roles.
 * @param {Array<string>} roles - Array of allowed roles.
 * @returns {Function} - Express middleware function.
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(createError(403, "You are not authorized to access this resource"));
    }
    next();
  };
};

module.exports = authorize;
