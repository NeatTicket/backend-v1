const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: false },
  locationName: { type: String }, // For events without a registered venue
  maxTickets: { type: Number, required: true, default: 50 },
  ticketsSold: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  rejectionReason: { type: String },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Actually, let's keep it approved by default temporarily to avoid breaking everything, 
// but new requests should be pending.
// Let's refine the logic: If organizer == place_owner then auto-approved.



const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
