const { validationResult } = require("express-validator");
const Event = require("../models/Event");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const mongoose = require('mongoose');
const appError =require('../utils/appError')


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
    error = appError.create('Invalid Id', 400, httpStatusText.FAIL)
    return next(error);
  }


  const event = await Event.findById(eventId);

  if (!event) {
    error = appError.create('event not found', 404, httpStatusText.FAIL)
    return next(error);
  }

  return res.json({ status: httpStatusText.SUCCESS, data: { event } });
});

const addEvent = asyncWrapper(async (req, res,next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL)
    return next(error)
  }

  const newEvent = new Event(req.body);
  await newEvent.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { event: newEvent } });
});

const updateEvent = asyncWrapper(async (req, res) => {
  const eventId = req.params.eventId;

    const updatedEvent = await Event.updateOne(
      { _id: eventId },
      { $set: { ...req.body } }
    );
    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data: { event: updateEvent } });
   
});

const deleteEvent = asyncWrapper(async (req, res) => {
  const data = await Event.deleteOne({ _id: req.params.eventId });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  getAllEvents,
  getEvent,
  addEvent,
  updateEvent,
  deleteEvent,
};
