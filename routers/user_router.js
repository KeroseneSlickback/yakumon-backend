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

// ********

// Create a seperate section where the User/store uploads their photos
// Patch as well

// ********

// user Post

router.post("/", user_controller.user_create);

router.post("/login", user_controller.user_login);

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

module.exports = router;

// auth, and admin?
