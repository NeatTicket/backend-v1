const Place = require("../models/Place");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/User");


const createPlace = asyncWrapper(async (req, res, next) => {
    const { name, description, location } = req.body;
    const owner = req.user._id; 
  
    // Fetch user from database to ensure isApproved is up-to-date
    const user = await User.findById(owner).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
  
    if (!user.isApproved) {
      const error = new Error("You are not approved to create a place");
      error.statusCode = 403;
      return next(error);
    }
  
    try {
      const newPlace = new Place({ name, description, location, owner });
      await newPlace.save();
      res.status(201).json({ status: httpStatusText.SUCCESS, data: { place: newPlace } });
    } catch (err) {
      if (err.name === "ValidationError") {
        err.statusCode = 400;
        err.message = "Bad Request: " + Object.values(err.errors).map(e => e.message).join(", ");
      }
      next(err);
    }
  });

const getAllPlaces = asyncWrapper(async (req, res) => {
  const places = await Place.find({});
  res.json({ status: httpStatusText.SUCCESS, data: { places } });
});


const getPlaceById = asyncWrapper(async (req, res, next) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) {
    const error = new Error("Place not found");
    error.statusCode = 404;
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, data: { place } });
});


const updatePlace = asyncWrapper(async (req, res, next) => {
  const { name, description, location } = req.body;
  const place = await Place.findById(req.params.placeId);

  if (!place) {
    const error = new Error("Place not found");
    error.statusCode = 404;
    return next(error);
  }


  if (place.owner.toString() !== req.user.userId) {
    const error = new Error("Not authorized to update this place");
    error.statusCode = 403;
    return next(error);
  }

  place.name = name;
  place.description = description;
  place.location = location;
  await place.save();

  res.json({ status: httpStatusText.SUCCESS, data: { place } });
});


const deletePlace = asyncWrapper(async (req, res, next) => {
  const place = await Place.findById(req.params.placeId);

  if (!place) {
    const error = new Error("Place not found");
    error.statusCode = 404;
    return next(error);
  }


  if (place.owner.toString() !== req.user.userId) {
    const error = new Error("Not authorized to delete this place");
    error.statusCode = 403;
    return next(error);
  }

  await place.remove();
  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  createPlace,
  getAllPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
};
