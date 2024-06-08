const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};

module.exports = (passport, getUserByUsername) => {
  passport.use(
    new JwtStrategy(options, function (jwt_payload, done) {
      if (jwt_payload == null) {
        return done(new Error("JWT payload is empty"), false);
      }
      const user = getUserByUsername(jwt_payload.username);
      if (user == null) {
        return done(null, false);
      } else {
        console.log('from passport');
        console.log(user);
        return done(null, user);
      }
    })
  );
};
