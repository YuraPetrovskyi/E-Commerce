import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Layout from './Layout';


import './Orders.css';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;



const Orders = () => {
  const [user, setUser] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [cart, setCart] = useState([]);
  const [userID, setUserId] = useState(null);
  const [orders, setOrders] = useState([]); 

  // const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  // ============================= Отримання даних про користувача
  useEffect(() => {
    const fetchData = async () => {
      // console.log('startet Home before fitch')
      // console.log(isAuthenticated)
      try {        
        const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });
        const authData = await authResponse.json();

        if (authData.isAuthenticated) {
          // console.log('isAuthenticated --> true')
          // Якщо користувач аутентифікований, зробимо запит для отримання інформації про користувача
          const profileResponse = await fetch(`${SERVER_HOST}/profile`, {
            method: 'GET',
            credentials: 'include',
          });
          const profileData = await profileResponse.json();
          // console.log(profileData);
          setUser(profileData);
          // setIsAuthenticated(true);
          setUserId(profileData.user_id)
        } 
      } catch (error) {
        console.log('користувач не автентифікований:')
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if(userID) {
      const fetchData = async () => {
        try {        
          const response = await fetch(`${SERVER_HOST}/orders/${userID}`, {
            method: 'GET',
            credentials: 'include',
          });
        if (response.ok) {        
          const dataOrders = await response.json();
          // console.log('my orders:', dataOrders);
          setOrders(dataOrders);
        }
          
        } catch (error) {
          console.log('Помилка при спробі глянути історію покупок:( :')
          console.error('Error fetching data:', error);
        }
      };
      fetchData()
    }    
  }, [user, userID]);

  // console.log('orders: ', orders);
  const orders_paid = orders.filter(order => order.status === 'Paid');
  const orders_unpaid = orders.filter(order => order.status === null);

  // console.log('orders_paid', orders_paid);
  // console.log('orders_unpaid', orders_unpaid);

  return (
    <Layout>
      <div className="orders-container">
        <div className="back-product-container">
          <button onClick={() => navigate(-1)} className="button-back">
            <img src="/images/back.png" alt="shopping-cart-icon" />
          </button>
          <div className="back-product-h2">
            <h2>Unpaid orders</h2>
          </div>          
        </div>
        <ul className='orders-ul-container'>
          {orders_unpaid.map((order) => (
            <li key={order.order_id} className='order-list'>
              
              <div className='orders-number'>
                <h3>Order №{order.order_id}</h3>
                <p>{new Date(order.order_date).toLocaleString()}</p>
              </div>
              
              
              <Link to={`/order_items/${order.order_id}`}>Order details....</Link>
              
              <div className='orders-total-price'>
                <h3>Total</h3>
                <p>${order.total_amount}</p>   
              </div>

              <Link to={`/checkout/${order.order_id}`}>
                <button>Checkout Summary</button>
              </Link> 
            </li>
          ))}
        </ul>

        <div className="paid-orders-container">        
          <h2>Paid orders</h2> 
          <ul className='orders-ul-container'>
          {orders_paid.map((order) => (

            <li key={order.order_id} className='order-list'>

              <div className='orders-number'>
                <h3>Order № {order.order_id}</h3>
                <p>{new Date(order.order_date).toLocaleString()}</p>
              </div>
              
              <Link to={`/order_items/${order.order_id}`}>Order details</Link>
              
              <div className='orders-total-price'>
                <h3>Total</h3>
                <p>${order.total_amount}</p>   
              </div>

            </li>
            ))}
          </ul>
        </div>
      </div>
      

    </Layout>
  );
};

export default Orders;
