const { validationResult } = require("express-validator");
const Event = require("../models/Event");
const Place = require("../models/Place");
const User = require("../models/User");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const mongoose = require('mongoose');
const appError = require('../utils/appError');

const getAllEvents = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  // get all events from DB using Event Model
  const events = await Event.find({}, { __v: false }).limit(limit).skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { events } });
});

const getEvent = asyncWrapper(async (req, res, next) => {
  const eventId = req.params.eventId;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    const error = appError.create('Invalid Id', 400, httpStatusText.FAIL);
    return next(error);
  }

  const event = await Event.findById(eventId);

  if (!event) {
    const error = appError.create('Event not found', 404, httpStatusText.FAIL);
    return next(error);
  }

  return res.json({ status: httpStatusText.SUCCESS, data: { event } });
});

const addEvent = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(error);
  }

  const { place, ...rest } = req.body;

  const foundPlace = await Place.findById(place);
  if (!foundPlace) {
    const error = appError.create('Place not found', 404, httpStatusText.FAIL);
    return next(error);
  }

  const placeOwner = await User.findById(foundPlace.owner);
  if (!placeOwner.isApproved) {
    const error = appError.create('Place owner is not approved', 403, httpStatusText.FAIL);
    return next(error);
  }

  const newEvent = new Event({ ...rest, place, organizer: req.user._id });
  await newEvent.save();

  res.status(201).json({ status: httpStatusText.SUCCESS, data: { event: newEvent } });
});

const updateEvent = asyncWrapper(async (req, res, next) => {
  const eventId = req.params.eventId;

  const event = await Event.findById(eventId);
  if (!event) {
    const error = appError.create('Event not found', 404, httpStatusText.FAIL);
    return next(error);
  }

  if (event.organizer.toString() !== req.user._id.toString()) {
    const error = appError.create('Not authorized to update this event', 403, httpStatusText.FAIL);
    return next(error);
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { event: updatedEvent } });
});

const deleteEvent = asyncWrapper(async (req, res, next) => {
  const eventId = req.params.eventId;

  const event = await Event.findById(eventId);
  if (!event) {
    const error = appError.create('Event not found', 404, httpStatusText.FAIL);
    return next(error);
  }

  if (event.organizer.toString() !== req.user._id.toString()) {
    const error = appError.create('Not authorized to delete this event', 403, httpStatusText.FAIL);
    return next(error);
  }

  await Event.deleteOne({ _id: eventId });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  getAllEvents,
  getEvent,
  addEvent,
  updateEvent,
  deleteEvent,
};
