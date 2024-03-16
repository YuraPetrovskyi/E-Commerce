const { pool } = require('./pool');


function findByEmail(email, callback) {
  try {
    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
      if (error) {
        return callback(error, null);
      }
      if (results.rows.length === 0) {
        console.log('findByEmail function can not find the names user!');
        return callback(null, false);
      }    
      const user = results.rows[0];
      console.log('function findByEmail: ', user)
      console.log(results)

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

// Here's an example of what the code will look like after rewriting it to async/await:

// async function findByEmail(email) {
//   try {
//     const results = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (results.rows.length === 0) {
//       console.log('findByEmail function can not find the names user!');
//       return false;
//     }
//     const user = results.rows[0];
//     console.log('function findByEmail: ', user);
//     console.log(results);
//     return user;
//   } catch (error) {
//     console.error('Error in findByEmail:', error);
//     throw error; // Викидаємо помилку, щоб вона могла бути оброблена вище
//   }
// }

// async function findById(id) {
//   try {
//     const results = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
//     if (results.rows.length === 0) {
//       return false;
//     }
//     const user = results.rows[0];
//     console.log('deserialization by findById: ', user);
//     return user;
//   } catch (error) {
//     console.error('Error in findById:', error);
//     throw error; // Викидаємо помилку, щоб вона могла бути оброблена вище
//   }
// }

// module.exports = {
//   findByEmail,
//   findById,
// };
