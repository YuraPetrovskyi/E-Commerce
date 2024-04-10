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
  (accessToken, refreshToken, profile, done) => {
    // console.log('Warnin!! new GoogleStrategy profile: ', profile)
    // console.log('accessToken: ', accessToken)
    // console.log('refreshToken: ', refreshToken)
    find.findByEmail(profile.emails[0].value, (err, user) => {
      if(err) return done(err);
      
      if (!user) {
        db_users.createGoogleUser(profile).then(newUser => {
          console.log('GoogleStrategy created a new profile:', newUser);
          const token = jwt.sign(
            { user_id: newUser.user_id, email: newUser.email, username: newUser.username }, 
            SECRET_KEY, 
            { expiresIn: '1d' }
          );
          newUser.token = token;  
          done(null, newUser);
        }).catch(err => {
          console.log('Error creating Google user:', err);
          done(err);
        });
        // db_users.createGoogleUser(profile, (err, newUser) => {
        //   if (err) {
        //     console.log('Error creating Google user:', err);
        //     return done(err);
        //   }
        //   console.log('GoogleStrategy created a new profile : ', newUser);
        //   const token = jwt.sign(
        //     { user_id: newUser.user_id, email: newUser.email, username: newUser.username }, 
        //     SECRET_KEY, 
        //     { expiresIn: '1d' }
        //   );
        //   newUser.token = token;
        //   return done(null, newUser);
        // });
      } else {
        const token = jwt.sign(
          { user_id: user.user_id, email: user.email, username: user.username }, 
          SECRET_KEY, 
          { expiresIn: '1d' }
        );
        user.token = token;
        return done(null, user);
      }
    });
  }
));

passport.serializeUser((user, done) => {
  console.log('Serialize user passport google: user and user_id', user, user.user_id);
  done(null, user.user_id);
});

passport.deserializeUser((id, done) => { 
  console.log(`started Deserialize google ${id}`);
  
  find.findById(id,  (err, user) => {
    console.log("Attempting to deserialize user with ID:", id); 
    if (err) return done(err); 
    console.log(`Deserialize user passport google ${id} user ok!:`, user);
    done(null, user);
  });
});


// Here's an example of what the code will look like after rewriting it to async/await:

// passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: `${SERVER_HOST}/auth/google/callback`,
//     prompt: 'select_account'
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       console.log('Warnin!! new GoogleStrategy profile: ', profile);
//       const user = await find.findByEmail(profile.emails[0].value);
//       console.log('user from GoogleStrategy: ', user);
//       if (!user) {
//         const newUser = await db_users.createGoogleUser(profile);
//         console.log('GoogleStrategy created a new profile : ', newUser);
//         return done(null, newUser);
//       }
//       return done(null, user);
//     } catch (error) {
//       return done(error);
//     }
//   }
// ));

// passport.serializeUser((user, done) => {
//   console.log('Serialize user passport google:', user);
//   console.log('Serialize user passport google:', user.user_id);
//   done(null, user.user_id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     console.log('Deserialize user passport google id:', id);
//     const user = await find.findById(id);
//     console.log('Deserialize user passport google user:', user);
//     done(null, user);
//   } catch (error) {
//     done(error);
//   }
// });
