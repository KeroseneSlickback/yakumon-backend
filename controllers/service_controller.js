const Appointment = require("../models/appointment_model");
const Service = require("../models/service_model");
const User = require("../models/user_model");

exports.service_create = async (req, res) => {
  const service = new Service({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await service.save();
    const user = await User.findById(req.user._id);
    await user.services.push(service._id);
    await user.save();
    res.status(201).send(service);
  } catch (e) {
    res.status(400).send({ error: "Error creating service" });
  }
};

exports.service_patch = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["serviceName", "timeSpan", "price"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!service) {
      return res.status(404).send();
    }
    updates.forEach((update) => {
      service[update] = req.body[update];
    });
    await service.save();
    res.send(service);
  } catch (e) {
    res.status(400).send({ error: "Error patching service" });
  }
};

exports.service_delete = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!service) {
      return res.status(404).send();
    }
    const user = await User.findById(req.user._id);
    const foundService = user.services.indexOf(req.params.id);
    if (foundService >= 0) {
      user.services.pull(req.params.id);
    }
    res.status(200).send();
  } catch (e) {
    res.status(500).send({ error: "" });
  }
};
