import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;



const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${SERVER_HOST}/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };
    fetchData();
  }, []);

  // console.log(products);

  return (
    <div>
      <h2>Product List</h2>
      <ul className='products-container'>
        {products.map((product) => (
          <li key={product.product_id}>
            <img src={product.image_url} alt={product.name} />
            <p>{product.name}</p>
            <p className='products-name'>{product.model}</p>
            <p className='products-price'>${product.price}</p>
            <Link to={`/products/${product.product_id}`} >More information...</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
