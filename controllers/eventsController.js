const { validationResult } = require("express-validator");
const Event = require("../models/Event");
const getAllEvents = async (req, res) => {
  // get all events from DB using Event Model
  const events = await Event.find();
  res.json(events);
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ msg: "Event Not Found" });
    }
    return res.json(event);
  } catch (err) {
    return res.status(400).json({ msg: "Invalid Object ID" });
  }
};

const addEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const newEvent = new Event(req.body);
  await newEvent.save();
  res.status(201).json(newEvent);
};

const updateEvent = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const updatedEvent = await Event.updateOne(
      { _id: eventId },
      { $set: { ...req.body } }
    );
    return res.status(200).json(updatedEvent);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};

const deleteEvent = async(req, res) => {
    const data = await Event.deleteOne({_id: req.params.eventId})
    res.status(200).json({success: true, msg: data})
};

module.exports = {
  getAllEvents,
  getEvent,
  addEvent,
  updateEvent,
  deleteEvent,
};
