const { pgPool, mysqlPool } = require('./pool');

// Визначаємо базу даних, з якою працюємо
const dbType = process.env.DB_TYPE || 'postgres'; // Вибираємо 'postgres' або 'mysql' з .env файлу
// Визначаємо, який пул використовувати
const pool = dbType === 'postgres' ? pgPool : mysqlPool;

// Функція для вибору правильного плейсхолдера
function getPlaceholder(index) {
  return dbType === 'postgres' ? `$${index}` : `?`;
}

// Get information about a specific product by his product_id.
const getCartItemsByUserId = async (request, response) => {
  const cart_id = parseInt(request.params.cart_id);
  const query = `SELECT * FROM cart_items WHERE cart_id = ${getPlaceholder(1)}`;

  try {
    const results = await pool.query(query, [cart_id]);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    response.status(200).json(rows);
  } catch (error) {
    console.error('Error in getCartItemsByUserId:', error);
    response.status(500).send('Internal Server Error');
  }
};

// POST a new cart_items (add)
const createCartItemByCartId = async (request, response) => {
  const cart_id = parseInt(request.params.cart_id);
  const { product_id, quantity } = request.body;

  try {
    // Отримуємо інформацію про кількість товару на складі
    const queryProduct = `SELECT inventory FROM products WHERE product_id = ${getPlaceholder(1)}`;
    const productResults = await pool.query(queryProduct, [product_id]);

    const rows = dbType === 'postgres' ? productResults.rows : productResults[0];
    if (rows.length === 0) {
      return response.status(404).send('Product not found');
    }

    const availableInventory = rows[0].inventory;

    // Перевіряємо, чи вистачає товару на складі
    if (quantity <= availableInventory) {
      // Додаємо товар у кошик, якщо кількість валідна
      const queryInsert = `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}, ${getPlaceholder(3)})`;
      await pool.query(queryInsert, [cart_id, product_id, quantity]);

      // Додаємо запит для отримання щойно доданого елемента (особливо для MySQL/MariaDB)
      const querySelectNewItem = `SELECT * FROM cart_items WHERE cart_id = ${getPlaceholder(1)} AND product_id = ${getPlaceholder(2)}`;
      const insertResults = await pool.query(querySelectNewItem, [cart_id, product_id]);

      const insertRows = dbType === 'postgres' ? insertResults.rows : insertResults[0];

      if (insertRows.length === 0) {
        return response.status(500).send('Internal Server Error');
      }

      response.status(201).send(`Product added to cart with ID: ${insertRows[0].cart_id}, Product ID: ${insertRows[0].product_id}, Quantity: ${insertRows[0].quantity}`);
    } else {
      response.status(400).send('Requested quantity exceeds available inventory');
    }
  } catch (error) {
    console.error('Error in createCartItemByCartId:', error);
    response.status(500).send('Internal Server Error');
  }
};


// PUT update cart_items using cart_item_id
const updateCartItemByCartItemId = async (request, response) => {
  const cart_item_id = parseInt(request.params.cart_item_id);
  const { quantity } = request.body;

  console.log('Received data: ', { cart_item_id, quantity });

  // Запит для оновлення
  const queryUpdate = `UPDATE cart_items SET quantity = ${getPlaceholder(1)} WHERE cart_item_id = ${getPlaceholder(2)}`;
  // Запит для отримання оновленого рядка
  const querySelect = `SELECT * FROM cart_items WHERE cart_item_id = ${getPlaceholder(1)}`;

  try {
    // Виконуємо оновлення
    await pool.query(queryUpdate, [quantity, cart_item_id]);

    // Отримуємо оновлені дані
    const results = await pool.query(querySelect, [cart_item_id]);
    const rows = dbType === 'postgres' ? results.rows : results[0];

    if (!Array.isArray(rows) || rows.length < 1) {
      return response.status(404).send('Cart item not found');
    }

    response.status(200).send(`Cart item updated with ID: ${rows[0].cart_item_id}, Quantity: ${rows[0].quantity}`);
  } catch (error) {
    console.error('Error in updateCartItemByCartItemId:', error);
    response.status(500).send('Internal Server Error');
  }
};


// DELETE cart_item using cart_item_id
const deleteCartItemByCartItemId = async (request, response) => {
  const cart_item_id = parseInt(request.params.cart_item_id);
  console.log('Received data: ', { cart_item_id });

  // Виконуємо запит для отримання інформації про елемент перед його видаленням
  const querySelect = `SELECT * FROM cart_items WHERE cart_item_id = ${getPlaceholder(1)}`;
  const queryDelete = `DELETE FROM cart_items WHERE cart_item_id = ${getPlaceholder(1)}`;

  try {
    // Отримуємо дані про елемент, щоб повернути їх після видалення
    const selectResults = await pool.query(querySelect, [cart_item_id]);
    const rows = dbType === 'postgres' ? selectResults.rows : selectResults[0];

    if (!Array.isArray(rows) || rows.length < 1) {
      return response.status(404).send('Cart item not found');
    }

    // Видаляємо елемент з таблиці
    await pool.query(queryDelete, [cart_item_id]);

    response.status(200).send(`Cart item deleted with ID: ${rows[0].cart_item_id}`);
  } catch (error) {
    console.error('Error in deleteCartItemByCartItemId:', error);
    response.status(500).send('Internal Server Error');
  }
};


module.exports = {
  getCartItemsByUserId,
  createCartItemByCartId,
  updateCartItemByCartItemId,
  deleteCartItemByCartItemId,
};
