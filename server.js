const express = require('express');
const cors = require('cors'); 
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
// const MongoDBStore = require('connect-mongodb-session')(session);

require('dotenv').config();

// ================================ JWT authenticate
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const find = require('./db/find_in_passprt');
const SECRET_KEY = process.env.JWT_SECRET;

// ================================ Redis
const { createClient } = require('redis');
const RedisStore = require("connect-redis").default;

const clientRedis = createClient({
    password:  process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});
// Ініціалізація підключення до Redis
clientRedis.connect().catch((err) => {
  console.error('Error connecting to Redis:', err);
});
const storeRedis = new RedisStore({ client: clientRedis });

// ================================ MongoDB with mongoose
const uri =process.env.MONGODB_URI;
// Підключення до MongoDB за допомогою Mongoose
const mongoose = require('mongoose');
mongoose.connect(`${uri}`);
// Створення моделі для сесій
const Session = mongoose.model('Session', new mongoose.Schema({
  _id: String,
  session: Object,
  expires: Date
}));
const storeMongo = new session.MemoryStore();

// ================================ MongoDB with connect-mongodb-session
const MongoDBStore = require('connect-mongodb-session')(session);
const storeMongoDB = new MongoDBStore({
    uri: uri,
    databaseName: 'sample_mflix',
    collection: 'session'
  });
storeMongoDB.on('error', function(error) {
  console.log(error);
});
// ================================ MongoDB with connect-mongo
const MongoStore = require('connect-mongo');
const storeMongoConnect = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
//=================================================================


// ================================ Stripe
const createCheckoutSession = require('./config/checkout'); //for stripe
const webhook = require('./config/webhook');

// ================================ DB
const db_users = require('./db/users');
const db_products = require('./db/products');
const db_carts = require('./db/carts');
const db_cart_items = require('./db/cart_items');
const db_orders = require('./db/orders');
const db_order_items = require('./db/order_items');

// ================================ app
const app = express();

// ================================ MemoryStore
const storeMemoryStore = new session.MemoryStore();
// ================================ session
app.use(
  session({ 
    secret: process.env.secret, 
    store: storeMongoConnect,
    cookie: {
      path: '/',
      httpOnly: true, 
      // secure: true,
      secure: process.env.NODE_ENV === "production", // Використовуйте secure cookies тільки в продакшні
      maxAge: 60*60*1000, // - maxAge - становлює кількість мілісекунд до завершення терміну дії файлу cookie. У цьому випадку ми встановлюємо термін його дії через 24 години. 
      sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',  // - sameSite -встановлюємо її "none", щоб дозволити міжсайтовий файл cookie через різні браузери.
      // secure: true, // - secure - щоб він надсилався на сервер лише через HTTPS.
    },    
    resave: false, 
    saveUninitialized: false,
  })
);
app.use(cookieParser());

//  ================================ Cors
const WEB_APP_URL= process.env.WEB_APP_URL
// app.use(cors({
//   origin: WEB_APP_URL,  // URL вашого клієнтського додатку
//   credentials: true,
// }));
const allowedOrigins = ['https://e-commerce-jjez.onrender.com','http://localhost:3001'];
app.use(cors({
  origin: function(origin, callback){
    // Дозвольте запити без 'origin' (наприклад, мобільні додатки або curl запити)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'CORS policy does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Дозволяє обробку cookies через CORS
}));

app.use(express.urlencoded({ extended: false })); //Цей рядок дозволяє обробляти запити, які мають тип application/x-www-form-urlencoded
app.use(express.json({
  verify: (req, res, buffer) => req['rawBody'] = buffer,
}))
// Використання отриманого buffer
// app.use((req, res, next) => {
//   console.log('Raw body:', req.rawBody);
//   next();
// });

// ================================ Passport 
require('./config/passport')
app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//   console.log("Request headers:", req.headers);
//   console.log("Session ID from cookies:", req.cookies);
//   next();
// });

// ================================ check-auth
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('ensureAuthenticated - go to next without token!!!!!')
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('ensureAuthenticated authHeader: ==========>', authHeader);
  console.log('ensureAuthenticated token: ==========>', token);
  if (token == null) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    console.log('JWT verification started, user:', user);
    if (err) {
      console.log('Token verification failed:', err);
      return res.status(403).json({ message: 'Token is invalid, forbidden' });
    }
    req.user = user;
    next();
  });
}

app.get('/check-auth', ensureAuthenticated, (req, res) => {
  console.log('користувач аутентифікований :', req.isAuthenticated());
  console.log('користувач user :', req.user);
  res.status(200).json({ 
    isAuthenticated: true, 
    // username: req.user.username, 
    // user_id: req.user.user_id,
    user: req.user,
    // email: req.user.email
  });
});



// ================================ JWT authenticate
app.post('/loginjwt', (req, res) => {
  // Аутентифікація користувача...
  console.log('req body ===========> ', req.body);
  const { email, password } = req.body;
    
  find.findByEmail(email, async (err, user) => { // Look up user in the db  
    console.log('Warnin!! JWT Strategy is starting findByEmail')      
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username or password.' });
    }

    try {
      const matchedPassword = await bcrypt.compare(password, user.password);
      if (!matchedPassword) {
        return res.status(401).json({ message: 'Incorrect username or password.' });
      }
      console.log('user is finded ==========>', user);
      const token = jwt.sign({ user_id: user.user_id, email: user.email, username: user.username}, SECRET_KEY, { expiresIn: '1d' });
      res.status(200).json({ token, user }); // Відправлення токена клієнту
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError);
      res.status(500).json({ message: 'Internal server error during password comparison' });
    }
  }); 
  // res.json({ token });

  // res.status(200).json({ user });
});



// ================================ Passport authenticate
//Google strategy
app.get('/auth/google', passport.authenticate('google', { 
  scope: ['profile', 'email']}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${WEB_APP_URL}/login` 
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('secces google sesion')
    console.log('host: ',`${WEB_APP_URL}`)
    res.redirect(`${WEB_APP_URL}`);
  }
);
//Local strategy
app.post('/login', (req, res, next) => {
  console.log('start to login');
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log('return next(err)....');
      return next(err);
    }
    if (!user) {
      console.log("return res.status(401).json({ error: info.message || 'Incorrect name or password' });");
      return res.status(401).json({ error: info.message || 'Incorrect name or password' });
    }
    req.logIn(user, (err) => {
      console.log(' req.logIn started ...');
      if (err) {
        return next(err);
      }
      console.log('req.logIn is ok, you will redirect: "/" ');
      // console.log(' token: req.user.token', req.user.token);
      return res.status(200).json({ 
        redirect: '/',
        // token: req.user.token
      }); 
    })
  })(req, res, next)
});

app.get('/logout', (req, res, next) => {
  console.log('started logout');
  console.log('req.body: =====>', req.body);
  console.log('req: =====>', req);

  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.json({ redirect: '/' });
  });
});

// ================================ Register
app.post('/register', db_users.createUser);

// ================================ Home
app.get('/', ensureAuthenticated, (req, res) => {  
  console.log('користувач автентифікований паспортом: ', req.isAuthenticated());
  console.log('session get method ', req.session);
  console.log('req method contains user: ', req.user);
  console.log('користувач автентифікований токеном: ', req.user);
});

// ================================ Products
app.get('/products/search', db_products.searchProductsName);
app.get('/products', db_products.getProducts);
app.get('/products/:product_id', db_products.getProductsById);
app.post('/products', ensureAuthenticated, db_products.createProduct);
app.put('/products/:product_id', ensureAuthenticated, db_products.updateProduct);
app.delete('/products/:product_id', ensureAuthenticated, db_products.deleteProducts);
  
// ================================ Carts
app.get('/carts/:user_id', db_carts.getCartsById);
app.post('/carts/:user_id', ensureAuthenticated, db_carts.createCarts); 
app.put('/carts/:cart_id', ensureAuthenticated, db_carts.updateCarts);
app.delete('/carts/:cart_id', ensureAuthenticated, db_carts.deleteCarts);
  
// ================================ Cart Items
app.get('/cart_items/:cart_id', db_cart_items.getCartItemsByUserId);
app.post('/cart_items/:cart_id', ensureAuthenticated, db_cart_items.createCartItemByCartId); 
app.put('/cart_items/:cart_item_id', ensureAuthenticated, db_cart_items.updateCartItemByCartItemId);
app.delete('/cart_items/:cart_item_id', ensureAuthenticated, db_cart_items.deleteCartItemByCartItemId);
  
// ================================ Orders
app.get('/orders/:user_id', ensureAuthenticated, db_orders.getOrders );
app.post('/orders/:user_id', ensureAuthenticated, db_orders.createOrder ); 
app.put('/orders/:order_id', ensureAuthenticated, db_orders.updateOrderStatus);
app.delete('/orders/:order_id', ensureAuthenticated, db_orders.deleteOrder);

// ================================ Order Items
app.get('/order_items/:order_id', ensureAuthenticated, db_order_items.getOrderItems );
app.post('/order_items/:order_id', ensureAuthenticated, db_order_items.createOrderItem ); 
app.put('/order_items/:order_item_id', ensureAuthenticated, db_order_items.updateOrderItem );
app.delete('/order_items/:order_item_id', ensureAuthenticated, db_order_items.deleteOrderItem);

// ================================ Stripe 
app.post('/create-checkout-session', createCheckoutSession);

app.post('/webhook', webhook);


// ================================ Addition
app.get('/profile', ensureAuthenticated, (req, res) => {
  const user = req.user;
  res.json(user);
});
app.get('/bad', (req, res) => {
  res.send('bad autorization!!');
});
app.get('/admin', ensureAuthenticated, (req, res) => {
  console.log('admin page! ok!');
  console.log(req.user);  
  console.log(req.session);
  res.send('Hello admin! this is admin page');
});
// app.get('/movies', async (req, res) => {
//   const clientM = await connectToDatabase();
//   await run(req, res, clientM);
//   await clientM.close(); // Закриття підключення після виконання запиту
// });

app.get("/health", (req, res) => { 
  res.sendStatus(200); 
});

// ================================ lisener server
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});

// // Facebook
// app.get('/auth/facebook',
//   passport.authenticate('facebook'));
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { 
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




// //  MongoDB conection
// const MongoDBStore = require('connect-mongodb-session')(session);

// const { MongoClient } = require("mongodb");
// const clientMongo = new MongoClient(uri);

// // Функція для підключення до MongoDB
// const connectToDatabase = async () => {
//   console.log('storeMemoryStore...')
//   await clientMongo.connect();
//   return clientMongo;
// };

// const run = async (request, response, clientMongo) => {
//   try {
//     console.log('started')
//     const database = clientMongo.db('sample_mflix');
//     const movies = database.collection('movies');

//     // Запит на пошук фільму з назвою 'Back to the Future'
//     const query = { title: 'Back to the Future' };
//     const movie = await movies.findOne(query);

//     console.log(movie);
//     response.status(200).json(movie);
//   } catch (error) {
//     console.error(error);
//     response.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// const storeMongoDB = new MongoDBStore({
//     uri: uri,
//     databaseName: 'sample_mflix',
//     collection: 'session'
//   });
//   storeMongoDB.on('error', function(error) {
//     console.log(error);
//   });