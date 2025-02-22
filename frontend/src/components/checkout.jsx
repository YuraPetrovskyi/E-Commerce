import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStripe } from "@stripe/react-stripe-js";
import { CartContext } from './CartContext';

import Layout from './Layout';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;


const Checkout = () => {
  const { order_id } = useParams();
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]); 
  const [totalPrice, setTotalPrice] = useState(0);
  const { user, userId, authenticated } = useContext(CartContext);

  const stripe = useStripe();
  const navigate = useNavigate();

  useEffect(() => {
    if(!authenticated) {
      navigate('/')
    }    
  }, [authenticated, navigate]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${SERVER_HOST}/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };
    fetchData();
  }, []);
  // console.log('products: ',products);  

  useEffect(() => {
    const fetchData = async () => {
      try {        
        const response = await fetch(`${SERVER_HOST}/order_items/${order_id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const dataOrders = await response.json();
          // console.log('my order items:', dataOrders);
          setOrderItems(dataOrders);
        }        
      } catch (error) {
        // console.log('Помилка при спробі глянути деталі покупок:( :')
        console.error('Error fetching data:', error);
      }
    };
    fetchData()
  }, [user, order_id]);

  useEffect(() => {
    if(userId) {
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
            // Using the find method to find the first element that matches the condition
            const foundOrder = dataOrders.find(order => order.order_id === Number(order_id));
            setTotalPrice(foundOrder.total_amount);
            // setOrders(dataOrders);
          }          
        } catch (error) {
          // console.log('Помилка при спробі глянути історію покупок:( :')
          console.error('Error fetching data:', error);
        }
      };
      fetchData()
    }        
  }, [userId, order_id]);

  // console.log('order items: ', orderItems);
  // console.log('user: ', user);

  const handleGuestCheckout = async () => {
    // create line_items - required for a stripe
    const line_items = orderItems.map(item => {
      const product = products.filter(product => product.product_id === item.product_id);
      // console.log('product : ',product);      
      return {
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: product[0].price * 100, // amount is in cents
          product_data: {
            name: product[0].model,
            description: product[0].description
            // images: [item.imageUrl], 
          }
        }
      }
    })
    // console.log('line_items', line_items);  

    // creating the request body
    const body = {
      line_items,
      customer_email: user.email,
      order_id: order_id
    };
    // console.log('body', body);

    // a request to the server to create a stripe session ID 
    const response = await fetch(`${SERVER_HOST}/create-checkout-session`, {
      method: 'POST',
      ...(body && { body: JSON.stringify(body) }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const { sessionId } = await response.json();
    // console.log('sessionId : ', sessionId)
    // redirection to the Stripe page for further payment
    const { error } = await stripe.redirectToCheckout({
      sessionId
    });    
    if (error) {
      console.log('error : ', error);
    }
  };

  return (
    <Layout>
      <div className="cart-back-container">
        <div className="back-cart-container">
          <button onClick={() => navigate(-1)} className="button-back">
            <img src={`${process.env.PUBLIC_URL}/images/back.png`} alt="shopping-cart-icon" />
          </button>                  
          <h2>Checkout Summary</h2>      
          <Link to="/orders"><button>Orders</button></Link>
        </div>
      </div>
      <div className="checkout-container">
        <p>Total Items: {orderItems.length}</p>
        <Link to={`/order_items/${order_id}`}>More...</Link>
        <p>Amount to pay: ${totalPrice}</p>
        {user && user.email && <h4>Email: {user.email}</h4>}
        <button onClick={() => handleGuestCheckout()}>CHECKOUT</button>
      </div>      
    </Layout>
  );
};

export default Checkout;


// // ============================= Obtaining user data
  // useEffect(() => {
  //   const fetchData = async () => {
  //     // console.log('startet Home before fitch')
  //     // console.log(isAuthenticated)
  //     try {        
  //       const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
  //         method: 'GET',
  //         credentials: 'include',
  //       });
  //       const authData = await authResponse.json();

  //       if (authData.isAuthenticated) {
  //         // console.log('isAuthenticated --> true')
  //         // If the user is authenticated, we will make a request to obtain information about the user
  //         const profileResponse = await fetch(`${SERVER_HOST}/profile`, {
  //           method: 'GET',
  //           credentials: 'include',
  //         });
  //         const profileData = await profileResponse.json();
  //         // console.log(profileData);
  //         setUserId(profileData.user_id);
  //         setUser(profileData);
  //         // setIsAuthenticated(true);
  //       } 
  //     } catch (error) {
  //       console.log('користувач не автентифікований:')
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);