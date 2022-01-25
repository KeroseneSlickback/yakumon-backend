const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const Appointment = require('./appointment_model')
const Service = require('./service_model')
const Timeslot = require('./timeslot_model')

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
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
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
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    },
    appointments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}],
    services: [{type: mongoose.Schema.Types.ObjectId, ref: 'Service'}],
    picture: {
      type: Buffer
    },
    owner: {
      type: Boolean
    },
    admin: {
      type: Boolean
    },
    employee: {
      type: Boolean
    }
  }
)

// userSchema.virtual('appointments', {
//   ref: "Appointment",
//   localField: '_id',
//   foreignField: 'user'
// })

// userSchema.virtual('store', {
//   ref: "Store",
//   localField: '_id',
//   foreignField: 'user'
// })


userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.username;
  delete userObject.email;
  delete userObject.password;
  
  return userObject;
}

userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({username})
  if (!user) {
    throw new Error('Unable to login')
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch){
    throw new Error('Unable to login')
  }
  return user
}

userSchema.pre('save', async function (next) {
  const user = this;
  if (userSchema.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

userSchema.pre('remove', async function (next) {
  const user = this;
  await Appointment.deleteMany({owner: User._id})
  await Appointment.deleteMany({employee: User._id})
  await Service.deleteMany({owner: User._id})
  await Timeslot.deleteMany({owner: User._id})
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User;