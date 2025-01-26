const { body, validationResult } = require("express-validator");

/**
 * Validate event request
 */
const validateEvent = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("date").notEmpty().withMessage("Date is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "ERROR", errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateEvent };
