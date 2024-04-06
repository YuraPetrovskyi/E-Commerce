import React from 'react';
// import { Link } from 'react-router-dom';




const Welcome = () => {


  return (
    <div className='welcome-comtainer'>
      <h1>E-COMMERS</h1>
      <h2>Welcome!</h2>
      <p>On our website you will be able to buy thanks products,
        but of course <span>not for real money :-)</span></p>
      <p>A payment system is used for payment <span>Stripe (test mode)</span>, 
        so to pay for the product, 
        enter the test card number:
      </p>
      <p> 4242 4242 4242 4242 / Date -  any / CVV -  any</p>
      <h3>Developed by <span>Yurii Petrovskiy</span></h3>
    </div>
  );
};

export default Welcome;
