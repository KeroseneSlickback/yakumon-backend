const express = require("express");
const router = new express.Router();
const passport = require("passport");

const timeoff_controller = require("../controllers/timeoff_controller");

// Controller

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  timeoff_controller.timeoff_create
);

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  timeoff_controller.timeoff_remove
);

module.exports = router;
