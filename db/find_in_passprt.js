// const { pool } = require('./pool');

const { pgPool, mysqlPool } = require('./pool');

// Визначаємо базу даних, з якою працюємо
const dbType = process.env.DB_TYPE || 'postgres'; // Вибираємо 'postgres' або 'mysql' з .env файлу
// Визначаємо, який пул використовувати
const pool = dbType === 'postgres' ? pgPool : mysqlPool;

// Функція для вибору правильного плейсхолдера
function getPlaceholder(index) {
  return dbType === 'postgres' ? `$${index}` : `?`;
}

// function findByEmail(email, callback) {
//   console.log('started findByEmail:');
//   console.log('dbType:', dbType);
//   const query = `SELECT * FROM users WHERE email = ${getPlaceholder(1)}`;
//   console.log(query);
//   try {
//     console.log('started try block')
//     pool.query(query, [email], (error, results) => {
//       console.log('started pool.query')

//       if (error) {
//         return callback(error, null);
//       }
//       const rows = dbType === 'postgres' ? results.rows : results[0];  // Для MySQL results[0]
//       if (rows.length === 0) {
//         console.log('findByEmail function can not find the names user!');
//         return callback(null, false);
//       }    
//       const user = rows[0];
//       console.log('function findByEmail: user', user)
//       return callback(null, user);
//     });
//   } catch (error) {
//     // Обробка помилки, якщо вона виникає під час виконання запиту до бази даних
//     console.error('Error in findByEmail:', error);
//     return callback(error, null);
//   }
// }

async function findByEmail(email) {
  console.log('started findByEmail:');
  console.log('dbType:', dbType);
  const query = `SELECT * FROM users WHERE email = ${getPlaceholder(1)}`;
  console.log(query);

  try {
    const results = await pool.query(query, [email]);
    const rows = dbType === 'postgres' ? results.rows : results[0];

    if (rows.length === 0) {
      console.log('findByEmail function cannot find the user!');
      return null; // Повертаємо null, якщо користувача не знайдено
    }

    const user = rows[0];
    console.log('function findByEmail: user', user);
    return user; // Повертаємо знайденого користувача
  } catch (error) {
    console.error('Error in findByEmail:', error);
    throw error;
  }
}

async function findById(id) {
  const query = `SELECT * FROM users WHERE user_id = ${getPlaceholder(1)}`;
  try {
    const results = await pool.query(query, [id]);
    const rows = dbType === 'postgres' ? results.rows : results[0];

    if (rows.length === 0) {
      console.log('findById function cannot find the user with the given ID!');
      return null; // Повертаємо null, якщо користувача не знайдено
    }

    const user = rows[0];
    console.log('deserialization by findById:', user);
    return user; // Повертаємо знайденого користувача
  } catch (error) {
    console.error('Error in findById:', error);
    throw error; // Кидаємо помилку для обробки в іншому місці
  }
}

// function findById(id, callback) {
//   const query = `SELECT * FROM users WHERE user_id = ${getPlaceholder(1)}`;
//   try {
//     pool.query(query, [id], (error, results) => {
//       if (error) {
//         return callback(error, null);
//       }
//       const rows = dbType === 'postgres' ? results.rows : results[0];
//       if (rows.length === 0) {
//         return callback(null, false);
//       }
//       const user = rows[0];
//       console.log('deserialization by findById: ', user);
//       return callback(null, user);
//     });
//   } catch (error) {
//     // Обробка помилки, якщо вона виникає під час виконання запиту до бази даних
//     console.error('Error in findById:', error);
//     return callback(error, null);
//   }
// }

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
