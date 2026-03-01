const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const AppError = require("../utils/appError");

class AuthService {
    /**
     * Authenticate user and generate JWT token
     * @param {string} email 
     * @param {string} password 
     * @returns {Object} { token, user }
     */
    static async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError("Invalid email or password", 401, "Unauthorized");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Invalid email or password", 401, "Unauthorized");
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, config.jwt.secret, { expiresIn: "8h" });

        return {
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                profileImage: user.profileImage,
            },
        };
    }

    /**
     * Register a new user
     * @param {Object} userData 
     * @returns {Object} created user data
     */
    static async register(userData) {
        const { firstName, lastName, email, password, role = "user" } = userData;
        const allowedRoles = ["user", "place_owner", "event_organizer"];

        if (!allowedRoles.includes(role)) {
            throw new AppError("Invalid role", 400, "Bad Request");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError("Email already in use", 400, "Bad Request");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            isApproved: role === "user",
        });

        await newUser.save();

        return {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
            isApproved: newUser.isApproved,
        };
    }
}

module.exports = AuthService;
