const { pool } = require('../db/pool');

const bcrypt = require("bcrypt");

// Get a list of all users.
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY user_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}
// Get information about a specific user by his user_id.
const getUserById = (request, response) => {
  const user_id = parseInt(request.params.user_id)

  pool.query('SELECT * FROM users WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


// POST register a new user (create)
const createUser = async (request, response) => {
  const { username, email, password } = request.body;
  // const { username, email, password } = data;
  
  console.log('Received data: ', { username, email, password });

  // Check if the email already exists in the database
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
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

    const userInsertResult = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
    const userId = userInsertResult.rows[0].user_id;
    if (!Array.isArray(userInsertResult.rows) || userInsertResult.rows.length < 1) {
      return response.status(500).send('Internal Server Error');
    }

    const cartInsertResult = await pool.query('INSERT INTO carts (cart_id, user_id) VALUES ($1, $2) RETURNING *', [userId, userId]);
    const cartsCreated = cartInsertResult.rows[0].created_at;
    if (!Array.isArray(cartInsertResult.rows) || cartInsertResult.rows.length < 1) {
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

    const userInsertResult = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
    const userId = userInsertResult.rows[0].user_id;
    if (!Array.isArray(userInsertResult.rows) || userInsertResult.rows.length < 1) {
      return response.status(500).send('Internal Server Error');
    }

    const cartInsertResult = await pool.query('INSERT INTO carts (cart_id, user_id) VALUES ($1, $2) RETURNING *', [userId, userId]);
    const cartsCreated = cartInsertResult.rows[0].created_at;
    if (!Array.isArray(cartInsertResult.rows) || cartInsertResult.rows.length < 1) {
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
  pool.query(
    'UPDATE users SET username = $1, email = $2, password = COALESCE($3, password) WHERE user_id = $4 RETURNING *',
    // 'UPDATE users SET username = $1, email = $2, password = $3 WHERE user_id = $4  RETURNING *',
    // [username, email, password, user_id ],
    [username, email, hashedPassword, user_id],
    (error, results) => {
      if (error) {
        throw error
      } 
      if (typeof results.rows == 'undefined') {
        response.status(404).send(`Resource not found`)
        return
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`User not found`)
        return
      } 
      const userId = results.rows[0].user_id;

      pool.query(
        'UPDATE carts SET user_id = $1 WHERE user_id = $2 RETURNING *',
        [userId, user_id],
        (cartError, cartResults) => {
          if (cartError) {
            throw cartError;
          }
          if (typeof cartResults.rows == 'undefined') {
            response.status(404).send(`Cart not found`);
            return;
          } else if (Array.isArray(cartResults.rows) && cartResults.rows.length < 1) {
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

  pool.query('DELETE FROM users WHERE user_id = $1', [user_id], (error, results) => {
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