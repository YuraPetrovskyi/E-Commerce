import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import Products from './Products';
import Cart from './Cart';

const Home = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [cartID, setCartId] = useState(null);

  const [carts, setCart] = useState([]);


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
          setCartId(profileData.user_id);
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
      if (cartID) {
        try {
          const response = await fetch(`http://localhost:3000/cart_items/${cartID}`);
          const cartrespons = await response.json();
          console.log('response: ', response);
          console.log('cartrespons: ', cartrespons);
          setCart(cartrespons);
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      };      
    };

    fetchData();
  }, [cartID]);


  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'GET',
        credentials: 'include',
      });
      // Додаткові дії при виході користувача, якщо потрібно
      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        const data = await response.json();
        console.log(data);
        if (data.redirect) {
          navigate(data.redirect); // Перенаправити за допомогою useNavigate
        } else {
          console.error('Login failed');
        }
      }      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  console.log(carts);

  return (
    <div>
      <div className="home-container">
        {isAuthenticated ? (
          <div className='navigation'>
            <p>Welcome, {user?.username}!</p>
            <button onClick={handleLogout}>Logout</button>  
            <Link to="/cart" className='cart-container'>
              <img src="/images/shopping.png" alt="shopping-cart-icon" />
              <span className='cart-count'>{carts.length}</span>
          </Link>
          </div>
        ) : (
          <>
            <p>Please sign in or register.</p>
            <Link to="/login">
              <button>Login</button>
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
            
          </>
        )}
      </div>
      <Products />
    </div>    
  );
};

export default Home;