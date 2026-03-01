const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/User");
const Place = require("../models/Place");
const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
const httpStatusText = require("../utils/httpStatusText");

const getOverviewStats = asyncWrapper(async (req, res) => {
  const [users, approvedUsers, places, events, tickets, upcomingEvents] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isApproved: true }),
    Place.countDocuments(),
    Event.countDocuments(),
    Ticket.countDocuments(),
    Event.countDocuments({ date: { $gte: new Date() } }),
  ]);

  res.json({
    status: httpStatusText.SUCCESS,
    data: {
      users,
      approvedUsers,
      places,
      events,
      upcomingEvents,
      tickets,
    },
  });
});

const getPublicStats = asyncWrapper(async (req, res) => {
  const [events, upcomingEvents, places] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ date: { $gte: new Date() } }),
    Place.countDocuments(),
  ]);

  res.json({
    status: httpStatusText.SUCCESS,
    data: { events, upcomingEvents, places },
  });
});

module.exports = { getOverviewStats, getPublicStats };

