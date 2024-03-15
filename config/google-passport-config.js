const  passport = require('passport');
const  GoogleStrategy = require('passport-google-oauth20').Strategy;
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
    
    console.log('Warnin!! new GoogleStrategy profile: ', profile)
    const user = await find.findByEmail(profile.emails[0].value, async (err, user) => {
      console.log('user from GoogleStrategy: ', user);
      if(err) return done(err);
      
      if(!user) {
        const newUser = await db_users.createGoogleUser(profile);
        console.log('GoogleStrategy created a new profile : ', newUser)
        return done(null, newUser);
      }
      return done(null, user)
    });
  }
));

passport.serializeUser((user, done) => {
  console.log('Serialize user passport google:', user);
  console.log('Serialize user passport google:', user.user_id);

  done(null, user.user_id);
});

passport.deserializeUser((id, done) => {  
  console.log('Deserialize user passport google id:', id);
  find.findById(id,  (err, user) => { 
    console.log('Deserialize user passport google id:', id);
    console.log('Deserialize user passport google user:', user)
    if (err) return done(err); 
    done(null, user);
  });
});