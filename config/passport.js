const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");

// const jwt = require('jsonwebtoken');

const find = require('../db/find_in_passprt');

// require('./facebook-passport-config');
require('./google-passport-config');


// passport.use(new LocalStrategy(
//   {usernameField: 'email'}, //визначає, що для аутентифікації буде використовуватися поле електронної пошти користувача замість типового поля, яке за замовчуванням має назву username.
//   (email, password, done) => {   
//     find.findByEmail(email, async (err, user) => { // Look up user in the db  
//     console.log('Warnin!! new LocalStrategy email: ', email)      
//       if(err) return done(err);   
//                // перевіряє, чи знайдено помилку. If there's an error in db lookup,return err callback function
      
//       if(!user) return done(null, false, { message: 'Incorrect username.' });  // якщо НЕ знайдено жодного користувача, done()зворотний виклик з аргументами, які показують, що помилки НЕ було і НЕ знайдено ЖОДНОГО користувача.
      
//       const matchedPassword = await bcrypt.compare(password, user.password);
//       if(!matchedPassword) return done(null, false, { message: 'Incorrect password.' });        // перевіряє, чи знайдено користувача, але пароль недійсний.
      
//       // const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);
//       // console.log('token =============>', token);
//       // user.token = token;
//       return done(null, user); // Повертає done()функцію зворотного виклику з аргументами, які показують, що помилки НЕ було, і користувача знайдено.
//     });
//   }
// ));


passport.use(new LocalStrategy(
  { usernameField: 'email' }, // Вказуємо поле для аутентифікації (email)
  async (email, password, done) => {   
    try {
      // Замість колбеку використовуємо await для отримання користувача
      const user = await find.findByEmail(email); 
      
      console.log('Warning!! new LocalStrategy email: ', email);
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      // Порівнюємо паролі
      const matchedPassword = await bcrypt.compare(password, user.password);
      if (!matchedPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user); // Передаємо користувача, якщо все правильно
    } catch (err) {
      return done(err);
    }
  }
));

// passport.serializeUser((user, done) => {
//   console.log('Serialize user passport local:', user);
//   done(null, user.user_id);
// });


// passport.deserializeUser((id, done) => {  
//   console.log("Attempting to deserialize user with ID:", id);
//   find.findById(id, (err, user) => { 
//     console.log(`Deserialize user passport  local==> ${id} user:`, user);
//     if (err) return done(err); 
//     done(null, user);
//   });
// });


passport.serializeUser((user, done) => {
  console.log('Serialize user passport local:', user);
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {  
  console.log("Attempting to deserialize user with ID:", id);
  try {
    const user = await find.findById(id); // Замість колбеку використовуємо await
    console.log(`Deserialize user passport local ==> ${id} user:`, user);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
