const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const userDB = {
  id: 1,
  username: 'yura',
  password: '111'
};

passport.use(new LocalStrategy(
  (username, password, done) => {
    if (username === userDB.username && password === userDB.password) {
      console.log('pasport: name and password ok');
      return done(null, userDB);
    } else {
      console.log('pasport: name and password NOT ok');
      return done(null, false);
    }
  }
));

// passport.serializeUser((user, done) => {
//   console.log('Serialize user passport local', user);
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   console.log('Deserialize user passport local', id);
//   // const user = (userDB.id === id) ? userDB : false;
//   // console.log('Deserialize user data: ', user)
//   done(null, user);
// });

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});