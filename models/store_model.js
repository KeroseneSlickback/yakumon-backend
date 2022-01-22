const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    storeType: {
      type: String,
      required: true,
      trim: true,
    },
    storeDescription: {
      type: String,
      required: true,
      trim: true,
    }, 
    location: {
      type: String,
      required: true,
      trim: true,
    }, 
    locationLink: {
      type: String,
      required: true,
      trim: true,
    }, 
    hours: [
      {
        day: String,
        open: String,
        close: String,
      }
    ],
    picture: {
      type: Buffer,
    },
    employees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    owner: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  }
)

storeSchema.virtual('users', {
  ref: "User",
  localField: '_id',
  foreignField: 'store'
})

storeSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'store'
})

storeSchema.methods.toJSON = function () {
  const store = this;
  const storeObject = store.toObject()

  return storeObject;
}

const Store = mongoose.model('Store', storeSchema)

module.exports = Store;