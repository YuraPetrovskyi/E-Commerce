import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';

import Layout from './Layout';
import './Orders.css';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

const Orders = () => {
  const [orders, setOrders] = useState([]); 
  const { user, authenticated, userId } = useContext(CartContext);

  // const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if(!authenticated) {
  //     navigate('/')
  //   }    
  // }, [authenticated, navigate]);

  useEffect(() => {
    if(authenticated) {
      const fetchData = async () => {
        try {        
          const response = await fetch(`${SERVER_HOST}/orders/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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
  }, [user, userId, authenticated]);

  // console.log('orders: ', orders);
  const orders_paid = orders.filter(order => order.status === 'Paid');
  const orders_unpaid = orders.filter(order => order.status === null);

  console.log('orders_paid', orders_paid);
  console.log('orders_unpaid', orders_unpaid);

  if(!authenticated) {
    return (
      <Layout>
        <p className='empty-order-massege'> Ups! Please register first</p>
      </Layout>
    )
  }
  return (
    <Layout>
      <div className="orders-container">

        <div className="back-product-container">
          <button onClick={() => navigate(-1)} className="button-back">
            <img src="/images/back.png" alt="shopping-cart-icon" />
          </button>
          <div className="back-product-h2">
            <h2>Unpaid orders:</h2>
          </div>          
        </div>

        {orders_unpaid.length ? (<p></p>) : (<p> You have no orders that are waiting for payment </p>)}
        
        <ul className='orders-ul-container'>
          
          {orders_unpaid.map((order) => (
            
            <li key={order.order_id} className='order-list'>
              <div className='orders-number'>
                <h3>Id Order #{order.order_id}</h3>
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
          <h2>List of paid orders:</h2> 
          {orders_paid.length ? (<p></p>) : (<p> You have no paid orders </p>)}
          {orders_paid ? (<p></p>) : (<p> Loading ... </p>)}
          <ul className='paid-orders-ul-container'>
            {orders_paid.map((order) => (            
              <li key={order.order_id} className='order-list'>
                
                  <div className='paid-orders-number'>
                  <Link to={`/order_items/${order.order_id}`}>
                    <h3>Id Order #{order.order_id}</h3>
                    <p>{new Date(order.order_date).toLocaleString()}</p>
                    </Link>
                  </div>
                  {/* <Link to={`/order_items/${order.order_id}`}>Details ...</Link> */}
                  <div className='paid-orders-total-price'>
                    <p>Total</p>
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
