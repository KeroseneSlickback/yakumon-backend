const User = require("../models/user_model");
const { body, validationResult } = require("express-validator");
const utils = require("../lib/utils");
const Store = require("../models/store_model");
const sharp = require("sharp");
const { use } = require("passport");

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
      employee: false,
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

exports.user_get_all = async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
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
      .populate("services")
      .populate("store");
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
    "phoneNumber",
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
    if (req.body.store) {
      const store = await Store.findOne({ _id: req.body.store });
      store.employees.push(user._id);
      store.save();
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
    const user = await User.findOne({ _id: req.user._id });
    if (user.store) {
      const store = await Store.findById(user.store);
      const foundUser = await store.employees.indexOf(req.user._id);
      if (foundUser >= 0) {
        store.employees.pull(req.user._id);
        // await store.save();
      }
    }
    if (user.storeOwner) {
      const store = await Store.findOne({
        employees: { $elemMatch: { $eq: user._id } },
      });
      if (store.owners.length > 1) {
        store.owners.pull(req.user._id);
      } else {
        await Store.deleteOne(store._id);
      }
    }
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
};

exports.user_storeOwnerAuth = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.user._id });
    if (!admin.admin) {
      return res.status(401).send();
    }
    const { storeOwner, store, setAsOwner } = req.body;
    const foundStoreOwner = await User.findOne({ _id: storeOwner });
    if (!store) {
      if (foundStoreOwner) {
        if (setAsOwner) {
          foundStoreOwner.storeOwner = true;
          await foundStoreOwner.save();
        } else {
          foundStoreOwner.storeOwner = false;
          await foundStoreOwner.save();
        }
      } else {
        return res.status(401).send();
      }
    } else {
      const foundStore = await Store.findOne({ _id: store });
      if (foundStore) {
        if (setAsOwner) {
          foundStoreOwner.storeOwner = true;
          foundStoreOwner.store = foundStore._id;
          foundStore.owners.push(foundStoreOwner._id);
          await foundStoreOwner.save();
          await foundStore.save();
        } else {
          foundStoreOwner.storeOwner = false;
          foundStoreOwner.store = undefined;
          foundStore.owners.pull(foundStoreOwner._id);
          await foundStoreOwner.save();
          await foundStore.save();
        }
      } else {
        res.status(401).send();
      }
    }
    res.send(foundStoreOwner);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.user_employeeAuth = async (req, res) => {
  try {
    const storeOwner = await User.findOne({ _id: req.user._id });
    if (!storeOwner.storeOwner) {
      return res.status(401).send();
    }
    const { employee, store, setAsEmployee } = req.body;
    const foundEmployee = await User.findOne({ _id: employee });
    const foundStore = await Store.findOne({ _id: store });
    if (foundEmployee || foundStore) {
      if (setAsEmployee) {
        foundEmployee.employee = true;
        foundEmployee.store = foundStore._id;
        foundStore.employees.push(foundEmployee._id);
        console.log("HERE?");
        await foundEmployee.save();
        await foundStore.save();
      } else {
        foundEmployee.employee = false;
        foundEmployee.store = undefined;
        foundStore.employees.pull(foundEmployee._id);
        await foundEmployee.save();
        await foundStore.save();
      }
    } else {
      res.status(401).send();
    }
    res.send(foundEmployee);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.user_picture_upload = async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.picture = buffer;
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
};
