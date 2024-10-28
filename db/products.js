const { pgPool, mysqlPool } = require('./pool');

// Визначаємо базу даних, з якою працюємо
const dbType = process.env.DB_TYPE || 'postgres'; // Вибираємо 'postgres' або 'mysql' з .env файлу
// Визначаємо, який пул використовувати
const pool = dbType === 'postgres' ? pgPool : mysqlPool;

// Функція для вибору правильного плейсхолдера
function getPlaceholder(index) {
  return dbType === 'postgres' ? `$${index}` : `?`;
}

// Get a list of all products.
const getProducts = async (request, response) => {
  const query = `SELECT * FROM products ORDER BY product_id ASC`;
  try {
    const results = await pool.query(query);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    response.status(200).json(rows);
  } catch (error) {
    response.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

// Get information about a specific product by product_id.
const getProductsById = async (request, response) => {
  const product_id = parseInt(request.params.product_id);
  const query = `SELECT * FROM products WHERE product_id = ${getPlaceholder(1)}`;
  
  try {
    const results = await pool.query(query, [product_id]);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    if (rows.length < 1) {
      return response.status(400).json({ error: 'The product with this ID does not exist in the database' });
    }
    response.status(200).json(rows);
  } catch (error) {
    response.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

// POST a new product (create)
const createProduct = async (request, response) => {
  const { name, description, price, inventory } = request.body;
  console.log('Received data: ', { name, description, price, inventory });

  const query = `INSERT INTO products (name, description, price, inventory) VALUES (${getPlaceholder(1)}, ${getPlaceholder(2)}, ${getPlaceholder(3)}, ${getPlaceholder(4)}) RETURNING *`;
  try {
    const results = await pool.query(query, [name, description, price, inventory]);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    if (!Array.isArray(rows) || rows.length < 1) {
      return response.status(400).json({ error: 'Invalid input. Please provide valid product data.' });
    }
    response.status(201).send(`Product added with ID: ${rows[0].product_id}, Name: ${rows[0].name}, Description: ${rows[0].description}, Price: ${rows[0].price}, Inventory: ${rows[0].inventory}`);
  } catch (error) {
    response.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

// PUT Update product information by product_id.
const updateProduct = async (request, response) => {
  const product_id = parseInt(request.params.product_id);
  const { name, description, price, inventory } = request.body;
  console.log('Received data: ', { name, description, price, inventory });

  const query = `UPDATE products SET name = ${getPlaceholder(1)}, description = ${getPlaceholder(2)}, price = ${getPlaceholder(3)}, inventory = ${getPlaceholder(4)} WHERE product_id = ${getPlaceholder(5)} RETURNING *`;
  try {
    const results = await pool.query(query, [name, description, price, inventory, product_id]);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    if (rows.length < 1) {
      return response.status(404).send(`No product with such ID found`);
    }
    response.status(200).send(`Product modified with ID: ${rows[0].product_id}, Name: ${rows[0].name}, Description: ${rows[0].description}, Price: ${rows[0].price}, Inventory: ${rows[0].inventory}`);
  } catch (error) {
    response.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

// DELETE a product by product_id.
const deleteProducts = async (request, response) => {
  const product_id = parseInt(request.params.product_id);
  const query = `DELETE FROM products WHERE product_id = ${getPlaceholder(1)} RETURNING name, description, price, inventory`;

  try {
    const results = await pool.query(query, [product_id]);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    if (rows.length < 1) {
      return response.status(404).send(`No product with such ID found`);
    }
    const deletedProduct = rows[0];
    response.status(200).send(`Product deleted: Name: ${deletedProduct.name}, Description: ${deletedProduct.description}, Price: ${deletedProduct.price}, Inventory: ${deletedProduct.inventory}`);
  } catch (error) {
    response.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

// SEARCH a product by name.
const searchProductsName = async (request, response) => {
  const productName = request.query.name;
  if (!productName || productName.trim() === '') {
    return response.status(400).json({ error: 'Invalid input. Please provide a valid product name.' });
  }
  const query = dbType === 'postgres'
    ? `SELECT * FROM products WHERE name ILIKE ${getPlaceholder(1)}`
    : `SELECT * FROM products WHERE name LIKE ${getPlaceholder(1)}`; // MySQL використовує LIKE замість ILIKE

  try {
    const results = await pool.query(query, [`%${productName}%`]);
    const rows = dbType === 'postgres' ? results.rows : results[0];
    response.json(rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Product search error' });
  }
};

module.exports = {
  getProducts,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProducts,
  searchProductsName,
};
