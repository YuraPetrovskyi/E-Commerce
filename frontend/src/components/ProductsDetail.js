import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Login from './Login';

const ProductDetail = () => {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [user_id, setUserID] = useState(null);


  useEffect(() => {
    checkAuthentication();       
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/products/${product_id}`);
        const data = await response.json();
        setProduct(data[0]); // Assuming the API response is an array with a single product
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchData();
  }, [product_id]);
  
  

  const checkAuthentication = async () => {
    try {
      const response = await fetch('http://localhost:3000/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('response: ',response)
      if (response.ok) {
        const data = await response.json();
        console.log('data from respons: ', data)
        setUser(data.username);
        setIsAuthenticated(true);
        setUserID(data.user_id)
      }
    } catch (error) {
      console.error('Error fetching checkAuthentication:', error);
    }
  }

  const handleAddToCart = async () => {
    try {
      // Implement logic to add the product to the user's cart
      // You can make a request to the server to handle the cart update
      await fetch(`http://localhost:3000/cart_items/${user_id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id, quantity }),
      });

      console.log(`Product ${product.name} added to the cart!`);
    } catch (error) {
      console.error('Error adding product to the cart:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
          <>
            <p>Welcome, {user}!</p>         
          </>
        ) : (
          <>
          </>
        )}
      <h2>{product.name}</h2>
      <p>Model: {product.model}</p>
      <p>Description: {product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Inventory: {product.inventory}</p>
      {isAuthenticated ? (
          <>
            <label htmlFor="quantity">Quantity:</label>
            <select id="quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}>
              {[...Array(product.inventory).keys()].map((index) => (
                <option key={index + 1} value={index + 1}>{index + 1}</option>
              ))}
            </select>
            <button onClick={handleAddToCart}>Add to Cart</button>       
          </>
        ) : (
          <>
            <h3>If you want to bay this item? you need to  login</h3>      
            <Link to="/login">
              <button>Login</button>
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </>
        )}
    </div>
  );
};

export default ProductDetail;
