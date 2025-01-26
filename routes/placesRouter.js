const express = require("express");
const { protect } = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const { createPlace, getAllPlaces, getPlaceById, updatePlace, deletePlace } = require("../controllers/placesController");
const router = express.Router();

// Routes

/**
 * @route   POST /places
 * @desc    Create a new place
 * @access  Private (Only approved users with role 'place_owner' can create places)
 */
router.post("/", protect, authorize(['place_owner']), createPlace);

/**
 * @route   GET /places
 * @desc    Get all places
 * @access  Public
 */
router.get("/", getAllPlaces);

/**
 * @route   GET /places/:placeId
 * @desc    Get a place by ID
 * @access  Public
 */
router.get("/:placeId", getPlaceById);

/**
 * @route   PATCH /places/:placeId
 * @desc    Update a place by ID
 * @access  Private (Only the owner can update their place)
 */
router.patch("/:placeId", protect, authorize(['place_owner']), updatePlace);

/**
 * @route   DELETE /places/:placeId
 * @desc    Delete a place by ID
 * @access  Private (Only the owner can delete their place)
 */
router.delete("/:placeId", protect, authorize(['place_owner']), deletePlace);

module.exports = router;
