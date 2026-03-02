const Event = require("../models/Event");
const Place = require("../models/Place");
const User = require("../models/User");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const notify = require("../utils/notify");

const toDataUrl = (file) => {
  if (!file?.buffer || !file?.mimetype) return "";
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

const getAllEvents = asyncWrapper(async (req, res) => {
  const {
    search = "",
    place,
    upcoming,
    sort = "date",
    order = "asc",
    page = 1,
    limit = 10,
  } = req.query;

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (place && mongoose.Types.ObjectId.isValid(place)) {
    filter.place = place;
  }

  if (upcoming === "true") {
    filter.date = { $gte: new Date() };
  }

  // STATUS FILTER: Admins see everything, creators/owners see their own, users see approved
  if (req.user?.role === "admin") {
    if (req.query.status) {
      filter.status = req.query.status;
    }
  } else if (req.user) {
    const userPlaces = await Place.find({ owner: req.user._id }).select("_id");
    const placeIds = userPlaces.map(p => p._id);

    const statusOr = [
      { status: "approved" },
      { organizer: req.user._id },
      { place: { $in: placeIds } }
    ];

    if (filter.$or) {
      filter.$and = [
        { $or: filter.$or },
        { $or: statusOr }
      ];
      delete filter.$or;
    } else {
      filter.$or = statusOr;
    }
  } else {
    filter.status = "approved";
  }


  const direction = order === "desc" ? -1 : 1;
  const sortMap = {
    date: { date: direction },
    createdAt: { createdAt: direction },
    name: { name: direction },
  };

  const selectedSort = sortMap[sort] || sortMap.date;

  const [events, total] = await Promise.all([
    Event.find(filter, { __v: false })
      .populate("place", "name location owner")
      .populate("organizer", "firstName lastName profileImage")

      .sort(selectedSort)
      .limit(safeLimit)
      .skip(skip),
    Event.countDocuments(filter),
  ]);

  res.json({
    status: httpStatusText.SUCCESS,
    data: {
      events: events.map(e => ({
        ...e._doc,
        // Fallback for location if place is null
        displayLocation: e.place ? e.place.name : e.locationName
      })),
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    },
  });
});

const getEvent = asyncWrapper(async (req, res, next) => {
  const eventId = req.params.eventId;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return next(new AppError("Invalid event id", 400, httpStatusText.FAIL));
  }

  const event = await Event.findById(eventId)
    .populate("place", "name location")
    .populate("organizer", "firstName lastName profileImage");

  if (!event) {
    return next(new AppError("Event not found", 404, httpStatusText.FAIL));
  }

  return res.json({ status: httpStatusText.SUCCESS, data: { event } });
});

const addEvent = asyncWrapper(async (req, res, next) => {
  const { place, name, description, date, maxTickets, locationName } = req.body;

  // Defense in depth: role check is also enforced at route level.
  if (!["event_organizer", "admin"].includes(req.user?.role)) {
    return next(new AppError("Only event organizers can create events.", 403, httpStatusText.FAIL));
  }

  if (!name || !description || !date) {
    return next(new AppError("name, description and date are required", 400, httpStatusText.FAIL));
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return next(new AppError("Invalid date", 400, httpStatusText.FAIL));
  }

  const organizerUser = await User.findById(req.user._id);
  if (!organizerUser.isApproved && req.user.role !== "admin") {
    return next(new AppError("Your account is not verified. Please update your profile and wait for admin approval.", 403, httpStatusText.FAIL));
  }

  let finalPlace = null;
  let status = "pending";
  let isPlaceOwner = false;

  if (place && mongoose.Types.ObjectId.isValid(place)) {
    const foundPlace = await Place.findById(place);
    if (!foundPlace) return next(new AppError("Place not found", 404, httpStatusText.FAIL));

    finalPlace = place;
    isPlaceOwner = foundPlace.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isVenueBookable = foundPlace.status === "approved" || isPlaceOwner || isAdmin;
    if (!isVenueBookable) {
      return next(new AppError("This venue is not available for booking right now.", 403, httpStatusText.FAIL));
    }
    status = isPlaceOwner ? "approved" : "pending";

    // Slot collision check for venues
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    const startTime = parsedDate.getTime();
    const collision = await Event.findOne({
      place: finalPlace,
      status: { $ne: "rejected" },
      date: {
        $gte: new Date(startTime - FOUR_HOURS),
        $lte: new Date(startTime + FOUR_HOURS)
      }
    });
    if (collision) {
      return next(new AppError("This venue is already booked around this time.", 400, httpStatusText.FAIL));
    }
  } else if (!locationName) {
    return next(new AppError("Either a Place ID or a Custom Location Name is required", 400, httpStatusText.FAIL));
  }

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = req.files.map(toDataUrl).filter(Boolean);
  }

  const newEvent = new Event({
    name,
    description,
    date: parsedDate,
    place: finalPlace,
    locationName: finalPlace ? undefined : locationName,
    maxTickets: maxTickets || 50,
    organizer: req.user._id,
    images: imageUrls,
    status
  });

  await newEvent.save();

  // NOTIFICATIONS
  if (finalPlace && !isPlaceOwner) {
    const foundPlace = await Place.findById(finalPlace);
    await notify({
      userId: foundPlace.owner,
      type: "event_request",
      title: "New Booking Request",
      message: `A request for "${name}" at "${foundPlace.name}" is pending.`,
      link: "my_events",
    });
  } else if (!finalPlace) {
    // Notify all admins about a public location event
    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      await notify({
        userId: admin._id,
        type: "event_request",
        title: "Public Event Review",
        message: `New event "${name}" at "${locationName}" requires admin review.`,
        link: "my_events",
      });
    }
  }

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      event: newEvent,
      message: status === "approved" ? "Event created!" : "Event submitted for review."
    }
  });
});



const updateEvent = asyncWrapper(async (req, res, next) => {
  const eventId = req.params.eventId;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return next(new AppError("Invalid event id", 400, httpStatusText.FAIL));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404, httpStatusText.FAIL));
  }

  const isOwner = event.organizer.toString() === req.user._id.toString();

  if (!isOwner) {
    return next(new AppError("Only the organizer can update this event", 403, httpStatusText.FAIL));
  }

  // Whitelist only safe updatable fields
  const updateFields = {};
  if (req.body.name !== undefined) updateFields.name = req.body.name;
  if (req.body.description !== undefined) updateFields.description = req.body.description;
  if (req.files && req.files.length > 0) {
    updateFields.images = req.files.map(toDataUrl).filter(Boolean);
  }
  if (req.body.maxTickets !== undefined) updateFields.maxTickets = Number(req.body.maxTickets);
  if (req.body.date !== undefined) {
    const parsedDate = new Date(req.body.date);
    if (Number.isNaN(parsedDate.getTime())) {
      return next(new AppError("Invalid date", 400, httpStatusText.FAIL));
    }
    updateFields.date = parsedDate;
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).populate("place", "name location").populate("organizer", "firstName lastName");

  res.status(200).json({ status: httpStatusText.SUCCESS, data: { event: updatedEvent } });
});

const deleteEvent = asyncWrapper(async (req, res, next) => {
  const eventId = req.params.eventId;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return next(new AppError("Invalid event id", 400, httpStatusText.FAIL));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404, httpStatusText.FAIL));
  }

  const isOwner = event.organizer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("Not authorized to delete this event", 403, httpStatusText.FAIL));
  }

  await Event.deleteOne({ _id: eventId });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

const approveEvent = asyncWrapper(async (req, res, next) => {
  const { eventId } = req.params;
  const { status, reason = "" } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return next(new AppError("Invalid status", 400, httpStatusText.FAIL));
  }

  const event = await Event.findById(eventId).populate("place");
  if (!event) return next(new AppError("Event not found", 404, httpStatusText.FAIL));

  const isAdmin = req.user.role === "admin";
  let isPlaceOwner = false;
  if (event.place) {
    isPlaceOwner = event.place.owner.toString() === req.user._id.toString();
  }

  // If no fixed place, ONLY admin can approve
  if (!event.place) {
    if (!isAdmin) return next(new AppError("Only admins can approve custom location events", 403, httpStatusText.FAIL));
  } else {
    // If it has a place, either admin or that place owner can approve
    if (!isPlaceOwner && !isAdmin) {
      return next(new AppError("Not authorized to approve this request", 403, httpStatusText.FAIL));
    }
  }

  event.status = status;
  event.rejectionReason = status === "rejected" ? reason : "";
  await event.save();

  await notify({
    userId: event.organizer,
    type: status === "approved" ? "event_approved" : "event_rejected",
    title: status === "approved" ? "Event Approved!" : "Event Rejected",
    message: status === "approved"
      ? `Your event "${event.name}" has been approved.`
      : `Your event "${event.name}" was rejected. Reason: ${reason || "None provided"}`,
    link: "my_events",
  });

  res.json({ status: httpStatusText.SUCCESS, message: `Event ${status}!` });
});

module.exports = {
  getAllEvents,
  getEvent,
  addEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
};
