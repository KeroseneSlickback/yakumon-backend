const express = require("express");
const router = new express.Router();
const multer = require("multer");
const passport = require("passport");

// Controllers
const store_controller = require("../controllers/store_controller");

// Middleware
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("picture"),
  store_controller.store_create
);

router.get("/", store_controller.store_get);

router.get("/:id/", store_controller.store_get_single);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  upload.single("picture"),
  store_controller.store_patch
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  store_controller.store_delete
);

module.exports = router;

// auth, and admin?
