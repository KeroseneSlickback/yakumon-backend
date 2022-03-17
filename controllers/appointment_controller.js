const Appointment = require("../models/appointment_model");
const Timeslot = require("../models/timeslot_model");
const User = require("../models/user_model");

/**
  
  req.user._id given by passport for customer
  req.body object: 
  {
    owner: explicitly given because either customer or employee,
    employee: given employee ID from selection,
    service: given service ID from selection,
    slotTime: the given start time of service,
    slotDate: the given date from frontend,
    timeSpan: given number of blocks based from service's timeSpan,
  }

  But what about if employee makes an appointment for the user?
 */

exports.appointment_post = async (req, res) => {
  try {
    const currentTime = Date.now();
    const { owner, employee, service, slotTime, slotDate, timeSpan } = req.body;
    let timeSlots = [];

    for (let i = 1; i <= timeSpan; i++) {
      let calculatedTime;
      // Calculate based on whatever NPM module used
      calculatedTime = slotTime + (i *= 30);

      const newTimeSlot = await new Timeslot({
        slotTime: calculatedTime,
        slotDate,
        createdAt: currentTime,
        owner,
        employee,
      });
      await newTimeSlot.save();
      timeSlots.push(newTimeSlot._id);
    }

    // Might need to merge timeSlots onto appointment? Does mongoose take an array?
    const appointment = new Appointment({
      timeSlots,
      service,
      owner,
      employee,
    });
    await appointment.save();

    for (i of timeSlots) {
      const foundTimeslot = await Timeslot.findById(i);
      foundTimeslot.appointment.push(appointment._id);
      foundTimeslot.save();
    }

    const foundEmployee = await User.findById(employee);
    await foundEmployee.appointments.push(appointment);
    await foundEmployee.save();

    res.status(201).send(appointment);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.appointment_get = async (req, res) => {
  const _id = req.params.id;
  try {
    const appointment = await Appointment.findOne({ _id })
      .populate("timeSlots")
      .populate("service")
      .populate("owner")
      // .populate('store')
      .populate("employee");
    if (!appointment) {
      return res.status(404).send();
    }
    res.send(appointment);
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.appointment_patch = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["slotTime", "slotDate", "service"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalide updates" });
  }
  try {
    const currentTime = Date.now();
    const { owner, employee, service } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      employee: req.user._id,
    })
      .populate("timeSlots")
      .populate("service");
    if (!appointment) {
      return res.status(404).send();
    }

    if (
      appointment.timeSlots[0].slotTime !== slotTime ||
      appointment.timeSlots[0].slotDate !== slotDate
    ) {
      await Timeslot.deleteMany({ appointment: appointment._id });

      let timeSlots = [];

      for (let i = 1; i <= timeSpan; i++) {
        let calculatedTime;
        // Calculate based on whatever NPM module used
        calculatedTime = slotTime + (i *= 30);

        const newTimeSlot = await new Timeslot({
          slotTime: calculatedTime,
          slotDate,
          createdAt: currentTime,
          owner,
          employee,
        });
        await newTimeSlot.save();
        timeSlots.push(newTimeSlot._id);
      }

      // Does this work?
      appointment.timeSlots = timeSlots;
    }

    if (appointment.service !== service) {
      appointment.service = service;
    }

    await appointment.save();
    res.send(appointment);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.appointment_delete = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
    });
    if (!appointment) {
      return res.status(404).send();
    }
    await Timeslot.deleteMany({ appointment: req.params.id });
    res.status(200).send();
  } catch (e) {
    res.status(500).send(e);
  }
};
