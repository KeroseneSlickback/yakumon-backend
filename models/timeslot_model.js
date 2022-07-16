const mongoose = require("mongoose");

const timeslotSchema = new mongoose.Schema({
  slotDateTime: {
    type: Date,
    required: true,
  },
  createdAt: Date,
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
