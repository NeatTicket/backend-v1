const Place = require("../models/Place");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/User");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const notify = require("../utils/notify");

// On startup: auto-approve any places owned by admin users (data migration)
(async () => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map(u => u._id);

    // Legacy sync: Ensure status matches isApproved for existing records
    await Place.updateMany({ isApproved: true, status: { $ne: "approved" } }, { status: "approved" });
    await Place.updateMany({ isApproved: false, status: { $exists: false } }, { status: "pending" });

    const result = await Place.updateMany(
      { owner: { $in: adminIds }, status: { $ne: "approved" } },
      { status: "approved", isApproved: true }
    );
    if (result.modifiedCount > 0) {
      console.log(`[migration] Auto-approved ${result.modifiedCount} admin-owned place(s).`);
    }
  } catch (e) {
    console.error("[migration] Failed to auto-approve admin places:", e.message);
  }
})();


const createPlace = asyncWrapper(async (req, res, next) => {
  const { name, description, location, capacity } = req.body;
  const owner = req.user._id;


  if (!name || !description || !location) {
    return next(new AppError("name, description and location are required", 400, httpStatusText.FAIL));
  }

  const user = await User.findById(owner).select("-password");
  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  if (!user.isApproved) {
    return next(new AppError("You are not approved to create a place", 403, httpStatusText.FAIL));
  }

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = req.files.map(file => `/${file.path.replace(/\\/g, "/")}`);
  }

  const isAdmin = req.user.role === "admin";
  const status = isAdmin ? "approved" : "pending";

  const newPlace = new Place({
    name,
    description,
    location,
    capacity: capacity || 50,
    owner,
    status,
    isApproved: isAdmin, // Keep for legacy
    images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800"]
  });

  await newPlace.save();

  // Notify all admins about the new venue submission (only for place owners, not admin self-creates)
  if (!isAdmin) {
    const admins = await User.find({ role: "admin" }).select("_id");
    await Promise.all(admins.map(admin =>
      notify({
        userId: admin._id,
        type: "system",
        title: "New Venue Submitted for Approval",
        message: `"${name}" in ${location} was submitted by ${req.user.firstName} ${req.user.lastName} and is awaiting your review.`,
        link: "my_venues",
      })
    ));
  }

  const message = isAdmin ? "Venue created!" : "Venue submitted for admin approval.";
  res.status(201).json({ status: httpStatusText.SUCCESS, data: { place: newPlace, message } });
});

const getAllPlaces = asyncWrapper(async (req, res) => {
  const { search = "", owner, page = 1, limit = 10, sort = "createdAt", order = "desc" } = req.query;
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  // Filters: 
  // Public: sees status='approved'
  // Admin: sees everything
  // Owner: sees their own (any status) + everyone's 'approved'
  if (req.user?.role === "admin") {
    // admin sees all
  } else if (req.user) {
    filter.$or = [
      { status: "approved" },
      { owner: req.user._id }
    ];
  } else {
    filter.status = "approved";
  }

  if (search) {
    const searchCondition = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchCondition }];
      delete filter.$or;
    } else {
      filter.$or = searchCondition;
    }
  }

  if (owner && mongoose.Types.ObjectId.isValid(owner)) {
    filter.owner = owner;
  }

  const direction = order === "asc" ? 1 : -1;
  const sortMap = {
    createdAt: { createdAt: direction },
    name: { name: direction },
  };
  const selectedSort = sortMap[sort] || sortMap.createdAt;

  const [places, total] = await Promise.all([
    Place.find(filter).populate("owner", "firstName lastName email").sort(selectedSort).limit(safeLimit).skip(skip),
    Place.countDocuments(filter),
  ]);

  res.json({
    status: httpStatusText.SUCCESS,
    data: {
      places,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    },
  });
});


const getPlaceById = asyncWrapper(async (req, res, next) => {
  const { placeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    return next(new AppError("Invalid place id", 400, httpStatusText.FAIL));
  }

  const place = await Place.findById(placeId).populate("owner", "firstName lastName email");
  if (!place) {
    return next(new AppError("Place not found", 404, httpStatusText.FAIL));
  }

  res.json({ status: httpStatusText.SUCCESS, data: { place } });
});


const updatePlace = asyncWrapper(async (req, res, next) => {
  const { placeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    return next(new AppError("Invalid place id", 400, httpStatusText.FAIL));
  }

  const place = await Place.findById(placeId);

  if (!place) {
    return next(new AppError("Place not found", 404, httpStatusText.FAIL));
  }


  const isOwner = place.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("Not authorized to update this place", 403, httpStatusText.FAIL));
  }

  const { name, description, location, capacity } = req.body;

  if (name !== undefined) place.name = name;
  if (description !== undefined) place.description = description;
  if (location !== undefined) place.location = location;
  if (capacity !== undefined) place.capacity = capacity;

  if (req.files && req.files.length > 0) {
    place.images = req.files.map(file => `/${file.path.replace(/\\/g, "/")}`);
  }

  // If the place was rejected, and the owner is updating it, set status back to pending
  if (isOwner && place.status === "rejected") {
    place.status = "pending";
    place.isApproved = false; // Keep for legacy
    place.rejectionReason = "";
  }

  await place.save();

  res.json({ status: httpStatusText.SUCCESS, data: { place } });
});


const deletePlace = asyncWrapper(async (req, res, next) => {
  const { placeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    return next(new AppError("Invalid place id", 400, httpStatusText.FAIL));
  }

  const place = await Place.findById(placeId);

  if (!place) {
    return next(new AppError("Place not found", 404, httpStatusText.FAIL));
  }


  const isOwner = place.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("Not authorized to delete this place", 403, httpStatusText.FAIL));
  }

  await Place.deleteOne({ _id: placeId });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

const approvePlace = asyncWrapper(async (req, res, next) => {
  const { placeId } = req.params;
  const { isApproved, status, reason } = req.body;

  // Derive final status
  let finalStatus = status;
  if (!finalStatus && typeof isApproved === "boolean") {
    finalStatus = isApproved ? "approved" : "rejected";
  }

  if (!["approved", "rejected", "pending"].includes(finalStatus)) {
    return next(new AppError("Invalid status", 400, httpStatusText.FAIL));
  }

  if (req.user.role !== "admin") {
    return next(new AppError("Only admins can approve places", 403, httpStatusText.FAIL));
  }

  const update = {
    status: finalStatus,
    isApproved: finalStatus === "approved",
    rejectionReason: finalStatus === "rejected" ? reason : ""
  };

  const place = await Place.findByIdAndUpdate(placeId, update, { new: true }).populate("owner", "_id firstName");
  if (!place) return next(new AppError("Place not found", 404, httpStatusText.FAIL));

  // Notify the place owner
  const isNowApproved = finalStatus === "approved";
  await notify({
    userId: place.owner._id,
    type: isNowApproved ? "venue_approved" : "venue_rejected",
    title: isNowApproved ? "Venue Approved!" : "Action Required: Venue Request",
    message: isNowApproved
      ? `Your venue "${place.name}" has been approved and is now live on NeatTicket.`
      : `Admin review for "${place.name}": ${reason || "The submission was not approved."} You can edit it from your venues and resubmit.`,
    link: "my_venues",
  });

  res.json({ status: httpStatusText.SUCCESS, data: { place }, message: `Place ${finalStatus}!` });
});

module.exports = {
  createPlace,
  getAllPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
  approvePlace,
};
