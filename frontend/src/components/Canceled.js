import React from 'react';
import { useNavigate } from 'react-router-dom';

const Canceled = () => {
  const navigate = useNavigate()

  const goToHome = () => {
    navigate('/')
  }
  const goToOrders = () => {
    navigate('/orders')
  }
  return (
    <div >
      <h1>Payment failed</h1>
      <p>Payment was not successful</p>
      <div>
        <button onClick={goToHome}>
          Continue Shopping
        </button>
        <button onClick={goToOrders}>
          Orders
        </button>
      </div>
    </div>
  )
}

export default Canceled;