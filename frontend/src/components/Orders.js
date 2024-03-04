import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [cart, setCart] = useState([]);
  const [userID, setUserId] = useState(null);
  const [orders, setOrders] = useState([]); 

  // const [totalPrice, setTotalPrice] = useState(0);

  // ============================= Отримання даних про користувача
  useEffect(() => {
    const fetchData = async () => {
      console.log('startet Home before fitch')
      console.log(isAuthenticated)
      try {        
        const authResponse = await fetch('http://localhost:3000/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        const authData = await authResponse.json();

        if (authData.isAuthenticated) {
          console.log('isAuthenticated --> true')
          // Якщо користувач аутентифікований, зробимо запит для отримання інформації про користувача
          const profileResponse = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            credentials: 'include',
          });
          const profileData = await profileResponse.json();
          console.log(profileData);
          setUser(profileData);
          setIsAuthenticated(true);
          setUserId(profileData.user_id)
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('користувач не автентифікований:')
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {        
        const response = await fetch(`http://localhost:3000/orders/${userID}`, {
          method: 'GET',
          credentials: 'include',
        });
      if (response.ok) {        
        const dataOrders = await response.json();
        console.log('my orders:', dataOrders);
        setOrders(dataOrders);
      }
        
      } catch (error) {
        console.log('Помилка при спробі глянути історію покупок:( :')
        console.error('Error fetching data:', error);
      }
    };
    fetchData()
  }, [user]);

  console.log('orders: ', orders);

  return (
    <div>
      <div className='navigation'>
        <Link  to="/"><button>Home</button></Link>
        <h2>My  order history</h2> 
        <Link to="/cart"><button>Basket</button></Link>
      </div>
      
      <ul className='container-order'>
        {orders.map((order) => (
          <li key={order.order_id} className='order-list'>
            
            <p>{new Date(order.order_date).toLocaleString()}</p>
            {/* <p>Order ID: {order.order_id}</p> */}
            <Link to={`/order_items/${order.order_id}`}>More...</Link>
            <p>Total: $ {order.total_amount}</p>
            {/* <p>Status: {order.status}</p> */}
            <div>{order.status ? (
                    <p>Status: {order.status}</p>
                  ) : (
                    <p>Status: unpaid</p> 
                  )}
            </div>
            {order.status ? (
                    <p></p>
                  ) : (                    
                    <Link to={`/checkout/${order.order_id}`}>
                      <button>Checkout Summary</button>
                    </Link>
                  )}
          </li>
        ))}
      </ul>
      
    </div>
  );
};

export default Orders;
