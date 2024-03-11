import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartlenght, setCartLenght] = useState(null);

  useEffect(() => {    
    setCartLenght(cartlenght)
  }, [cartlenght]);

  console.log("cartlenght:", cartlenght)




  return (
    <CartContext.Provider value={{ cartlenght, setCartLenght }}>
      {children}
    </CartContext.Provider>
  );
};



