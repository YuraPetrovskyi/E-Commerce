import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Products.css'

const Products = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);
  console.log(products);
  return (
    <div>
      <h2>Product List</h2>
      <ul className='container'>
        {products.map((product) => (
          <li key={product.product_id}>
            <p>{product.name}</p>
            <p>{product.model}</p>
            <p>Price: ${product.price}</p>
            <Link to={`/products/${product.product_id}`}>More information</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
