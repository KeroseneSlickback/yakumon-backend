const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user_model");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // secretOrKey: process.env.PUB_KEY.replace(/\\n/g, "\n"),
  secretOrKey: "hello",
  algorithms: ["RS256"],
};

module.exports = (passport) => {
  console.log(process.env.PUB_KEY);
  console.log(process.env.PUB_KEY.replace(/\\n/g, "\n"));
  passport.use(
    new JwtStrategy(options, function (jwt_payload, done) {
      User.findOne({ _id: jwt_payload.sub }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};
