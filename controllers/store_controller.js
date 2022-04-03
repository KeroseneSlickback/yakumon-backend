const Store = require("../models/store_model");
const sharp = require("sharp");

exports.store_create = async (req, res) => {
  if (!req.user.storeOwner) {
    return res.status(401).send();
  }
  const store = new Store({
    ...req.body,
    owners: req.user._id,
  });
  try {
    await store.save();
    res.status(201).send(store);
  } catch (e) {
    res.status(400).send(e);
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
      .populate("owners", "-password");
    if (!store) {
      return res.status(404).send();
    }
    res.send(store);
  } catch (e) {
    res.status(400).send(e);
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
    if (store.owners.indexOf(req.user._id) < 0) {
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
  console.log(req.user);
  try {
    if (!req.user.storeOwner) {
      return res.status(401).send();
    }
    const store = await Store.findOne({ _id: req.params.id });
    if (!store) {
      return res.status(404).send();
    }
    if (store.owners.indexOf(req.user._id) < 0) {
      return res.status(401).send();
    }
    console.log(store);
    // await Store.deleteOne({ _id: store._id });
    res.status(200).send();
  } catch (e) {
    res.status(500).send();
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
    if (store.owners.indexOf(req.user._id) < 0) {
      return res.status(401).send();
    }
    store.picture = buffer;
    await store.save();
    res.send(store);
  } catch (e) {
    res.status(400).send(e);
  }
};
