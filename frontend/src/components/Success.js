import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;



const Success = () => {
  const navigate = useNavigate()
  const { order_id } = useParams()

  console.log('order_id:', order_id);

  const goToHome = () => {
    navigate('/')
  }
  const goToOrders = () => {
    navigate('/orders')
  }
  // http://localhost:3001/success?session_id=cs_test_b1ybSEVS1rtg0oDqJGks34Aj5xRMilcZXOJ9HQ2WOtvISOT1qyST4oluEM&order_id=31
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${SERVER_HOST}/orders/${order_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: 'Paid' }),
        });
        // console.log(response);
        if (response.ok) {
          console.log(`The status of the order with id: ${order_id} has been changed to Paid`);
          alert(`The status of the order with id: ${order_id} has been changed to Paid`);
        }
      } catch (error) {
        console.error(`Error fetching payment of order with id:${order_id} : `, error);
      }
    };
  
    if (order_id) {
      fetchData();
    }
  }, [order_id]);

  return (
    <div className='success-container'>
      <h1>Thank you for your order</h1>
      <p>We are currently processing your order and 
        will send you a confirmation email shortly
      </p>
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

export default Success;