const express = require("express");
const { protect, optionalProtect } = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const { createPlace, getAllPlaces, getPlaceById, updatePlace, deletePlace, approvePlace } = require("../controllers/placesController");
const upload = require("../utils/upload");
const router = express.Router();
const Event = require("../models/Event");

// Routes

/**
 * @route   POST /places
 * @desc    Create a new place
 * @access  Private (Only approved users with role 'place_owner' can create places)
 */
router.post("/", protect, authorize(["place_owner", "admin"]), upload.array("images", 5), createPlace);

/**
 * @route   GET /places
 * @desc    Get all places
 * @access  Public
 */
router.get("/", optionalProtect, getAllPlaces);

/**
 * @route   GET /places/:placeId
 * @desc    Get a place by ID
 * @access  Public
 */
router.get("/:placeId", optionalProtect, getPlaceById);

/**
 * @route   PATCH /places/:placeId
 * @desc    Update a place by ID
 * @access  Private (Only the owner can update their place)
 */
router.patch("/:placeId", protect, authorize(["place_owner", "admin"]), upload.array("images", 5), updatePlace);

/**
 * @route   DELETE /places/:placeId
 * @desc    Delete a place by ID
 * @access  Private (Only the owner can delete their place)
 */
router.delete("/:placeId", protect, authorize(["place_owner", "admin"]), deletePlace);

// Admin approve/reject a place
router.patch("/:placeId/approve", protect, authorize(["admin"]), approvePlace);

// Get availability (booked time slots) for a venue
router.get("/:placeId/availability", optionalProtect, async (req, res) => {
    const { placeId } = req.params;
    const events = await Event.find(
        { place: placeId, status: { $ne: "rejected" }, date: { $gte: new Date() } },
        { date: 1, name: 1, status: 1 }
    ).sort({ date: 1 });
    res.json({ status: "success", data: { bookedSlots: events } });
});

module.exports = router;
