const express = require('express');
const cors = require('cors'); 
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const secret = process.env.secret;
const WEB_APP_URL= process.env.WEB_APP_URL
// const authConfig = require('./config/auth');

const createCheckoutSession = require('./config/checkout'); //for stripe
const webhook = require('./config/webhook');


const db_users = require('./db/users');
const db_products = require('./db/products');
const db_carts = require('./db/carts');
const db_cart_items = require('./db/cart_items');
const db_orders = require('./db/orders');
const db_order_items = require('./db/order_items');

const app = express();
const port = 3000;

app.use(cors({
  origin: WEB_APP_URL,  // URL вашого клієнтського додатку
  credentials: true,
}));

// app.use(express.json()); //Цей рядок дозволяє обробляти запити, які мають тип application/json
app.use(express.urlencoded({ extended: false })); //Цей рядок дозволяє обробляти запити, які мають тип application/x-www-form-urlencoded
app.use(express.json({
  verify: (req, res, buffer) => req['rawBody'] = buffer,
}))
// // Використання отриманого buffer
// app.use((req, res, next) => {
//   console.log('Raw body:', req.rawBody);
//   next();
// });

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
    failureRedirect: `${WEB_APP_URL}/login` 
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('secces google sesion')
    console.log('host: ',`${WEB_APP_URL}`)
    res.redirect(`${WEB_APP_URL}`);
  }
);

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

app.get('/', ensureAuthenticated, (req, res) => {  
  console.log('користувач автентифікований: ', req.isAuthenticated());
  console.log('session get method ', req.session);
  console.log('req method contains user: ', req.user);
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

// app.get('/check-auth', ensureAuthenticated, (req, res) => {
//   if (req.isAuthenticated()) {
//     console.log('користувач аутентифікований :', req.isAuthenticated())
//     console.log('data inform:', req.user)
//     // Якщо користувач аутентифікований, відправте відповідь зі статусом 200 та об'єктом, що містить інформацію про аутентифікацію
//     res.status(200).json({ isAuthenticated: true, username:  req.user.username, user_id: req.user.user_id});
//   } else {
//     console.log('користувач неаутентифікований, результат: ', req.isAuthenticated())
//     // Якщо користувач не аутентифікований, відправте відповідь зі статусом 401 (Unauthorized)
//     res.status(401).json({ isAuthenticated: false });
//   }
// });
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('you are not registreted');
  // res.sendStatus(401);
  return res.status(401).json({ message: 'Unauthorized' });
}

app.get('/check-auth', ensureAuthenticated, (req, res) => {
  console.log('користувач аутентифікований :', req.isAuthenticated());
  res.status(200).json({ isAuthenticated: true, username:  req.user.username, user_id: req.user.user_id});
});

  // 2 PRODUCTS
  app.get('/products/search', db_products.searchProductsName);
  app.get('/products', db_products.getProducts);
  app.get('/products/:product_id', db_products.getProductsById);
  app.post('/products', db_products.createProduct);
  app.put('/products/:product_id', db_products.updateProduct);
  app.delete('/products/:product_id', db_products.deleteProducts);
  
    // 3 CARTS
  app.get('/carts/:user_id', db_carts.getCartsById);
  app.post('/carts/:user_id', db_carts.createCarts); 
  app.put('/carts/:cart_id', db_carts.updateCarts);
  app.delete('/carts/:cart_id', db_carts.deleteCarts);
  
    // 4 Cart Items
  app.get('/cart_items/:cart_id', db_cart_items.getCartItemsByUserId);
  app.post('/cart_items/:cart_id', db_cart_items.createCartItemByCartId); 
  app.put('/cart_items/:cart_item_id', db_cart_items.updateCartItemByCartItemId);
  app.delete('/cart_items/:cart_item_id', db_cart_items.deleteCartItemByCartItemId);
  
    // 5 Orders
  app.get('/orders/:user_id', ensureAuthenticated, db_orders.getOrders );
  app.post('/orders/:user_id', ensureAuthenticated, db_orders.createOrder ); 
  app.put('/orders/:order_id', ensureAuthenticated, db_orders.updateOrderStatus);
  app.delete('/orders/:order_id', ensureAuthenticated, db_orders.deleteOrder);

    // 6 Order Items
  app.get('/order_items/:order_id', ensureAuthenticated, db_order_items.getOrderItems );
  app.post('/order_items/:order_id', ensureAuthenticated, db_order_items.createOrderItem ); 
  app.put('/order_items/:order_item_id', ensureAuthenticated, db_order_items.updateOrderItem );
  app.delete('/order_items/:order_item_id', ensureAuthenticated, db_order_items.deleteOrderItem);

// Stripe 
app.post('/create-checkout-session', createCheckoutSession);

app.post('/webhook', webhook);


// Addition
app.get('/profile', ensureAuthenticated, (req, res) => {
  const user = req.user;
  res.json(user);
});

app.get('/bad', (req, res) => {
  res.send('bad autorization!!');
});

// lisener server
app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});


