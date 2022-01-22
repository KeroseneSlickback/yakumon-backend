const mongoose = require('mongoose')

const timeslotSchema = new mongoose.Schema(
  {
    title: String,
    slotTime: String,
    slotDate: String,
    createdAt: Date,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
)

const Timeslot = mongoose.model('Timeslot', timeslotSchema)

module.exports = Timeslot