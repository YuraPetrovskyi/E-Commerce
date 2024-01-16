const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

require('dotenv').config();
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Тут ви можете виконати логіку для збереження користувача в базі даних або взяти інші дії
  // profile містить інформацію про користувача з GitHub

  // Наприклад, якщо ви хочете зберегти користувача, ви можете викликати done з об'єктом користувача
  // done(null, { id: profile.id, username: profile.username });

  // У цьому випадку я лише виведу профіль у консоль
  console.log(profile);
  done(null, profile);
}));