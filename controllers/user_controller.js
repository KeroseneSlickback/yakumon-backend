const User = require('../models/user_model')
const {body, validationResult} = require('express-validator')
const utils = require('../lib/utils')
const sharp = require('sharp')
const Appointment = require('../models/appointment_model')
const Service = require('../models/service_model')
const Timeslot = require('../models/timeslot_model')

exports.user_create = [
  body('username', 'Username must not be empty')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('email', 'Email must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('password', 'Password must not be empty')
    .trim()
    .isLength({min: 7})
    .escape(),
  body('passwordConfirmation', 'Password confirmation is incorrect')
    .exists()
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation is incrrect')
      }
      return true;
    }),
  body('firstName', 'First name').trim(),
  body('lastName', 'Last name').trim(),
  body('title', 'User title').trim(),
  body('store', 'Store link').trim(),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log(errors)
    }
  const buffer = await sharp(req.file.buffer).resize({width: 500, height: 500 }).png().toBuffer()
    // Questionable...
    const newUser = new User({
      ...req.body,
      picture: buffer,
      owner: false,
      admin: false,
    });

    try {
      const user = await newUser.save();
      const satintizedUser = await user.toJSON()
      const jwt = await utils.issueJWT(user)
      res.status(201).send({
        success: true,
        satintizedUser,
        token: jwt.token,
      })
    } catch (e) {
      console.log(e)
      res.status(400).send(e)
    }
  }
]

exports.user_login = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    )
    if (!user) {
      res.status(401).json({success: false, msg: 'Could not log in'})
    }
    if (user) {
      const jwt = await utils.issueJWT(user)
      res.send({
        success: true,
        user,
        token: jwt.token,
      })
    } else {
      res.status(401).json({
        success: false,
        msg: 'You entered the wrong user infomation'
      })
    }
  } catch (e) {
    res.status(400).send(e)
  }
}

exports.user_get = async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findOne({_id})
      .populate({
        path: 'appointments',
        populate: {path: 'timeSlots'}
      })
      .populate('services')
    if (!user) {
      return res.status(404).send()
    }
    res.send(user.toJSON())
  } catch (e) {
    res.status(400).send(e)
  }
}

exports.user_patch = async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 500, height: 500 }).png().toBuffer()
  const updates = Object.keys(req.body);
	const allowedUpdates = ['firstName', 'lastName', 'title', 'username', 'email', 'password', 'store', 'picture'];
	const isValidOperation = updates.every(update => {
		return allowedUpdates.includes(update);
	});
	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}
	try {
		const user = await User.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!user) {
			return res.status(404).send();
		}
		updates.forEach(update => {
			user[update] = req.body[update];
		});
    user.picture = buffer;
		await user.save();
		res.send(req.user);
	} catch (e) {
		res.status(400).send(e);
	}
}

exports.user_delete = async (req, res) => {
  try {
    await Appointment.deleteMany({owner: req.user._id})
    await Service.deleteMany({owner: req.user._id})
    await Timeslot.deleteMany({owner: req.user._id})
    await req.user.remove();
    res.send(req.user)
  } catch (e) {
    req.status(500).send()
  }
}