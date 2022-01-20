const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid')
        }
      }
    }, 
    password: {
      type: String,
      required: true,
      validate(value) {
        if (value.length < 6) {
          throw new Error('Password must be greater than 6 characters')
        }
        if (value.includes('password')) {
          throw new Error('Password must not contain the word password')
        }
      }
    },
    picture: {
      type: Buffer
    }
  }
)

userSchema.virtual('appointments', {
  ref: "Appointment",
  localField: '_id',
  foreignField: 'Stylist'
})

userSchema.virtual('store', {
  ref: "Store",
  localField: '_id',
  foreignField: 'Stylist'
})


userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.username;
  delete userObject.email;
  delete userObject.password;
  
  return userObject;
}