const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/appError"); // Correct import
const { validationResult } = require("express-validator");

const login = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        throw new AppError(errorMessages.join(", "), 400, "Bad Request"); // Correct usage
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("User not found", 404, "Not Found"); // Correct usage
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401, "Unauthorized"); // Correct usage
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

const register = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        throw new AppError(errorMessages.join(", "), 400, "Bad Request"); // Correct usage
    }

    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("Email already in use", 400, "Bad Request"); // Correct usage
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
});

module.exports = { login, register };
