const express = require("express");
const { login, register } = require("../controllers/authController");
const validate = require("../middlewares/validate");
const authValidation = require("../validators/authValidator");
const router = express.Router();

/**
 * @route   POST /auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post("/login", validate(authValidation.login), login);

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validate(authValidation.register), register);

module.exports = router;
