const express = require("express");
const { protect } = require("../middlewares/protect");
const { createTicket, getMyTickets, cancelTicket, useTicket } = require("../controllers/ticketsController");

const rateLimit = require("express-rate-limit");
const router = express.Router();

// Stricter rate limit for booking to prevent bot spamming
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 booking requests per window
    message: { status: "FAIL", message: "Too many booking attempts. Please try again in 15 minutes." }
});

router.get("/me", protect, getMyTickets);
router.post("/events/:eventId", protect, bookingLimiter, createTicket);
router.patch("/:ticketId/use", protect, useTicket);
router.delete("/:ticketId", protect, cancelTicket);

module.exports = router;
