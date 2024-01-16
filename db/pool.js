const Pool = require('pg').Pool // or const { Pool }  = require('pg') ---> npm install pg

const userNameENV = process.env.user;
const password = process.env.password;

const pool = new Pool({
  user: userNameENV,
  host: 'localhost',
  database: 'e_commerce',
  password: password,
  port: 5432,
})

module.exports = {
  pool,
};