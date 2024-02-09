const  passport = require('passport');
const  FacebookStrategy = require('passport-facebook');
require("dotenv").config();

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email', 'photos' ]
},
function(accessToken, refreshToken, profile, cb) {
  console.log('Warnin!! new FacebookStrategy profile: ', profile)

  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

