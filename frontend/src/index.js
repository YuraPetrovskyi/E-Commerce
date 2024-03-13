import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CartProvider } from './components/CartContext';


import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';



const stripePromise = loadStripe(process.env.REACT_APP_PUBLISHABLE_KEY);
// console.log('process.env.REACT_APP_PUBLISHABLE_KEY', process.env.REACT_APP_PUBLISHABLE_KEY)
// console.log('process.env.REACT_APP_SERVER_HOST_SERVER_HOST', process.env.REACT_APP_SERVER_HOST)



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Elements stripe={stripePromise}>
    <CartProvider>
      <App />
    </CartProvider>    
  </Elements>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
