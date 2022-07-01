const express = require("express");
const router = new express.Router();
const passport = require("passport");

// Controller
const appointment_controller = require("../controllers/appointment_controller");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  appointment_controller.appointment_post
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  appointment_controller.appointment_get
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  appointment_controller.appointment_patch
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  appointment_controller.appointment_delete
);

router.post(
  "/timeoff",
  passport.authenticate("jwt", { session: false }),
  appointment_controller.timeoff_create
);

router.delete(
  "/timeoff",
  passport.authenticate("jwt", { session: false }),
  appointment_controller.timeoff_create
);

module.exports = router;
