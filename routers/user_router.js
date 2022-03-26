const express = require("express");
const router = new express.Router();
const multer = require("multer");
const passport = require("passport");

// Controllers
const user_controller = require("../controllers/user_controller");

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

// user Post

router.post("/", user_controller.user_create);

router.post("/login", user_controller.user_login);

router.get("/all", user_controller.user_get_all);

router.get("/:id", user_controller.user_get);

router.patch(
  "/",
  passport.authenticate("jwt", { session: false }),
  user_controller.user_patch
);

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  user_controller.user_delete
);

router.patch(
  "/ownerauthenticate",
  passport.authenticate("jwt", { session: false }),
  user_controller.user_storeOwnerAuth
);

router.patch(
  "/employeeauthenticate",
  passport.authenticate("jwt", { session: false }),
  user_controller.user_employeeAuth
);

router.patch(
  "/picture",
  passport.authenticate("jwt", { session: false }),
  upload.single("picture"),
  user_controller.user_picture_upload
);

module.exports = router;

// auth, and admin?
