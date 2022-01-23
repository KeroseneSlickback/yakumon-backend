const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema( 
  {
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
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    }
  }
)

const Appointment = mongoose.model('Appointment', appointmentSchema)

module.exports = Appointment;