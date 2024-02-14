import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import './Products.css'

const Cart = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartID, setCartId] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      console.log('startet Home before fitch')
      console.log(isAuthenticated)
      try {        
        const authResponse = await fetch('http://localhost:3000/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        const authData = await authResponse.json();

        if (authData.isAuthenticated) {
          console.log('isAuthenticated --> true')
          // Якщо користувач аутентифікований, зробимо запит для отримання інформації про користувача
          const profileResponse = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            credentials: 'include',
          });
          const profileData = await profileResponse.json();
          console.log(profileData);
          setUser(profileData);
          setIsAuthenticated(true);
          setCartId(profileData.user_id)
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('користувач не автентифікований:')
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/cart_items/${cartID}`);
        const cartrespons = await response.json();
        console.log('cartrespons: ', cartrespons);
        setCart(cartrespons);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, [cartID]);

  console.log('user', user);
  console.log('cart', cart);
  console.log('cartID', cartID);

  console.log('isAuthenticated', isAuthenticated);

  return (
    <div>
      {/* <Link to="/cart" >Cart ({cart.carts.length})</Link> */}
      <p>My Cart</p>
      

      {/* <p>products in cart: {cart[0].quantity}</p> */}
      {/* <ul className='container'>
        {cart.map((carts) => (
          <li key={carts.product_id}>
            <p>{carts.name}</p>
            <p>{carts.model}</p>
            <p>Price: ${carts.price}</p>
            <Link to={`/products/${product.product_id}`}>More information</Link>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default Cart;
