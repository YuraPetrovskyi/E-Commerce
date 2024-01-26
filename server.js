const express = require('express');
const session = require('express-session');
const passport = require('passport');
// const authConfig = require('./config/auth');
const cors = require('cors'); 

require('dotenv').config();

const db_users = require('./db/users');


const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:3001',  // URL вашого клієнтського додатку
  credentials: true,
}));

app.use(express.json()); //Цей рядок дозволяє обробляти запити, які мають тип application/json
app.use(express.urlencoded({ extended: false })); //Цей рядок дозволяє обробляти запити, які мають тип application/x-www-form-urlencoded

require('dotenv').config();
const secret = process.env.secret;
app.use(
  session({ 
    secret: secret, 
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 60*60*1000
    },
    resave: false, 
    saveUninitialized: false 
  })
);

// Підключення конфігурації Passport стратегії
require('./config/passport')

app.use(passport.initialize());
app.use(passport.session());



// Google
app.get('/auth/google', passport.authenticate('google', { 
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3001/login' 
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('secces google sesion')
    res.redirect('http://localhost:3001');
  }
);

// Facebook
// app.get('/login/facebook', passport.authenticate('facebook', {
//   scope: [ 'email' ]
// }));
// app.get(
//   '/oauth2/redirect/facebook',
//   passport.authenticate('facebook', { 
//     failureRedirect: "http://localhost:3001/login", // Адреса вашого фронтенду для перенаправлення при помилці
//     failureMessage: true,
//     successRedirect: "http://localhost:3001/", // Адреса вашого фронтенду для успішного перенаправлення
//   }),
//   function(req, res) {
//     res.redirect('/');
//   }
// );

// Підключення конфігурації GitHub стратегії
// require('./config/github-passport-config');
// app.get('/auth/github',
//   passport.authenticate('github', { scope: ["user"] })
// );

// app.get('/auth/github/callback',
//   passport.authenticate('github', { failureRedirect: '/' }),
//   (req, res) => {
//     // Успішна автентифікація через GitHub
//     res.redirect('/admin');
//   });

app.get('/', ensureAuthenticated, (req, res) => {  
  console.log('користувач автентифікований: ', req.isAuthenticated())
  console.log('session get method ', req.session)
  console.log('req method contains user: ', req.user)
  res.send(`Привіт, це мій перший сервер на Node.js і Express!`);
});



app.post('/login', (req, res, next) => {
  console.log('start to login');
  passport.authenticate('local', function(err, user, info){
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: info.message || 'Incorrect name or password' });
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.json({ redirect: '/' }); // Відправити JSON з об'єктом з полем redirect
    })
  })(req, res, next)
});

app.get('/logout', (req, res) => {
  console.log('started logout')
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.json({ redirect: '/' });
  });
});

app.get('/admin', ensureAuthenticated, (req, res) => {
  console.log('admin page! ok!');
  console.log(req.user);  
  console.log(req.session);
  res.send('Hello admin! this is admin page');
});

app.post('/register', db_users.createUser);

app.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('користувач аутентифікований?', req.isAuthenticated())
    // Якщо користувач аутентифікований, відправте відповідь зі статусом 200 та об'єктом, що містить інформацію про аутентифікацію
    res.status(200).json({ isAuthenticated: true });
  } else {
    console.log('користувач аутентифікований?', req.isAuthenticated())
    // Якщо користувач не аутентифікований, відправте відповідь зі статусом 401 (Unauthorized)
    res.status(401).json({ isAuthenticated: false });
  }
});

app.get('/profile', ensureAuthenticated, (req, res) => {
  const user = req.user;
  res.json(user);
});



app.get('/bad', (req, res) => {
  res.send('bad autorization!!');
});

app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('you are not registreted')
  res.redirect('/bad');
}