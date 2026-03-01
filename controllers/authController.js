const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/appError"); // Correct import
const AuthService = require("../services/authService");

const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    const authResult = await AuthService.login(email, password);

    res.json(authResult);
});

const register = asyncWrapper(async (req, res, next) => {
    const userData = await AuthService.register(req.body);

    res.status(201).json({
        message: "User registered successfully",
        data: {
            user: userData,
        },
    });
});

module.exports = { login, register };
