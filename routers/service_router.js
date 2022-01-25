const express = require("express");
const router = new express.Router();

// Controllers
const service_controller = require("../controllers/service_controller");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  service_controller.service_create
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  service_controller.service_get
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  service_controller.service_patch
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  service_controller.service_delete
);
