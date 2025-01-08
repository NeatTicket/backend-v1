const { body } = require("express-validator");

const validatonSchema = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("title is required")
      .isLength({ min: 2 })
      .withMessage("title is at leaset 2 digits"),
    body("price").notEmpty().withMessage("price is required"),
  ];
};

module.exports = validatonSchema;
