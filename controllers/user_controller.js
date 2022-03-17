const User = require("../models/user_model");
const { body, validationResult } = require("express-validator");
const utils = require("../lib/utils");
const sharp = require("sharp");
const Appointment = require("../models/appointment_model");
const Service = require("../models/service_model");
const Timeslot = require("../models/timeslot_model");
const Store = require("../models/store_model");

exports.user_create = [
  body("username", "Username must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("email", "Email must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password must not be empty")
    .trim()
    .isLength({ min: 7 })
    .escape(),
  body("passwordConfirmation", "Password confirmation is incorrect")
    .exists()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),
  body("firstName", "First name").trim().isLength({ min: 1 }),
  body("lastName", "Last name").trim().isLength({ min: 1 }),
  body("title", "User title").optional().trim(),
  body("store", "Store link").optional().trim(),
  body("phoneNumber", "Phone Number").trim(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      // throw new Error();
    }
    const newUser = new User({
      ...req.body,
      admin: false,
      storeOwner: false,
    });
    try {
      const user = await newUser.save();
      const jwt = await utils.issueJWT(user);
      if (req.body.store) {
        // Send a storeId from frontend
        const storeRelated = await Store.findById(req.params.store);
        await storeRelated.employees.push(user._id);
        await storeRelated.save();
      }
      res.status(201).send({
        success: true,
        user,
        token: jwt.token,
      });
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },
];

exports.user_login = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    if (!user) {
      res.status(401).json({ success: false, msg: "Could not log in" });
    }
    if (user) {
      const jwt = await utils.issueJWT(user);
      res.send({
        success: true,
        user,
        token: jwt.token,
      });
    } else {
      res.status(401).json({
        success: false,
        msg: "You entered the wrong user infomation",
      });
    }
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.user_get = async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findOne({ _id })
      .populate({
        path: "appointments",
        populate: { path: "timeSlots" },
      })
      .populate("services");
    if (!user) {
      return res.status(404).send();
    }
    res.send(user.toJSON());
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.user_patch = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "firstName",
    "lastName",
    "title",
    "username",
    "email",
    "password",
    "store",
  ];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const user = await User.findOne({
      _id: req.user._id,
    });
    if (!user) {
      return res.status(404).send();
    }
    // Haven't tested changing stores yet
    if (req.body.store && user.store._id !== req.body.store) {
      const oldStore = await Store.findById(user.store._id);
      const newStore = await Store.findById(req.body.store);
      const foundUser = oldStore.employees.indexOf(user._id);
      if (foundUser >= 0) {
        oldStore.employees.pull(user._id);
        newStore.employees.push(user._id);
        await oldStore.save();
        await oldStore.save();
      }
    }
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.user_delete = async (req, res) => {
  try {
    // Already in pre method, right?
    // await Appointment.deleteMany({owner: req.user._id})
    // await Service.deleteMany({owner: req.user._id})
    // await Timeslot.deleteMany({owner: req.user._id})
    const user = await User.findOne({ _id: req.user._id });
    console.log(user.store);
    // Store hasn't been tested yet
    if (user.store) {
      const store = await Store.findById({ employees: req.user._id });
      const foundUser = store.employees.indexOf(req.user._id);
      if (foundUser >= 0) {
        store.employees.pull(req.user._id);
        await store.save();
      }
    }
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    req.status(500).send();
  }
};
