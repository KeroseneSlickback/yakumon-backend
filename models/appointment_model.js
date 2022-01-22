const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema( 
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    }, 
    email: {
      type: String,
      trim: true,
    },
    timeSlots: [{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Timeslot'
    }],
    service: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Service'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'User'
    },
    store: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: 'Store',
    },
  }
)

const Appointment = mongoose.model('Appointment', appointmentSchema)

module.exports = Appointment;