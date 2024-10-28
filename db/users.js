const { pgPool, mysqlPool } = require('./pool');

// Визначаємо базу даних, з якою працюємо
const dbType = process.env.DB_TYPE || 'postgres'; // Вибираємо 'postgres' або 'mysql' з .env файлу
// Визначаємо, який пул використовувати
const pool = dbType === 'postgres' ? pgPool : mysqlPool;

const bcrypt = require("bcrypt");

// Функція для вибору правильного плейсхолдера
function getPlaceholder(index) {
  return dbType === 'postgres' ? `$${index}` : `?`;
}

// Get a list of all users.
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY user_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    const rows = dbType === 'postgres' ? results.rows : results; // Для MySQL results
    response.status(200).json(rows)
  })
}
// Get information about a specific user by his user_id.
const getUserById = (request, response) => {
  const user_id = parseInt(request.params.user_id);
  const query = `SELECT * FROM users WHERE user_id = ${getPlaceholder(1)}`;
  pool.query(query, [user_id], (error, results) => {
    if (error) {
      throw error
    }
    const rows = dbType === 'postgres' ? results.rows : results; // Для MySQLresults
    response.status(200).json(rows);
  })
}


// POST register a new user (create)
const createUser = async (request, response) => {
  const { username, email, password } = request.body;
  // const { username, email, password } = data;
  
  console.log('Received data: ', { username, email, password });

  // Check if the email already exists in the database
  const querySelect = `SELECT * FROM users WHERE email = ${getPlaceholder(1)}`;
  const existingUser = await pool.query(querySelect, [email]);
  const rows = dbType === 'postgres' ? existingUser.rows : existingUser[0];
  if (rows.length > 0) {
    // Email already exists, return an error response
    console.log(`A user with email address: ${email}  - already exists! Please choose a different email address or sign in.`)
    return response.status(400).send(`A user with email address: ${email}  - already exists! Please choose a different email address or login.`);
  }
  let salt, hashedPassword;
  try {
    if (password) {    
      try {
        salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
        console.log('Hashed password:', hashedPassword);
      } catch (error) {
        console.error('Password processing error:', error);
        response.status(500).send('Internal Server Error');
      }
    }

    const queryInsertUser = `INSERT INTO users (username, email, password) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}, ${getPlaceholder(3)}) RETURNING *`;
    const userInsertResult = await pool.query(queryInsertUser, [username, email, hashedPassword]);
    
    const userRows = dbType === 'postgres' ? userInsertResult.rows : userInsertResult[0];
    if (!Array.isArray(userRows) || userRows.length < 1) {
      return response.status(500).send('Internal Server Error');
    }

    const userId = userRows[0].user_id;

    const queryInsertCart = `INSERT INTO carts (cart_id, user_id) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}) RETURNING *`;
    const cartInsertResult = await pool.query(queryInsertCart, [userId, userId]);
    const cartRows = dbType === 'postgres' ? cartInsertResult.rows : cartInsertResult[0]
    const cartsCreated = cartRows[0].created_at;

    if (!Array.isArray(cartRows) || cartRows.length < 1) {
      return response.status(500).send('Internal Server Error');
    }
    console.log(`User registered with ID: ${userId}, Name: ${username}, Email: ${email}, Password: ${hashedPassword}, Carts added at: ${cartsCreated}`);
    response.status(201).send(`User registered with ID: ${userId}, Name: ${username}, Email: ${email}, Password: ${hashedPassword}, Carts added at: ${cartsCreated}`);
  } catch (error) {
    console.error('Error:', error);
    response.status(500).send('Internal Server Error');
  }
}

const createGoogleUser = async (profile) => {
  console.log('started createGoogleUser function');
  try {
    const { displayName, emails } = profile;
    const username = displayName;
    const email = emails[0].value;
    console.log('username and email : ', username, email);
    // Генерація випадкового паролю
    const generateRandomPassword = () => {
      const length = 10;
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let password = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      return password;
    };

    const password = generateRandomPassword();
    // const user = { username, email, password };
    console.log('password, username, email:  ', password, username, email);
    
    let salt, hashedPassword;
    try {
      salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      console.log('Hashed password:', hashedPassword);
    } catch (error) {
      console.error('Password processing error:', error);
      response.status(500).send('Internal Server Error');
    }

    // Додавання користувача
    const queryInsertUser = `INSERT INTO users (username, email, password) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}, ${getPlaceholder(3)}) RETURNING *`;
    const userInsertResult = await pool.query(queryInsertUser, [username, email, hashedPassword]);
    const userRows = dbType === 'postgres' ? userInsertResult.rows : userInsertResult[0];
    const userId = userRows[0].user_id;
    if (!Array.isArray(userRows) || userRows.length < 1) {
      return response.status(500).send('Internal Server Error');
    }
    // Додавання кошика для користувача
    const queryInsertCart = `INSERT INTO carts (cart_id, user_id) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}) RETURNING *`;
    const cartInsertResult = await pool.query(queryInsertCart, [userId, userId]);

    const cartRows = dbType === 'postgres' ? cartInsertResult.rows : cartInsertResult[0];
    const cartsCreated = cartRows[0].created_at;

    if (!Array.isArray(cartRows) || cartRows.length < 1) {
      return response.status(500).send('Internal Server Error');
    }
    console.log(`User registered with ID: ${userId}, Name: ${username}, Email: ${email}, Password: ${hashedPassword}, Carts added at: ${cartsCreated}`);
    return { user_id: userId, username, email, hashedPassword, cartsCreated };
    // response.status(201).send(`User registered with ID: ${userId}, Name: ${username}, Email: ${email}, Password: ${hashedPassword}, Carts added at: ${cartsCreated}`);
  } catch (error) {
    console.error('Error creating Google user:', error);
    throw new Error('Failed to create Google user');
  }
};

//  PUT Update user information by their user_id.
const updateUser = async (request, response) => {
  const user_id = parseInt(request.params.user_id)
  const { username, email, password } = request.body
  console.log('Received data: ', { user_id, username, email, password });
  
  if (!user_id) {
    return response.status(400).send('Invalid user_id');
  }
  // Перевірка, чи користувач спробує оновити пароль
  let salt;
  let hashedPassword = null;
  if (password) {    
    try {
      salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      console.log('Hashed password:', hashedPassword);
    } catch (error) {
      console.error('Помилка обробки паролю:', error);
      response.status(500).send('Internal Server Error');
    }
  } 
  const queryUpdateUser = `UPDATE users SET username = ${getPlaceholder(1)}, email = ${getPlaceholder(2)}, password = COALESCE(${getPlaceholder(3)}, password) WHERE user_id = ${getPlaceholder(4)} RETURNING *`;
  pool.query(
    queryUpdateUser,
    // 'UPDATE users SET username = $1, email = $2, password = $3 WHERE user_id = $4  RETURNING *',
    // [username, email, password, user_id ],
    [username, email, hashedPassword, user_id],
    (error, results) => {
      if (error) {
        throw error
      } 
      const rows = dbType === 'postgres' ? results.rows : results;
      if (typeof rows == 'undefined') {
        response.status(404).send(`Resource not found`)
        return
      } else if (Array.isArray(rows) && rows.length < 1) {
        response.status(404).send(`User not found`)
        return
      } 
      const userId = rows[0].user_id;

      const queryUpdateCart = `UPDATE carts SET user_id = ${getPlaceholder(1)} WHERE user_id = ${getPlaceholder(2)} RETURNING *`;
      pool.query(
        queryUpdateCart,
        [userId, user_id],
        (cartError, cartResults) => {
          if (cartError) {
            throw cartError;
          }
          const cartRows = dbType === 'postgres' ? cartResults.rows : cartResults[0];
          if (typeof cartRows == 'undefined') {
            response.status(404).send(`Cart not found`);
            return;
          } else if (Array.isArray(cartRows) && cartRows.length < 1) {
            response.status(404).send(`Cart not found`);
            return;
          }
          response.status(200).send(`User modified with ID: ${userId}`);
        }
      )
    }
  )
}

// DELETE a user by their user_id.
const deleteUser = (request, response) => {
  const user_id = parseInt(request.params.user_id)
  const query = `DELETE FROM users WHERE user_id = ${getPlaceholder(1)}`;

  pool.query(query, [user_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else if (results.rowCount === 0) {
      response.status(404).send(`User not found`);
    } else {
      response.status(200).send(`User deleted with ID: ${user_id}`);
    }
  });
}

module.exports = {
  getUsers,
  getUserById,
  createGoogleUser,
  createUser,
  updateUser,
  deleteUser,
};