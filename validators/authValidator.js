const { body, validationResult } = require("express-validator");

/**
 * Validate login request
 */
const validateLogin = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "ERROR", errors: errors.array() });
    }
    next();
  },
];

/**
 * Validate register request
 */
const validateRegister = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "ERROR", errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateLogin, validateRegister };
