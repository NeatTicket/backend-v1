const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    status: { type: String, enum: ["active", "used", "expired"], default: "active" },
    ticketCode: { type: String, unique: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

ticketSchema.pre("save", function (next) {
  if (!this.ticketCode) {
    this.ticketCode = "NT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

ticketSchema.index({ event: 1, user: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
