const { pool } = require('./pool');


function findByEmail(email, callback) {
  try {
    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
      if (error) {
        return callback(error, null);
      }
      if (results.rows.length === 0) {
        console.log('findByUsername function can not find the names user!');
        return callback(null, false);
      }    
      const user = results.rows[0];
      // console.log('function findByUsername: ', user)
      // console.log(results)

      return callback(null, user);
    });
  } catch (error) {
    // Обробка помилки, якщо вона виникає під час виконання запиту до бази даних
    return callback(error, null);
  }
}

function findById(id, callback) {
  try {
    pool.query('SELECT * FROM users WHERE user_id = $1', [id], (error, results) => {
      if (error) {
        return callback(error, null);
      }
      if (results.rows.length === 0) {
        return callback(null, false);
      }
      const user = results.rows[0];
      console.log('deserialization by findById: ', user)
      return callback(null, user);
    });
  } catch (error) {
    // Обробка помилки, якщо вона виникає під час виконання запиту до бази даних
    console.error('Error in findById:', error);
    return callback(error, null);
  }
}

module.exports = {
  findByEmail,
  findById,
};