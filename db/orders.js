const { pgPool, mysqlPool } = require('./pool');

// Визначаємо базу даних, з якою працюємо
const dbType = process.env.DB_TYPE || 'postgres'; // Вибираємо 'postgres' або 'mysql' з .env файлу
// Визначаємо, який пул використовувати
const pool = dbType === 'postgres' ? pgPool : mysqlPool;

// Функція для вибору правильного плейсхолдера
function getPlaceholder(index) {
  return dbType === 'postgres' ? `$${index}` : `?`;
}

// Get a list of user orders by their user_id.
const getOrders = async (request, response) => {
  const user_id = parseInt(request.params.user_id);
  console.log('Received data: ', { user_id });

  const query = `SELECT * FROM orders WHERE user_id = ${getPlaceholder(1)}`;
  try {
    const results = await pool.query(query, [user_id]);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    if (rows.length === 0) {
      return response.status(400).send('There are no orders');
    }
    response.status(200).json(rows);
  } catch (error) {
    console.error('Error in getOrders:', error);
    response.status(500).send('Internal Server Error');
  }
};

// Create a new order for user by user_id.
const createOrder = async (request, response) => {
  const { user_id } = request.params;
  console.log('createOrder started');

  try {
    // Отримуємо інформацію з кошика користувача
    const queryCartItems = `SELECT cart_items.product_id, cart_items.quantity, products.price 
                            FROM cart_items 
                            INNER JOIN products ON cart_items.product_id = products.product_id 
                            WHERE cart_items.cart_id = ${getPlaceholder(1)}`;
    const cartItemsResults = await pool.query(queryCartItems, [user_id]);
    const cartRows = dbType === 'postgres' ? cartItemsResults.rows : cartItemsResults[0];

    if (cartRows.length === 0) {
      console.log('The cart is empty');
      return response.status(400).send('The basket is empty. First, add products to the shopping cart.');
    }

    const totalAmount = cartRows.reduce((total, cartItem) => total + cartItem.quantity * cartItem.price, 0);

    // Створюємо нове замовлення і отримуємо його ID
    // const queryInsertOrder = `INSERT INTO orders (user_id, total_amount) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}) RETURNING order_id`;
    // const orderResults = await pool.query(queryInsertOrder, [user_id, totalAmount]);
    const queryInsertOrder = dbType === 'postgres' 
      ? `INSERT INTO orders (user_id, total_amount) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}) RETURNING order_id` 
      : `INSERT INTO orders (user_id, total_amount) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)})`;
    const orderResults = await pool.query(queryInsertOrder, [user_id, totalAmount]);    
    
    console.log('orderResults =============================', orderResults);
    // Отримуємо orderId залежно від типу бази даних
    const orderId = dbType === 'postgres' 
      ? orderResults.rows[0].order_id 
      : orderResults[0].insertId;


    // Створюємо записи для кожного продукту в таблиці "order_items"
    const orderItemsPromises = cartRows.map((cartItem) => {
      const queryInsertOrderItems = `INSERT INTO order_items (order_id, product_id, quantity) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}, ${getPlaceholder(3)})`;
      return pool.query(queryInsertOrderItems, [orderId, cartItem.product_id, cartItem.quantity]);
    });

    // Очищаємо кошик користувача після створення замовлення
    const queryDeleteCartItems = `DELETE FROM cart_items WHERE cart_id = (SELECT cart_id FROM carts WHERE user_id = ${getPlaceholder(1)})`;
    await pool.query(queryDeleteCartItems, [user_id]);

    // Виконуємо всі обіцянки створення order_items
    await Promise.all(orderItemsPromises);
    response.status(201).send(`Замовлення створено з ID: ${orderId}`);
  } catch (error) {
    console.error('Error in createOrder:', error);
    response.status(500).send('Internal Server Error');
  }
};

// Update order status by order_id.
const updateOrderStatus = async (request, response) => {
  const order_id = parseInt(request.params.order_id);
  const orderStatus = request.body.status;
  console.log('order_id', order_id);
  console.log('orderStatus', orderStatus);

  // const queryUpdateOrder = `UPDATE orders SET status = ${getPlaceholder(1)} WHERE order_id = ${getPlaceholder(2)} RETURNING order_id, status`;
  const queryUpdateOrder = `UPDATE orders SET status = ${getPlaceholder(1)} WHERE order_id = ${getPlaceholder(2)}`;

  try {
    console.log('started queryUpdateOrder .... ');
    // const results = await pool.query(queryUpdateOrder, [orderStatus, order_id]);
    await pool.query(queryUpdateOrder, [orderStatus, order_id]);
    
    // Отримуємо оновлений статус замовлення
    const querySelectOrder = `SELECT order_id, status FROM orders WHERE order_id = ${getPlaceholder(1)}`;
    const result = await pool.query(querySelectOrder, [order_id]);

    // const rows = dbType === 'postgres' ? results.rows : results[0];
    const rows = dbType === 'postgres' ? result.rows : result[0];
    
    if (rows.length > 0) {
      console.log(`The status of the order with id: ${rows[0].order_id} has been changed to ${rows[0].status}`);
      response.status(200).send(`The status of the order with id: ${rows[0].order_id} has been changed to ${rows[0].status}`);
    } else {
      console.log(`Order with id ${order_id} not found`);
      response.status(404).send(`Order with id ${order_id} not found`);
    }
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    response.status(500).send('Internal Server Error');
  }
};

// DELETE order using order_id
const deleteOrder = async (request, response) => {
  const order_id = parseInt(request.params.order_id);

  // Спочатку видаляємо записи з order_items
  const queryDeleteOrderItems = `DELETE FROM order_items WHERE order_id = ${getPlaceholder(1)}`;
  // const queryDeleteOrder = `DELETE FROM orders WHERE order_id = ${getPlaceholder(1)} RETURNING order_id`;
  const queryDeleteOrder = `DELETE FROM orders WHERE order_id = ${getPlaceholder(1)}`;

  try {
    await pool.query(queryDeleteOrderItems, [order_id]);

    // Після видалення записів з order_items видаляємо замовлення з orders
    // const orderResults = await pool.query(queryDeleteOrder, [order_id]);
    await pool.query(queryDeleteOrder, [order_id]);
    response.status(200).send(`Order with id: ${rows[0].order_id} has been deleted`);

  } catch (error) {
    console.error('Error in deleteOrder:', error);
    response.status(500).send('Internal Server Error');
  }
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
