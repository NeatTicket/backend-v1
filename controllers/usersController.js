const User = require("../models/User");
const bcrypt = require("bcrypt");
const asyncWrapper = require("../middlewares/asyncWrapper");

/**
 * Get all users
 */
const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find().select("-password");
  res.json({ status: "SUCCESS", data: { users } });
});

/**
 * Get a specific user by ID
 */
const getUserById = asyncWrapper(async (req, res, next) => {
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
  const { email, password, firstName, lastName } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ status: "ERROR", message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
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

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }

  await user.remove();
  res.json({ status: "SUCCESS", data: null });
});

/**
 * Upload a profile image for a user
 */
const uploadProfileImage = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ status: "ERROR", message: "User not found" });
  }

  if (req.file) {
    user.profileImage = req.file.path;
    await user.save();
  }

  res.json({ status: "SUCCESS", data: { user } });
});

/**
 * Approve a user by ID
 */
const approveUser = asyncWrapper(async (req, res, next) => {
    const { userId } = req.params;
  
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ status: "ERROR", message: "User not found" });
    }
  
    user.isApproved = true;
    user.role = "place_owner"; // Change the role to "place_owner"
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
    const { firstName, lastName, email } = req.body;
  
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ status: "ERROR", message: "User not found" });
    }
  
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
  
    await user.save();
  
    res.json({ status: "SUCCESS", data: { user } });
  });

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUser,
  deleteUser,
  uploadProfileImage,
  approveUser,
  getProfile,
  updateProfile,
};
