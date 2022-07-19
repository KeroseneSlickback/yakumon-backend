const mongoose = require("mongoose");

const timeslotSchema = new mongoose.Schema({
  createdAt: { type: Date },
  slotDateTime: {
    type: Date,
    required: true,
    index: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  timeOff: {
    type: Boolean,
  },
  blockOrder: {
    type: Number,
  },
});

const Timeslot = mongoose.model("Timeslot", timeslotSchema);

module.exports = Timeslot;
