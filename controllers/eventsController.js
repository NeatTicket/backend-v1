
let events = require('../data/events');
const {validationResult} = require('express-validator')
const getAllEvents = (req, res) => {
    res.json(events)
}

const getEvent = (req, res) => {
    let eventId = +req.params.eventId
    const event = events.find((event) => event.id === eventId)
    if (!event) {
        return res.status(404).json({msg: "Event Not Found"})
    }
    res.json(event)
}

const addEvent = (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array())
    }
        
    const event = { id: events.length + 1, ...req.body };
    events.push(event)
    res.status(201).json(event);
}

const updateEvent = (req, res) => {
    const eventId = +req.params.eventId;
    let event = events.find((event) => event.id === eventId);

    if (!event) {
        return res.status(404).json({ msg: "event not found" });
    }

    event = { ...event, ...req.body }
    res.status(200).json(event)
}

const deleteEvent = (req, res) => {
    const eventId = +req.params.eventId;


    const index = events.findIndex((event) => event.id === eventId);
    if (index !== -1) {
        events.splice(index, 1); 
        res.status(200).json({ success: "Event has been deleted" });
    } else {
        res.status(404).json({ error: "Event not found" });
    }
}

module.exports = {
    getAllEvents,
    getEvent,
    addEvent,
    updateEvent,
    deleteEvent
}
