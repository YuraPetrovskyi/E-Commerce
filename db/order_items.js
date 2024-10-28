const { pgPool, mysqlPool } = require('./pool');

// Визначаємо базу даних, з якою працюємо
const dbType = process.env.DB_TYPE || 'postgres'; // Вибираємо 'postgres' або 'mysql' з .env файлу
// Визначаємо, який пул використовувати
const pool = dbType === 'postgres' ? pgPool : mysqlPool;

// Функція для вибору правильного плейсхолдера
function getPlaceholder(index) {
  return dbType === 'postgres' ? `$${index}` : `?`;
}

// GET a list of user orders by their user_id.
const getOrderItems = async (request, response) => {
  const order_id = parseInt(request.params.order_id);
  
  const query = `SELECT * FROM order_items WHERE order_id = ${getPlaceholder(1)}`;
  try {
    const results = await pool.query(query, [order_id]);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    if (rows.length === 0) {
      return response.status(400).send('There are no order items');
    }
    response.status(200).json(rows);
  } catch (error) {
    console.error('Error in getOrderItems:', error);
    response.status(500).send('Internal Server Error');
  }
};

// POST Add product to order by order_id.
const createOrderItem = async (request, response) => {
  const order_id = parseInt(request.params.order_id);
  const { product_id, quantity } = request.body;

  try {
    // We get the product price from the products table
    const queryProduct = `SELECT price FROM products WHERE product_id = ${getPlaceholder(1)}`;
    const productResults = await pool.query(queryProduct, [product_id]);
    const productRows = dbType === 'postgres' ? productResults.rows : productResults[0];

    if (productRows.length === 0) {
      return response.status(404).send('Product not found');
    }

    const productPrice = productRows[0].price;
    const totalAmountToAdd = productPrice * quantity;

    // We add the product to the order_items table
    const queryInsert = `INSERT INTO order_items (order_id, product_id, quantity) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}, ${getPlaceholder(3)}) RETURNING *`;
    const insertResults = await pool.query(queryInsert, [order_id, product_id, quantity]);
    const insertRows = dbType === 'postgres' ? insertResults.rows : insertResults[0];

    if (insertRows.length === 0) {
      return response.status(500).send('Internal Server Error');
    }

    // We update total_amount in the orders table
    const queryUpdate = `UPDATE orders SET total_amount = total_amount + ${getPlaceholder(1)} WHERE order_id = ${getPlaceholder(2)} RETURNING *`;
    const updateResults = await pool.query(queryUpdate, [totalAmountToAdd, order_id]);
    const updateRows = dbType === 'postgres' ? updateResults.rows : updateResults[0];

    if (updateRows.length === 0) {
      return response.status(404).send('Order not found');
    }

    response.status(201).send(`Product added to order with ID: ${insertRows[0].order_id}, Product ID: ${insertRows[0].product_id}, Quantity: ${insertRows[0].quantity}`);
  } catch (error) {
    console.error('Error in createOrderItem:', error);
    response.status(500).send('Internal Server Error');
  }
};

// PUT Update the quantity of the product in the order by order_item_id.
const updateOrderItem = async (request, response) => {
  const order_item_id = parseInt(request.params.order_item_id);
  const { quantity } = request.body;

  try {
    // We get information about the order and the product from order_items
    const querySelect = `SELECT order_items.order_id, order_items.product_id, order_items.quantity, products.price 
                        FROM order_items 
                        INNER JOIN products ON order_items.product_id = products.product_id 
                        WHERE order_item_id = ${getPlaceholder(1)}`;
    const itemResults = await pool.query(querySelect, [order_item_id]);
    const itemRows = dbType === 'postgres' ? itemResults.rows : itemResults[0];

    if (itemRows.length === 0) {
      return response.status(404).send('Order item not found');
    }

    const order_id = itemRows[0].order_id;
    const product_id = itemRows[0].product_id;
    const oldQuantity = itemRows[0].quantity;
    const productPrice = itemRows[0].price;
    const totalAmountDifference = productPrice * (quantity - oldQuantity);

    // We update the order_items record
    const queryUpdateItems = `UPDATE order_items SET quantity = ${getPlaceholder(1)} WHERE order_item_id = ${getPlaceholder(2)} RETURNING *`;
    const updateResults = await pool.query(queryUpdateItems, [quantity, order_item_id]);
    const updateRows = dbType === 'postgres' ? updateResults.rows : updateResults[0];

    if (updateRows.length === 0) {
      return response.status(404).send('Order item not found');
    }

    // We update total_amount in the orders table
    const queryUpdateOrder = `UPDATE orders SET total_amount = total_amount + ${getPlaceholder(1)} WHERE order_id = ${getPlaceholder(2)} RETURNING *`;
    const totalAmountResults = await pool.query(queryUpdateOrder, [totalAmountDifference, order_id]);
    const totalAmountRows = dbType === 'postgres' ? totalAmountResults.rows : totalAmountResults[0];

    if (totalAmountRows.length === 0) {
      return response.status(404).send('Order not found');
    }

    response.status(200).send(`Order item updated: Order ID: ${order_id}, Product ID: ${product_id}, Quantity: ${quantity}`);
  } catch (error) {
    console.error('Error in updateOrderItem:', error);
    response.status(500).send('Internal Server Error');
  }
};

// DELETE Remove the product from the order by order_item_id.
const deleteOrderItem = async (request, response) => {
  const order_item_id = parseInt(request.params.order_item_id);

  try {
    // We get information about the order and the product from order_items
    const querySelect = `SELECT order_items.order_id, order_items.product_id, order_items.quantity, products.price 
                        FROM order_items 
                        INNER JOIN products ON order_items.product_id = products.product_id 
                        WHERE order_item_id = ${getPlaceholder(1)}`;
    const itemResults = await pool.query(querySelect, [order_item_id]);
    const itemRows = dbType === 'postgres' ? itemResults.rows : itemResults[0];

    if (itemRows.length === 0) {
      return response.status(404).send('Order item not found');
    }

    const order_id = itemRows[0].order_id;
    const product_id = itemRows[0].product_id;
    const quantity = itemRows[0].quantity;
    const productPrice = itemRows[0].price;
    const totalAmountDifference = -productPrice * quantity;

    // We delete the record from order_items
    const queryDelete = `DELETE FROM order_items WHERE order_item_id = ${getPlaceholder(1)}`;
    await pool.query(queryDelete, [order_item_id]);

    // We update total_amount in the orders table
    const queryUpdateOrder = `UPDATE orders SET total_amount = total_amount + ${getPlaceholder(1)} WHERE order_id = ${getPlaceholder(2)} RETURNING *`;
    const totalAmountResults = await pool.query(queryUpdateOrder, [totalAmountDifference, order_id]);
    const totalAmountRows = dbType === 'postgres' ? totalAmountResults.rows : totalAmountResults[0];

    if (totalAmountRows.length === 0) {
      return response.status(404).send('Order not found');
    }

    response.status(200).send(`Order item deleted: Order ID: ${order_id}, Product ID: ${product_id}`);
  } catch (error) {
    console.error('Error in deleteOrderItem:', error);
    response.status(500).send('Internal Server Error');
  }
};

module.exports = {
  getOrderItems,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem
};
