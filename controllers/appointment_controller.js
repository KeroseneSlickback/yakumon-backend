const Appointment = require("../models/appointment_model");
const Timeslot = require("../models/timeslot_model");
const User = require("../models/user_model");
const { add, parseISO } = require("date-fns");
const Service = require("../models/service_model");

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

const createTimeSlotsFromService = async (
  service,
  serviceID,
  slotDateTime,
  createdAt,
  employee,
  customer
) => {
  let slotsArray = [];
  for (let i = 0; i <= service.timeSpan; i++) {
    let calculatedDateTime = add(parseISO(slotDateTime), {
      minutes: (i *= 30),
    });
    const newTimeSlot = await new Timeslot({
      slotDateTime: calculatedDateTime,
      createdAt,
      owner: customer ? customer : req.user._id,
      employee,
    });
    await newTimeSlot.save();
    slotsArray.push(newTimeSlot._id);
  }
  return slotsArray;
};

exports.appointment_post = async (req, res) => {
  try {
    // Find the required data from the request body
    const serviceID = req.body.service;
    const service = await Service.findOne({ serviceID });
    const { employee, customer, slotDateTime, createdAt } = req.body;

    // Check for if employee already has those time slots?

    // Timeslot array for building the needed slots for the appointment document
    const timeSlots = await createTimeSlotsFromService(
      service,
      serviceID,
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
    });
    await appointment.save();

    // takes all timeslots and adds the appointment id to them
    for (i of timeSlots) {
      const foundTimeslot = await Timeslot.findById(i);
      foundTimeslot.appointment = appointment._id;
      await foundTimeslot.save();
    }

    // finds employee to add to their appointment array
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

/*

For patch:

- accept:
  employee
  service
  slotDateTime
  alteredAt (createdAt)
  customer

- Pull appointment
- Follow automatic updates for employee, owner (customer), and service
- If service
- Pull timeslots
  - Compare timeslot time
    - Replace if different
- 

  Saving patching service for later to lessen front-end complication
  Regligated to enforcing a new appointment

*/

exports.appointment_patch = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["slotDateTime", "createdAt"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalide updates" });
  }
  try {
    const { slotDateTime, createdAt } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
    })
      .populate("timeSlots")
      .populate("service");

    if (!appointment) {
      return res.status(404).send();
    }

    if (
      appointment.timeSlots[0].slotDateTime > parseISO(slotDateTime) ||
      appointment.timeSlots[0].slotDateTime < parseISO(slotDateTime)
    ) {
      const serviceID = appointment.service._id;
      const service = await Service.findOne({ serviceID });
      const employee = appointment.employee;
      const customer = appointment.owner;
      await Timeslot.deleteMany({ appointment: req.params.id });
      const timeSlots = await createTimeSlotsFromService(
        service,
        serviceID,
        slotDateTime,
        createdAt,
        employee,
        customer
      );
      appointment.timeSlots = timeSlots;
      appointment.save();
    } else {
      res.status(400).send({ error: "Nothing to update" });
      console.log("they match!");
    }
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
