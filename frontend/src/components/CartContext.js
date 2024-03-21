import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();
const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

export const CartProvider = ({ children }) => {
  const [cartlenght, setCartLenght] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);  
  const [cartId, setCartId] = useState(null);
  const [userId, setUserId] = useState(null);



  useEffect(() => {    
    setCartLenght(cartlenght);
    setAuthenticated(authenticated);
  }, [cartlenght, authenticated]);

  useEffect(() => {    
    const fetchData = async () => {
      console.log('startet CartProvider check-auth');
      try {        
        const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });
        const respons = await authResponse.json();
        if (respons.isAuthenticated) {
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
    const fetchData = async () => {
      if (cartId) {
        try {
          const response = await fetch(`${SERVER_HOST}/cart_items/${cartId}`);
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
  }, [cartId, cartlenght]);

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



