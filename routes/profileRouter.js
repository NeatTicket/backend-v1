const express = require("express");
const { protect } = require("../middlewares/protect");
const { getProfile, updateProfile, uploadProfileImage } = require("../controllers/usersController");
const upload = require("../utils/upload");
const router = express.Router();

/**
 * @route   GET /profile
 * @desc    Get the authenticated user's profile
 * @access  Private (Only authenticated users can access their profile)
 */
router.get("/", protect, getProfile);

/**
 * @route   PATCH /profile
 * @desc    Update the authenticated user's profile
 * @access  Private (Only authenticated users can update their profile)
 */
router.patch("/", protect, upload.single("profileImage"), updateProfile);

/**
 * @route   POST /profile/upload
 * @desc    Upload a profile image for the user
 * @access  Private
 */
router.post("/upload", protect, upload.single("profileImage"), uploadProfileImage);

module.exports = router;
