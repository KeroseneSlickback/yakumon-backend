const mongoose = require('mongoose')

const timeslotSchema = new mongoose.Schema(
  {
    slotTime: String,
    slotDate: String,
    createdAt: Date,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  }
)

const Timeslot = mongoose.model('Timeslot', timeslotSchema)

module.exports = Timeslot