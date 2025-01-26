const express = require("express");
const { protect } = require("../middlewares/protect");
const { getProfile, updateProfile } = require("../controllers/usersController");
const router = express.Router();

/**
 * @route   GET /profile
 * @desc    Get the authenticated user's profile
 * @access  Private (Only authenticated users can access their profile)
 */
router.get("/", protect, getProfile);

/**
 * @route   PUT /profile
 * @desc    Update the authenticated user's profile
 * @access  Private (Only authenticated users can update their profile)
 */
router.put("/", protect, updateProfile);

module.exports = router;
