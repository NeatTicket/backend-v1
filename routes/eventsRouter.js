const express = require("express");
const { protect, optionalProtect } = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const { getAllEvents, getEvent, addEvent, updateEvent, deleteEvent, approveEvent } = require("../controllers/eventsController");
const upload = require("../utils/upload");
const router = express.Router();

/**
 * @route   GET /events
 * @desc    Get all events
 * @access  Public
 */
router.get("/", optionalProtect, getAllEvents);

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
router.post("/", protect, authorize(["event_organizer", "admin"]), upload.array("images", 5), addEvent);

/**
 * @route   PATCH /events/:eventId
 * @desc    Update an event by ID
 * @access  Private (Only the organizer can update their event)
 */
router.patch("/:eventId", protect, authorize(["event_organizer", "admin"]), upload.array("images", 5), updateEvent);

/**
 * @route   DELETE /events/:eventId
 * @desc    Delete an event by ID
 * @access  Private (Only the organizer can delete their event)
 */
router.patch("/:eventId/approve", protect, authorize(["place_owner", "admin"]), approveEvent);
router.delete("/:eventId", protect, authorize(["event_organizer", "admin"]), deleteEvent);

module.exports = router;
