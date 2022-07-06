const Store = require("../models/store_model");
const sharp = require("sharp");
const User = require("../models/user_model");

exports.store_create = async (req, res) => {
  if (!req.user.storeOwner) {
    return res.status(401).send({ error: "User not authorized" });
  }
  const store = new Store({
    ...req.body,
    owner: req.user._id,
  });
  const _id = req.user.id;
  const user = await User.findOne({ _id });
  console.log(user);
  try {
    await store.save();
    user.ownedStores.push(store._id);
    await user.save();
    res.status(201).send(store);
  } catch (e) {
    res.status(400).send({ error: "Error creating store" });
  }
};

exports.store_get = async (req, res) => {
  try {
    Store.find().exec(function (err, stores) {
      if (err) throw new Error();
      res.send(stores);
    });
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.store_get_single = async (req, res) => {
  const _id = req.params.id;
  try {
    const store = await Store.findOne({ _id })
      .populate("employees", "-password")
      .populate("owner", "-password");
    if (!store) {
      return res.status(404).send({ error: "Error finding store" });
    }
    res.send(store);
  } catch (e) {
    res.status(400).send({ error: "Error finding store" });
  }
};

exports.store_patch = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "storeName",
    "storeType",
    "storeDescription",
    "location",
    "locationLink",
    "hours",
    "storeWebsite",
    "phoneNumber",
  ];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const store = await Store.findOne({ _id: req.params.id });
    if (!store) {
      return res.status(404).send();
    }
    if (store.owner.indexOf(req.user._id) < 0) {
      return res.status(401).send();
    }
    updates.forEach((update) => {
      store[update] = req.body[update];
    });
    await store.save();
    res.send(store);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.store_delete = async (req, res) => {
  try {
    if (!req.user.storeOwner) {
      return res.status(401).send({ error: "User is not authorized" });
    }
    const store = await Store.findOne({
      _id: req.params.id,
    });
    if (!store) {
      return res.status(404).send({ error: "Store not found" });
    }
    if (store.owner.indexOf(req.user._id) < 0) {
      return res.status(401).send({ error: "Store owner not found" });
    }
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { ownedStores: store._id } }
    );
    await Store.deleteOne({ _id: store._id });
    res.status(200).send(store);
  } catch (e) {
    res.status(500).send({ error: "Error deleting store" });
  }
};

exports.store_picture_upload = async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 500, height: 500 })
      .png()
      .toBuffer();
    const store = await Store.findOne({
      _id: req.params.id,
    });
    if (store.owner.indexOf(req.user._id) < 0) {
      return res.status(401).send({ error: "User is not authorized" });
    }
    store.picture = buffer;
    await store.save();
    res.send(store);
  } catch (e) {
    res.status(400).send({ error: "Error uploading picture" });
  }
};
