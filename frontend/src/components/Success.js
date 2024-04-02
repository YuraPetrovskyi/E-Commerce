import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams, useLocation  } from 'react-router-dom';
import { CartContext } from './CartContext';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

const Success = () => {
  const navigate = useNavigate()
  const { order_id } = useParams()
  const { authenticated } = useContext(CartContext);

  const location = useLocation();
  const [sessionDetails, setSessionDetails] = useState(null);


  console.log('order_id:', order_id);
  console.log('authenticated:', authenticated);

  const goToHome = () => {
    navigate('/')
  }
  const goToOrders = () => {
    navigate('/orders')
  }
  
  // useEffect(() => {
  //   console.log('useEffect authenticated:', authenticated);

  //   if(!authenticated) {
  //     navigate('/')
  //   }    
  // }, [authenticated, navigate]);

  // http://localhost:3001/success?session_id=cs_test_b1ybSEVS1rtg0oDqJGks34Aj5xRMilcZXOJ9HQ2WOtvISOT1qyST4oluEM&order_id=31
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(`${SERVER_HOST}/orders/${order_id}`, {
  //         method: 'PUT',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         },
  //         credentials: 'include',
  //         body: JSON.stringify({ status: 'Paid' }),
  //       });
  //       // console.log(response);
  //       if (response.ok) {
  //         console.log(`The status of the order with id: ${order_id} has been changed to Paid`);
  //         alert(`The status of the order with id: ${order_id} has been changed to Paid`);
  //       }
  //     } catch (error) {
  //       console.error(`Error fetching payment of order with id:${order_id} : `, error);
  //     }
  //   };
  
  //   if (order_id) {
  //     fetchData();
  //   }
  // }, [order_id]);

  useEffect(() => {
    // Витягуємо session_id з URL
    const query = new URLSearchParams(location.search);
    const sessionId = query.get('session_id');
    console.log('sessionId', sessionId);
    if (sessionId) {
      // Виконуємо запит до нашого бекенду для отримання деталей сесії
      fetch(`${SERVER_HOST}/api/checkout-session/${sessionId}`)
        .then(response => response.json())
        .then(data => {
          // Зберігаємо деталі сесії в стані
          console.log('data session Stripe: --', data)
          setSessionDetails(data);
        })
        .catch(error => {
          console.error('Error fetching session details:', error);
        });
    }
  }, [location.search]);

  if (!sessionDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className='success-container'>
        
      <h2>Thank you for your purchase!</h2>
      <p>Order ID: {sessionDetails.id}</p>
      {/* Відобразити іншу інформацію про замовлення */}
      
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