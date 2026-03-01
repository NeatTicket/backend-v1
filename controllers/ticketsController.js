const mongoose = require("mongoose");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

const createTicket = asyncWrapper(async (req, res, next) => {
  const { eventId } = req.params;
  const { quantity = 1, notes = "" } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return next(new AppError("Invalid event id", 400, httpStatusText.FAIL));
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    return next(new AppError("Quantity must be between 1 and 10", 400, httpStatusText.FAIL));
  }

  /**
   * RACE CONDITION SECURITY:
   * We use findOneAndUpdate with a query condition to check availability ATOMICALLY.
   * We only update the event IF (ticketsSold + qty) <= maxTickets.
   */
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      $expr: { $lte: [{ $add: ["$ticketsSold", qty] }, "$maxTickets"] }
    },
    { $inc: { ticketsSold: qty } },
    { new: true }
  );

  if (!event) {
    // If update failed, it's either event not found OR sold out
    const checkEvent = await Event.findById(eventId);
    if (!checkEvent) return next(new AppError("Event not found", 404, httpStatusText.FAIL));

    return next(new AppError(
      `Not enough tickets available. Remaining: ${checkEvent.maxTickets - checkEvent.ticketsSold}`,
      400,
      httpStatusText.FAIL
    ));
  }

  const ticket = await Ticket.create({
    event: eventId,
    user: req.user._id,
    quantity: qty,
    notes,
  });

  res.status(201).json({ status: httpStatusText.SUCCESS, data: { ticket } });
});


const getMyTickets = asyncWrapper(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate({
      path: "event",
      select: "name date place",
      populate: { path: "place", select: "name location" },
    })
    .sort({ createdAt: -1 });

  res.json({ status: httpStatusText.SUCCESS, data: { tickets } });
});

const cancelTicket = asyncWrapper(async (req, res, next) => {
  const { ticketId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return next(new AppError("Invalid ticket id", 400, httpStatusText.FAIL));
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    return next(new AppError("Ticket not found", 404, httpStatusText.FAIL));
  }

  if (ticket.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("Not authorized to cancel this ticket", 403, httpStatusText.FAIL));
  }

  await Ticket.deleteOne({ _id: ticketId });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

const useTicket = asyncWrapper(async (req, res, next) => {
  const { ticketId } = req.params;
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return next(new AppError("Ticket not found", 404, httpStatusText.FAIL));

  if (ticket.status === 'used') return next(new AppError("Ticket already used", 400, httpStatusText.FAIL));

  ticket.status = 'used';
  await ticket.save();

  res.json({ status: httpStatusText.SUCCESS, data: { ticket } });
});

module.exports = {
  createTicket,
  getMyTickets,
  cancelTicket,
  useTicket,
};
