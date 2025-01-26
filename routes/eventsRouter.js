const express = require("express");
const { protect } = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const { getAllEvents, getEvent, addEvent, updateEvent, deleteEvent } = require("../controllers/eventsController");
const router = express.Router();

/**
 * @route   GET /events
 * @desc    Get all events
 * @access  Public
 */
router.get("/", getAllEvents);

/**
 * @route   GET /events/:eventId
 * @desc    Get an event by ID
 * @access  Public
 */
router.get("/:eventId", getEvent);

/**
 * @route   POST /events
 * @desc    Add a new event
 * @access  Private (Only authenticated users can add events)
 */
router.post("/", protect, authorize(['place_owner']), addEvent);

/**
 * @route   PATCH /events/:eventId
 * @desc    Update an event by ID
 * @access  Private (Only the organizer can update their event)
 */
router.patch("/:eventId", protect, authorize(['place_owner']), updateEvent);

/**
 * @route   DELETE /events/:eventId
 * @desc    Delete an event by ID
 * @access  Private (Only the organizer can delete their event)
 */
router.delete("/:eventId", protect, authorize(['place_owner']), deleteEvent);

module.exports = router;
