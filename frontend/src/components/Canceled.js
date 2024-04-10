import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

const Canceled = () => {
  const navigate = useNavigate()

  const goToHome = () => {
    navigate('/')
  }
  const goToOrders = () => {
    navigate('/orders')
  }
  return (
    <Layout>
      <div className='canceled-container'>
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
    </Layout>
    
  )
}

export default Canceled;