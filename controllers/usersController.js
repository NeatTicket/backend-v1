const User = require("../models/User");
const Place = require("../models/Place");
const Event = require("../models/Event");
const bcrypt = require("bcrypt");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const allowedRoles = ["user", "place_owner", "event_organizer", "admin"];

const toDataUrl = (file) => {
  if (!file?.buffer || !file?.mimetype) return "";
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

const ensureSelfOrAdmin = (requestUser, targetUserId) => {
  return requestUser.role === "admin" || requestUser._id.toString() === targetUserId.toString();
};

/**
 * Get all place_owners and event_organizers with their owned places/events
 */
const getOperators = asyncWrapper(async (req, res) => {
  const operators = await User.find({
    role: { $in: ["place_owner", "event_organizer"] },
  }).select("-password");

  const enriched = await Promise.all(
    operators.map(async (user) => {
      const obj = user.toJSON();
      if (user.role === "place_owner") {
        obj.places = await Place.find({ owner: user._id }).select("name location isApproved");
      } else if (user.role === "event_organizer") {
        obj.events = await Event.find({ organizer: user._id }).select("name date place").populate("place", "name");
      }
      return obj;
    })
  );

  res.json({ status: httpStatusText.SUCCESS, data: { operators: enriched } });
});

/**
 * Get all users
 */
const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find().select("-password");
  res.json({ status: "SUCCESS", data: { users } });
});

const getRegularUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.json({ status: "SUCCESS", data: { users } });
});

/**
 * Get a specific user by ID
 */
const getUserById = asyncWrapper(async (req, res, next) => {
  if (!ensureSelfOrAdmin(req.user, req.params.userId)) {
    throw new AppError("Not authorized to access this user", 403, httpStatusText.FAIL);
  }

  const user = await User.findById(req.params.userId).select("-password");
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }
  res.json({ status: "SUCCESS", data: { user } });
});

/**
 * Create a new user
 */
const createUser = asyncWrapper(async (req, res, next) => {
  const { email, password, firstName, lastName, role = "user" } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ status: "ERROR", message: "User already exists" });
  }

  if (!allowedRoles.includes(role)) {
    throw new AppError("Invalid role", 400, httpStatusText.FAIL);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role,
  });
  await newUser.save();

  const userResponse = await User.findById(newUser._id).select("-password");
  res.status(201).json({ status: "SUCCESS", data: { user: userResponse } });
});

/**
 * Update a user's role by ID
 */
const updateUserRole = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!allowedRoles.includes(role)) {
    throw new AppError("Invalid role", 400, httpStatusText.FAIL);
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }

  user.role = role;
  await user.save();

  res.json({ status: "SUCCESS", data: { user } });
});

/**
 * Update a user's details by ID
 */
const updateUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { firstName, lastName, email } = req.body;

  if (!ensureSelfOrAdmin(req.user, userId)) {
    throw new AppError("Not authorized to update this user", 403, httpStatusText.FAIL);
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;

  await user.save();

  res.json({ status: "SUCCESS", data: { user } });
});

/**
 * Delete a user by ID
 */
const deleteUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  // Check permissions: Admin or User themselves
  if (!ensureSelfOrAdmin(req.user, userId)) {
    throw new AppError("Not authorized to delete this user", 403, httpStatusText.FAIL);
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }

  // Cascading deletions: 
  if (user.role === "place_owner") {
    // Delete all places owned by this user
    await Place.deleteMany({ owner: userId });
  } else if (user.role === "event_organizer") {
    // Delete all events organized by this user
    await Event.deleteMany({ organizer: userId });
  }

  // Delete the actual user record
  await User.deleteOne({ _id: userId });

  res.json({ status: "SUCCESS", data: null, message: "User and linked data deleted successfully" });
});

/**
 * Upload a profile image for a user
 */
const uploadProfileImage = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id; // Default to self

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }

  if (req.file) {
    user.profileImage = toDataUrl(req.file);
    await user.save();
  }

  res.json({ status: "SUCCESS", data: { user } });
});

/**
 * Approve a user by ID
 */
const approveUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { isApproved, role } = req.body;

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }

  // Update isApproved to the new value from body (or keep old if not provided)
  if (isApproved !== undefined) user.isApproved = isApproved;

  // Only update role if a valid role is provided in the body
  if (role && ["place_owner", "event_organizer"].includes(role)) {
    user.role = role;
  }

  await user.save();

  res.json({ status: "SUCCESS", data: { user } });
});


/**
 * Get the authenticated user's profile
 */
const getProfile = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }
  res.json({ status: "SUCCESS", data: { user } });
});

const updateProfile = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;

  if (req.file) {
    user.profileImage = toDataUrl(req.file);
  }

  if (password && password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  // Return user without password
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({ status: "SUCCESS", data: { user: userResponse } });
});

module.exports = {
  getAllUsers,
  getRegularUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUser,
  deleteUser,
  uploadProfileImage,
  approveUser,
  getProfile,
  updateProfile,
  getOperators,
};
