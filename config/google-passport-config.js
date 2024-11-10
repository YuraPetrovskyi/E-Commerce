const  passport = require('passport');
const  GoogleStrategy = require('passport-google-oauth20').Strategy;

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;


const find = require('../db/find_in_passprt');

const db_users = require('../db/users');
require("dotenv").config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SERVER_HOST = process.env.SERVER_HOST;


passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${SERVER_HOST}/auth/google/callback`,
  prompt: 'select_account'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Warning! New GoogleStrategy profile: ', profile);
    
    const email = profile.emails[0].value;
    let user = await find.findByEmail(email);

    // If user doesn't exist, create a new one
    if (!user) {
      user = await db_users.createGoogleUser(profile);
      console.log('GoogleStrategy created a new profile:', user);
    }
    
    // Create a JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    // Attach token to user
    user.token = token;
    return done(null, user);

  } catch (err) {
    console.error('Error in Google Strategy:', err);
    return done(err, null);
  }
}
));

passport.serializeUser((user, done) => {
  console.log('Serialize user passport google: user and user_id', user, user.user_id);
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserialize user passport google id:', id);
    const user = await find.findById(id);
    console.log('Deserialize user passport google user:', user);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
