const express = require("express");
const { protect } = require("../middlewares/protect");
const authorize = require('../middlewares/authorize');
const upload = require("../middlewares/fileUpload");
const validate = require("../middlewares/validate");
const { validateUser } = require("../validators/userValidation");
const {
  getAllUsers,
  getRegularUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUser,
  deleteUser,
  uploadProfileImage,
  approveUser,
  getOperators,
} = require("../controllers/usersController");
const router = express.Router();

// Routes

/**
 * @route   GET /users
 * @desc    Get all users
 * @access  Private (Only admins can access all users)
 */
router.get("/", protect, authorize(["admin"]), getAllUsers);
router.get("/regular", protect, authorize(["admin"]), getRegularUsers);

/**
 * @route   GET /users/operators
 * @desc    Get all place_owners and event_organizers with their places/events
 * @access  Private (Admin only)
 */
router.get("/operators", protect, authorize(["admin"]), getOperators);

/**
 * @route   GET /users/:userId
 * @desc    Get a specific user by ID
 * @access  Private (Only admins or the user themselves can access)
 */
router.get("/:userId", protect, authorize(["admin", "user"]), getUserById);

/**
 * @route   POST /users
 * @desc    Create a new user
 * @access  Private (Only admins can create users)
 */
router.post("/", protect, authorize(["admin"]), validate(validateUser), createUser);

/**
 * @route   PATCH /users/:userId/role
 * @desc    Update a user's role by ID
 * @access  Private (Only admins can update roles)
 */
router.patch("/:userId/role", protect, authorize(["admin"]), updateUserRole);

/**
 * @route   PATCH /users/:userId
 * @desc    Update a user's details by ID
 * @access  Private (Only the user or admins can update details)
 */
router.patch("/:userId", protect, authorize(["admin", "user"]), updateUser);

/**
 * @route   DELETE /users/:userId
 * @desc    Delete a user by ID
 * @access  Private (Only admins can delete users)
 */
router.delete("/:userId", protect, authorize(["admin"]), deleteUser);

/**
 * @route   POST /users/:userId/upload
 * @desc    Upload a profile image for a user
 * @access  Private (Only the user can upload their profile image)
 */
router.post("/:userId/upload", protect, upload.single("image"), uploadProfileImage);

/**
 * @route   PATCH /users/:userId/approve
 * @desc    Approve a user by ID
 * @access  Private (Only admins can approve users)
 */
router.patch("/:userId/approve", protect, authorize(["admin"]), approveUser);

module.exports = router;
