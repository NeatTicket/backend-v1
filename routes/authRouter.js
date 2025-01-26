const express = require("express");
const { login, register } = require("../controllers/authController");
const { validateLogin, validateRegister } = require("../validators/authValidator");
const router = express.Router();

/**
 * @route   POST /auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post("/login", validateLogin, login);

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateRegister, register);

module.exports = router;
