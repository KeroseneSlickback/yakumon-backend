const Appointment = require("../models/appointment_model");
const Timeslot = require("../models/timeslot_model");
const User = require("../models/user_model");
const { parseISO, addMinutes, compareAsc } = require("date-fns");
const Service = require("../models/service_model");

// date-fns didn't like running in a loop more than twice, had to make it a dedicated async/await function to force it
const addMinutesToDateTime = async (time, step) => {
  return addMinutes(time, (step *= 30));
};

const createTimeSlotsFromService = async (
  service,
  slotDateTime,
  createdAt,
  employee,
  customer
) => {
  let slotsArray = [];
  for (let i = 0; i < service.timeSpan; i++) {
    let parsedDateTime = parseISO(slotDateTime);
    let calculatedDateTime = await addMinutesToDateTime(parsedDateTime, i);
    const newTimeSlot = await new Timeslot({
      slotDateTime: calculatedDateTime,
      createdAt,
      owner: customer ? customer : req.user._id,
      employee,
      blockOrder: i + 1,
    });
    await newTimeSlot.save();
    slotsArray.push(newTimeSlot._id);
  }
  return slotsArray;
};

exports.appointment_post = async (req, res) => {
  try {
    const serviceID = req.body.service;
    const service = await Service.findById(serviceID);
    const { employee, customer, slotDateTime, createdAt, comments } = req.body;

    const timeSlots = await createTimeSlotsFromService(
      service,
      slotDateTime,
      createdAt,
      employee,
      customer
    );

    const appointment = await new Appointment({
      timeSlots,
      service: service._id,
      owner: customer ? customer : req.user._id,
      employee,
      comments,
    });
    await appointment.save();

    for (i of timeSlots) {
      const foundTimeslot = await Timeslot.findById(i);
      foundTimeslot.appointment = appointment._id;
      await foundTimeslot.save();
    }

    const foundEmployee = await User.findById(employee);
    await foundEmployee.appointments.push(appointment);
    await foundEmployee.save();

    res.status(201).send(appointment);
  } catch (e) {
    res.status(400).send({ error: "Error making appointment" });
  }
};

exports.appointment_get = async (req, res) => {
  const _id = req.params.id;
  try {
    const appointment = await Appointment.findOne({ _id })
      .populate("timeSlots")
      .populate("service")
      .populate("owner", "-password")
      .populate({ path: "employee", populate: { path: "store" } });
    if (!appointment) {
      return res.status(404).send({ error: "No appointment found" });
    }
    res.send(appointment);
  } catch (e) {
    res.status(500).send({ error: "Error finding appointment" });
  }
};

exports.appointment_patch = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["slotDateTime", "createdAt", "comments"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalide updates" });
  }
  try {
    const { slotDateTime, createdAt, comments } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
    })
      .populate("timeSlots")
      .populate("service");

    if (!appointment) {
      return res.status(404).send({ error: "No appointment found" });
    }

    let dateComparison = compareAsc(
      appointment.timeSlots[0].slotDateTime,
      parseISO(slotDateTime)
    );
    let commentCheck = comments === appointment.comments;

    if (!commentCheck) {
      appointment.comments = comments;
      await appointment.save();
    }

    if (dateComparison < 0 || dateComparison > 0) {
      const serviceID = appointment.service._id;
      const service = await Service.findById(serviceID);
      const employee = appointment.employee;
      const customer = appointment.owner;
      await Timeslot.deleteMany({ appointment: req.params.id });
      const timeSlots = await createTimeSlotsFromService(
        service,
        slotDateTime,
        createdAt,
        employee,
        customer
      );
      appointment.timeSlots = timeSlots;
      await appointment.save();

      for (i of timeSlots) {
        const foundTimeslot = await Timeslot.findById(i);
        foundTimeslot.appointment = appointment._id;
        await foundTimeslot.save();
      }
    }

    if (commentCheck && dateComparison === 0) {
      return res.status(400).send({ error: "Nothing to update" });
    }
    res.send(appointment);
  } catch (e) {
    res.status(400).send("Error editing appointment");
  }
};

exports.appointment_delete = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id });
    if (!appointment) {
      return res.status(404).send({ error: "No appointment found" });
    }
    const employeeID = appointment.employee;
    await User.findOneAndUpdate(
      { _id: employeeID },
      { $pull: { appointments: appointment._id } }
    );
    await Timeslot.deleteMany({ appointment: appointment._id });
    await Appointment.deleteOne({ _id: req.params.id });
    res.status(200).send();
  } catch (e) {
    res.status(500).send({ error: "Error deleting appointment" });
  }
};
