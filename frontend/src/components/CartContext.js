import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();
const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

export const CartProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({});
  const [cartId, setCartId] = useState(null);
  const [userId, setUserId] = useState(null);

  const [cart, setCart] = useState([]);  
  const [cartlenght, setCartLenght] = useState(null);

  useEffect(() => {
    // Option 1 - Отримання токену з URL using window
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      console.log('Token from URL:', token);
      localStorage.setItem('token', token);

      // Ви можете тут встановити аутентифікацію або зробити запит для перевірки токена
      setAuthenticated(true);

      // Опціонально: Очистити параметр токена з URL, щоб він не відображався у адресному рядку після аутентифікації
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);
  console.log('localStorage token:', localStorage.getItem('token'));

  useEffect(() => {    
    const fetchData = async () => {
      console.log('startet CartProvider check-auth');
      try {        
        const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const respons = await authResponse.json();
        if (respons.message) {
          console.log('respons check-auth:', respons.message)
        }
        if (respons.isAuthenticated) {
          console.log("CartProvider isAuthenticated respons", respons)
          setAuthenticated(true);
          setUser(respons.user);
          setUserId(respons.user.user_id);
          setCartId(respons.user.user_id);
        } else {
          setAuthenticated(false);
          setUser({});
          setCart([]);
          setCartId(null);
          setCartLenght(null);
        }
      } catch (error) {
        console.error('Error CartProvider fetching data:', error);
        setAuthenticated(false);
        setUser({});  
        setCart([]);
        setCartId(null);
        setCartLenght(null);
      }
    };
    fetchData();
  }, [authenticated]);

  useEffect(() => {
    console.log('stared useEffect')
    const fetchData = async () => {
      if (cartId) {
        try {
          const response = await fetch(`${SERVER_HOST}/cart_items/${cartId}`, {
            method: 'GET',
            credentials: 'include', // Додаємо, щоб включити cookies
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Якщо використовуєте автентифікацію через токен
            }
          });
          if(response.ok) {            
            const cartrespons = await response.json();
            console.log('response: ', response);
            console.log('cartrespons: ', cartrespons);
            setCart(cartrespons);
            setCartLenght(cartrespons.length);
          }
          if(response.status === 404){
            const text = await response.text()  
            console.log('response: ', text);  
          }          
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      };      
    };
    fetchData();
  }, [cartId,cartlenght]);

  console.log('CartContext user:', user);
  console.log('CartContext carts:', cart);
  console.log('CartContext cartlenght:', cartlenght);
  console.log('CartContext authenticated:', authenticated);  
  console.log('CartContext cartId:', cartId);
  console.log('CartContext user:', user);


  return (
    <CartContext.Provider 
      value={{ 
        cartlenght, setCartLenght, 
        authenticated, setAuthenticated,
        user, setUser,
        cart, setCart,
        cartId, setCartId,
        userId, setUserId
      }}>
      {children}
    </CartContext.Provider>
  );
};

  // useEffect(() => {    
  //   setCartLenght(cartlenght);
  //   setAuthenticated(authenticated);
  // }, [cartlenght, authenticated]);


  // useEffect(() => {
  //   const checkAuth = async () => {
  //     console.log('Checking auth status');
  //     try {
  //       const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
  //         method: 'GET',
  //         credentials: 'include',
  //         headers: { 'Content-Type': 'application/json' },
  //       });
  //       const response = await authResponse.json();
  //       if (response.isAuthenticated) {
  //         setAuthenticated(true);
  //         setUser(response.user);
  //         // Використовуємо user_id з response.user для подальших запитів
  //         fetchCartItems(response.user.user_id);
  //         setUserId(response.user.user_id);          
  //         setCartId(response.user.user_id);
  //       } else {
  //         throw new Error('User not authenticated');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching auth data:', error);
  //       setAuthenticated(false);
  //       setUser({});
  //       setCart([]);
  //       setCartLenght(0);
  //     }
  //   };

  //   const fetchCartItems = async (userId) => {
  //     console.log(`Fetching cart items for user ${userId}`);
  //     try {
  //       const response = await fetch(`${SERVER_HOST}/cart_items/${userId}`, {
  //         method: 'GET',
  //         credentials: 'include',
  //         headers: { 'Content-Type': 'application/json' },
  //       });
  //       if (response.ok) {
  //         const cartItems = await response.json();
  //         setCart(cartItems);
  //         setCartLenght(cartItems.length);
  //       } else {
  //         throw new Error('Failed to fetch cart items');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching cart data:', error);
  //     }
  //   };

  //   checkAuth();
  // }, []); // Порожній масив залежностей гарантує, що ефект викликається лише один раз при монтуванні компонента
