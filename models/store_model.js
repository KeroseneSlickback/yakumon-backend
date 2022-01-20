const mongoose = require("mongoose");


const storeSchema = new mongoose.Schema(
  {
    storeName: {
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
    hours: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: Buffer,
      required: true,
    }
  }
)