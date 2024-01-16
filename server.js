const express = require('express');
const session = require('express-session');
const passport = require('passport');
// const authConfig = require('./config/auth');

require('dotenv').config();

const app = express();
const port = 3000;

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

// Підключення конфігурації GitHub стратегії
require('./config/github-passport-config');


app.get('/', (req, res) => {  
  console.log('користувач автентифікований: ', req.isAuthenticated())
  console.log('session get method ', req.session)
  res.send(`Привіт, це мій перший сервер на Node.js і Express!`);
});

app.get('/bad', (req, res) => {
  res.send('bad admin');
});

app.post('/login', (req, res, next) => {
  console.log('start to login');
  passport.authenticate('local', function(err, user){
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send('incorrect name or password')
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/admin');
    })
  })(req, res, next)
});

app.get('/logout', (req, res) => {
  console.log('started logout')
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get('/admin', ensureAuthenticated, (req, res) => {
  console.log('admin page! ok!')
  console.log('session get method: ')
  console.log(req.session)
  
  res.send('Hello admin! this is admin page')
});



app.get('/auth/github',
  passport.authenticate('github', { scope: ["user"] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Успішна автентифікація через GitHub
    res.redirect('/admin');
  });


app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/bad');
}