const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true, default: 50 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  rejectionReason: { type: String },
  isApproved: { type: Boolean, default: false }, // Keep for legacy, though status is now source of truth
  images: [
    {
      type: String,
      default: "https://www.freeiconspng.com/uploads/no-image-icon-4.png",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Place = mongoose.model("Place", placeSchema);
module.exports = Place;
