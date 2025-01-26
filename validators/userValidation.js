const { body, validationResult } = require("express-validator");
const httpStatusText = require("../utils/httpStatusText");

const validateUser = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: httpStatusText.FAIL, errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateUser };
