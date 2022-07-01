const { isEqual, parseISO } = require("date-fns");
const Appointment = require("../models/appointment_model");
const Timeslot = require("../models/timeslot_model");
const User = require("../models/user_model");

const createTimeSlotsFromArray = async (array, employee, createdAt) => {
  let slotsArray = [];
  for (let i = 0; i < array.length; i++) {
    const newTimeSlot = await new Timeslot({
      slotDateTime: array[i].time,
      createdAt,
      owner: employee,
      employee,
      timeOff: true,
    });
    await newTimeSlot.save();
    slotsArray.push(newTimeSlot._id);
  }
  return slotsArray;
};

exports.timeoff_create = async (req, res) => {
  try {
    const foundEmployee = await User.findById(req.user._id);
    const timeSlots = await createTimeSlotsFromArray(
      req.body.timeOff,
      foundEmployee._id,
      req.body.createdAt
    );

    const appointment = await new Appointment({
      timeSlots,
      owner: foundEmployee._id,
      employee: foundEmployee._id,
      timeOff: true,
    });
    await appointment.save();

    for (i of timeSlots) {
      const foundTimeslot = await Timeslot.findById(i);
      foundTimeslot.appointment = appointment._id;
      await foundTimeslot.save();
    }

    await foundEmployee.appointments.push(appointment);
    await foundEmployee.save();

    res.send(appointment);
  } catch (e) {
    res.status(500).send({ error: "Error creating time off" });
  }
};

exports.timeoff_remove = async (req, res) => {
  try {
    for (let i = 0; i < req.body.removeTimeOff.length; i++) {
      let givenTimeSlot = req.body.removeTimeOff[i];
      let workingAppointment = await Appointment.findOne({
        _id: givenTimeSlot.appointmentId,
      });
      let workingTimeSlots = await Timeslot.find({
        _id: workingAppointment.timeSlots,
      });
      let foundTimeSlot = workingTimeSlots.find((timeSlot) =>
        isEqual(timeSlot.slotDateTime, parseISO(givenTimeSlot.time))
      );
      let timeSlotIndex = workingAppointment.timeSlots.indexOf(
        foundTimeSlot._id
      );
      if (timeSlotIndex >= -1) {
        workingAppointment.timeSlots.splice(timeSlotIndex, 1);
      }
      if (workingAppointment.timeSlots.length === 0) {
        await User.findOneAndUpdate(
          { _id: req.user._id },
          { $pull: { appointments: workingAppointment._id } }
        );
        await Appointment.deleteOne({ _id: workingAppointment._id });
      } else {
        await workingAppointment.save();
      }
      await Timeslot.deleteOne({ _id: foundTimeSlot._id });
    }
    res.status(200).send();
  } catch (e) {
    res.status(500).send({ error: "Error deleting time off" });
  }
};
