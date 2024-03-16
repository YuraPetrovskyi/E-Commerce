const Pool = require('pg').Pool // or const { Pool }  = require('pg') ---> npm install pg

// ============================= 1 for localhost
// const userNameENV = process.env.user;
// const password = process.env.password;

// const pool = new Pool({
//   user: userNameENV,
//   host: 'localhost',
//   database: 'e_commerce',
//   password: password,
//   port: 5432,
// })

// module.exports = {
//   pool,
// };

// ============================= 2
// const RENDER_DATABASE_USERNAME = process.env.RENDER_DATABASE_USERNAME
// const RENDER_DATABASE_HOST = process.env.RENDER_DATABASE_HOST
// const RENDER_DATABASE_NAME = process.env.RENDER_DATABASE_NAME
// const RENDER_DATABASE_PASSWORD = process.env.RENDER_DATABASE_PASSWORD

// const pool = new Pool({
//   user: RENDER_DATABASE_USERNAME,
//   host: RENDER_DATABASE_HOST,
//   database: RENDER_DATABASE_NAME,
//   password: RENDER_DATABASE_PASSWORD,
//   port: 5432, // Залишаємо стандартний порт
// });


// ============================= 3 for RENDER_EXTERNAL_DATABASE_URL
const connectionString = process.env.RENDER_EXTERNAL_DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Опція для виключення перевірки сертифікату SSL (необхідно для Render)
  }
});


module.exports = {
  pool,
};