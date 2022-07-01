const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const logger = require("morgan");
const passport = require("passport");
const path = require("path");
require("dotenv").config({ path: __dirname + "/config/.env" });
require("./db/mongoose");
require("./lib/passport")(passport);

const PORT = process.env.PORT || 8888;

// Routers here
const user_router = require("./routers/user_router");
const store_router = require("./routers/store_router");
const service_router = require("./routers/service_router");
const appointment_router = require("./routers/appointment_router");
const timeoff_router = require("./routers/timeoff_router");

// Global middleware here

const app = express();

app.use(passport.initialize());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Middleware routes
// app.use('/users', user.router)
app.use("/store", store_router);
app.use("/user", user_router);
app.use("/service", service_router);
app.use("/appointment", appointment_router);
app.use("/timeoff", timeoff_router);

app.get("*", (req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

app.use(function (req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
});

app.listen(PORT, () => {
  console.log(`Backend of Yakumon is listening on port ${PORT}`);
});
