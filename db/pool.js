const Pool = require('pg').Pool // or const { Pool }  = require('pg') ---> npm install pg

const isProduction = process.env.NODE_ENV === "production";

const connectionStringRender = process.env.RENDER_EXTERNAL_DATABASE_URL;
const connectionStringLocal = `postgresql://${process.env.user}:${process.env.password}@localhost:5432/e_commerce`;

const poolConfig = isProduction ? {
    connectionString: connectionStringRender,
    ssl: {
      rejectUnauthorized: false // Необхідно для Render, щоб виключити перевірку сертифікату SSL
    }
  } : {
    connectionString: connectionStringLocal
}; 

const pgPool = new Pool(poolConfig);

const mysql = require('mysql2/promise');  // MySQL (promise-based)
// Підключення до MySQL на Hostinger
const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,};

// Функція для створення підключення до MySQL
const mysqlPool = mysql.createPool(mysqlConfig);

module.exports = {
  pgPool,
  mysqlPool    
};


// ============================= 1 only for Render DB
// const connectionStringRender = process.env.RENDER_EXTERNAL_DATABASE_URL;
// const pool = new Pool({
//   connectionString: connectionStringRender,
//   ssl: {
//     rejectUnauthorized: false // Опція для виключення перевірки сертифікату SSL (необхідно для Render)
//   }
// });
// module.exports = {
//   pool,
// };



// ============================= 2 only for localhost
// const userNameENV = process.env.user;
// const password = process.env.password;

// const pool = new Pool({
//   user: process.env.user,
//   host: 'localhost',
//   database: 'e_commerce',
//   password: process.env.password,
//   port: 5432,
// })
// module.exports = {
//   pool,
// };

// ============================= 3
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