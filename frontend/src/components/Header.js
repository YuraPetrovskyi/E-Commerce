import React, { useEffect, useState, useContext }from "react";
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;



const Header = () => {
  // const [user, setUser] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  // const [cartID, setCartId] = useState(null);
  // const [carts, setCart] = useState([]);

  const { cartlenght, setCartLenght, user, setUser } = useContext(CartContext);
  const { authenticated, setAuthenticated, cartID} = useContext(CartContext);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     // console.log('startet Home before fetch');
  //     try {        
  //       const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
  //         method: 'GET',
  //         credentials: 'include',
  //       });
    
  //       if (authResponse.ok) {
  //         const authData = await authResponse.json();
    
  //         if (authData.isAuthenticated) {
  //           // console.log('isAuthenticated --> true');
  //           const profileResponse = await fetch(`${SERVER_HOST}/profile`, {
  //             method: 'GET',
  //             credentials: 'include',
  //           });
  //           const profileData = await profileResponse.json();
  //           // console.log(profileData);
  //           setUser(profileData);
  //           setIsAuthenticated(true);
  //           setCartId(profileData.user_id);
  //           setAuthenticated(true);

  //         } else {
  //           setIsAuthenticated(false);
  //           setAuthenticated(false);
  //         }
  //       } else {
  //         console.log('користувач не автентифікований:');
  //         setIsAuthenticated(false);
  //         setAuthenticated(false);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setIsAuthenticated(false);
  //       setAuthenticated(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (cartID) {
  //       try {
  //         const response = await fetch(`${SERVER_HOST}/cart_items/${cartID}`);
  //         if(response.ok) {            
  //           const cartrespons = await response.json();
  //           // console.log('response: ', response);
  //           // console.log('cartrespons: ', cartrespons);
  //           // setCart(cartrespons);
  //           setCartLenght(cartrespons.length)
  //         }
  //         if(response.status === 404){
  //           const text = await response.text()  
  //           console.log('response: ', text);  
  //         }          
  //       } catch (error) {
  //         console.error('Error fetching product data:', error);
  //       }
  //     };      
  //   };

  //   fetchData();
  // }, [cartID, setCartLenght]);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${SERVER_HOST}/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      // Додаткові дії при виході користувача, якщо потрібно
      if (response.ok) {
        // setIsAuthenticated(false);
        setAuthenticated(false);
        setUser(null);
        const data = await response.json();
        // console.log(data);
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

  // const cartItemCount = carts.reduce((total, cartItem) => total + cartItem.quantity, 0);

  return (
    <div className="header-container">
      <div className="header-emblem">
        <Link to="/">E-COMMERS</Link>        
      </div>
      {authenticated ? (
        <div className='header-customer'>
          <p>Welcome, {user?.username}!</p>
          {authenticated ? (<p>authenticated</p>) :(<p>none</p>)}
          <button onClick={handleLogout}>Logout</button>  
          <Link to="/cart" className='cart-image-container'>
            <img src="/images/shopping.png" alt="shopping-cart-icon" />
            <span className='cart-count'>{cartlenght}</span>
          </Link>
        </div>
      ) : (
        <div className='header-customer'>
          <p>Please sign in or register.</p>
          {authenticated ? (<p>authenticated</p>) :(<p>none</p>)}
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      )}
    </div>
  )}

export default Header;