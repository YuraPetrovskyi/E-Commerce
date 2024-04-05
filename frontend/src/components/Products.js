import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from './Layout';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;



const Products = () => {
  const [products, setProducts] = useState([]);
  const { category } = useParams();

  useEffect(() => {
  console.log('Products useEffect');

    const fetchData = async () => {
      try {
        const response = await fetch(`${SERVER_HOST}/products`, {
          method: 'GET',
          credentials: 'include', // Включити креденціали
        });
        const data = await response.json();
        setProducts(data);
        console.log('Products useEffect after fetch - ok');
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };
    fetchData();
  }, []);

  console.log(products);
  console.log(category);

  let productfilter = [];
  if(category) {
    productfilter = products.filter((product) => product.name === category);    
  }
  console.log(productfilter);

  return (
    <Layout>
      <h2>{category}</h2>
      <ul className='products-container'>
        {productfilter.map((product) => (
          
          <li key={product.product_id} >
            <img src={product.image_url} alt={product.name} />
            <p>{product.name}</p>
            <p className='products-name'>{product.model}</p>
            <p className='products-price'>${product.price}</p>
            <Link to={`/products/${product.product_id}`} >More information...</Link>
          </li>
          
        ))}
      </ul>
    </Layout>
  );
};

export default Products;
