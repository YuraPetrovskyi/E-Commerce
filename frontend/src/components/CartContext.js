import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();
const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

export const CartProvider = ({ children }) => {
  const [cartlenght, setCartLenght] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartID, setCartId] = useState(null);

  useEffect(() => {    
    setCartLenght(cartlenght);
    setAuthenticated(authenticated)
  }, [cartlenght, authenticated]);

  useEffect(() => {
    const fetchData = async () => {
      // console.log('startet Home before fetch');
      try {        
        const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });
    
        if (authResponse.ok) {
          const authData = await authResponse.json();
    
          if (authData.isAuthenticated) {
            // console.log('isAuthenticated --> true');
            const profileResponse = await fetch(`${SERVER_HOST}/profile`, {
              method: 'GET',
              credentials: 'include',
            });
            const profileData = await profileResponse.json();
            // console.log(profileData);
            setUser(profileData);
            // setIsAuthenticated(true);
            setCartId(profileData.user_id);
            setAuthenticated(true);

          } else {
            // setIsAuthenticated(false);
            setAuthenticated(false);
          }
        } else {
          console.log('користувач не автентифікований:');
          // setIsAuthenticated(false);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // setIsAuthenticated(false);
        setAuthenticated(false);
      }
    };
    fetchData();
  }, []);
  console.log('CartContext user:', user);
  console.log('CartContext cartID:', cartID);
  console.log('CartContext cartlenght:', cartlenght);
  console.log('CartContext authenticated:', authenticated);

  return (
    <CartContext.Provider value={{ cartlenght, setCartLenght, authenticated, setAuthenticated, user, setUser, cartID, setCartId }}>
      {children}
    </CartContext.Provider>
  );
};



