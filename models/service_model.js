const mongoose = require('mongoose')

const serviceSchema = mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    timeSpan: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    }, 
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'User'
    }
  }
)

const Service = mongoose.model('Service', serviceSchema)

module.exports = Service