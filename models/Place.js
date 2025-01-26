const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Place = mongoose.model("Place", placeSchema);
module.exports = Place;
