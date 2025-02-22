import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation  } from 'react-router-dom';
// import { CartContext } from './CartContext';
import Layout from './Layout';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

const Success = () => {
  const navigate = useNavigate()
  const { order_id } = useParams()
  // const { authenticated } = useContext(CartContext);

  const location = useLocation();
  const [sessionDetails, setSessionDetails] = useState(null);


  // console.log('order_id:', order_id);
  // console.log('authenticated:', authenticated);
  // console.log('sessionDetails:', sessionDetails);

  const goToHome = () => {
    navigate('/')
  }
  const goToOrders = () => {
    navigate('/orders')
  }
  
  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_HOST}/orders/${order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'Paid' }),
      });
      // console.log(response);
      if (response.ok) {
        // console.log(`The status of the order has been changed to Paid`);
        // alert(`The status of the order with id: ${order_id} has been changed to Paid`);
      }
    } catch (error) {
      console.error(`Error fetching payment of order with id:${order_id} : `, error);
    }
  };
  const isAuthenticated = async () => {
    try {
      const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // console.log(response);
      if (authResponse.ok) {
        return true;
      }
    } catch (error) {
      // console.log( 'isAuthenticated : --- you are not registered!!!!!!')
      return false;
    }
  };
  
  useEffect(() => {  
    const respons = isAuthenticated();
    // console.log('respons: ', respons);
    if(!respons) {
      // console.log( 'respons : --- you are not registered!!!!!!')
      navigate('/')
    }
    if (respons) {
      // Витягуємо session_id з URL
      const query = new URLSearchParams(location.search);
      const sessionId = query.get('session_id');
      // console.log('sessionId', sessionId); 
      if (!sessionId) {
        navigate('/');
      }     
      if (sessionId) {
        // Виконуємо запит до нашого бекенду для отримання деталей сесії
        fetch(`${SERVER_HOST}/api/checkout-session/${sessionId}`)
          .then(response => response.json())
          .then(data => {
            // Зберігаємо деталі сесії в стані
            // console.log('data session Stripe: --', data)
            setSessionDetails(data);
          })
          .catch(error => {
            console.error('Error fetching session details:', error);
          });
      }
      if (order_id && sessionId) {
        fetchData();
      }
      window.history.replaceState(null, '', window.location.pathname);
    }   
  }, [ location.search ]);
// }, [location.search]);

  if (!sessionDetails) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className='success-container'>
        
        <h2>Thank you for your purchase!</h2>
        
        {/* Відобразити іншу інформацію про замовлення */}
        
        <p>We are currently processing your order and 
          will send you a confirmation email shortly
        </p>
        <p>Your order will be delivered to this address:</p>
        <p>{sessionDetails.shipping_details.address.city}</p>
        <p>{sessionDetails.shipping_details.address.line1}, {sessionDetails.shipping_details.address.postal_code}</p>
        <p>{sessionDetails.shipping_details.name}</p>
        
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

export default Success;