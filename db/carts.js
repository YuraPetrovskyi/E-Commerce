const { pgPool, mysqlPool } = require('./pool');

// Визначаємо базу даних, з якою працюємо
const dbType = process.env.DB_TYPE || 'postgres'; // Вибираємо 'postgres' або 'mysql' з .env файлу
// Визначаємо, який пул використовувати
const pool = dbType === 'postgres' ? pgPool : mysqlPool;

// Функція для вибору правильного плейсхолдера
function getPlaceholder(index) {
  return dbType === 'postgres' ? `$${index}` : `?`;
}

// Get the user's cart by their user_id.
const getCartsById = (request, response) => {
  const user_id = parseInt(request.params.user_id);
  
  const query = `SELECT * FROM carts WHERE user_id = ${getPlaceholder(1)}`;
  pool.query(query, [user_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else {
      const rows = dbType === 'postgres' ? results.rows : results;
      if (rows.length === 0) {
        response.status(404).send('Cart not found');
      } else {
        response.status(200).json(rows);
      }
    }
  });
};

// Create a new cart for an existing user with their user_id.
const createCarts = (request, response) => {
  const user_id = parseInt(request.params.user_id);
  console.log('recive user_id:', user_id);
  
  const query = `INSERT INTO carts (cart_id, user_id) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}) RETURNING *`;
  pool.query(query, [user_id, user_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else {
      const rows = dbType === 'postgres' ? results.rows : results;
      if (!Array.isArray(rows) || rows.length < 1) {
        response.status(500).send('Internal Server Error');
      } else {
        const cartId = rows[0].cart_id;
        response.status(201).send(`Cart created with ID: ${cartId} for user with ID: ${user_id}`);
      }
    }
  });
};

// Update a cart by its cart_id.
const updateCarts = (request, response) => {
  const cart_id = parseInt(request.params.cart_id);
  const { user_id, created_at } = request.body;

  if (!user_id || !created_at) {
    return response.status(400).send('User ID and created_at are required for updating the cart.');
  }

  const query = `UPDATE carts SET user_id = ${getPlaceholder(1)}, created_at = ${getPlaceholder(2)} WHERE cart_id = ${getPlaceholder(3)} RETURNING *`;
  pool.query(query, [user_id, created_at, cart_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else {
      const rows = dbType === 'postgres' ? results.rows : results;
      if (!Array.isArray(rows) || rows.length < 1) {
        response.status(404).send('Cart not found');
      } else {
        response.status(200).send(`Cart updated with ID: ${cart_id}`);
      }
    }
  });
};

// DELETE a cart by their cart_id.
const deleteCarts = (request, response) => {
  const cart_id = parseInt(request.params.cart_id);
  
  const query = `DELETE FROM carts WHERE cart_id = ${getPlaceholder(1)} RETURNING *`;
  pool.query(query, [cart_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else {
      const rows = dbType === 'postgres' ? results.rows : results;
      if (!Array.isArray(rows) || rows.length < 1) {
        response.status(404).send('Cart not found');
      } else {
        const deletedCarts = rows[0];
        response.status(200).send(`Cart deleted: Cart_id: ${deletedCarts.cart_id}, User_id: ${deletedCarts.user_id}, Created_at: ${deletedCarts.created_at}`);
      }
    }
  });
};


module.exports = {
  getCartsById,
  createCarts,
  updateCarts,
  deleteCarts,
}