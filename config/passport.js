const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");


const find = require('../db/find_in_passprt');

// require('./facebook-passport-config');

require('./google-passport-config');


passport.use(new LocalStrategy(
  {usernameField: 'email'},
  (email, password, done) => {   
    find.findByEmail(email, async (err, user) => { // Look up user in the db  
    console.log('Warnin!! new LocalStrategy email: ', email)      
      if(err) return done(err);   
               // перевіряє, чи знайдено помилку. If there's an error in db lookup,return err callback function
      
      if(!user) return done(null, false, { message: 'Incorrect username.' });  // якщо НЕ знайдено жодного користувача, done()зворотний виклик з аргументами, які показують, що помилки НЕ було і НЕ знайдено ЖОДНОГО користувача.
      
      const matchedPassword = await bcrypt.compare(password, user.password);
      if(!matchedPassword) return done(null, false, { message: 'Incorrect password.' });        // перевіряє, чи знайдено користувача, але пароль недійсний.
      
      return done(null, user)             // Повертає done()функцію зворотного виклику з аргументами, які показують, що помилки НЕ було, і користувача знайдено.
    });
  }
));

passport.serializeUser((user, done) => {
  console.log('Serialize user passport local:', user);
  done(null, user.user_id);
});

passport.deserializeUser((id, done) => {  
  console.log("Attempting to deserialize user with ID:", id);
  find.findById(id, (err, user) => { 
    console.log(`Deserialize user passport  local==> ${id} user:`, user);
    if (err) return done(err); 
    done(null, user.id);
  });
});

