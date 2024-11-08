import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import './OrderItem.css';
import Layout from './Layout';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

const OrderItem = () => {
  const { order_id } = useParams();
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]); 

  // const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  const { user, authenticated } = useContext(CartContext);

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

  // console.log('orders: ', orderItems);

  return (
    <Layout>
      <div className="cart-back-container">
        <div className="back-cart-container">
          <button onClick={() => navigate(-1)} className="button-back">
            <img src={`${process.env.PUBLIC_URL}/images/back.png`} alt="shopping-cart-icon" />
          </button>                  
          <h2>Order details</h2>      
          <Link to="/orders">Go to Orders</Link>
        </div>
      </div>     
      <ul className='order-items'>
        {orderItems.map((item) => {
          // Знаходимо відповідний продукт за його product_id
          const product = products.find((prod) => prod.product_id === item.product_id);
          // Перевіряємо, чи знайдено продукт
          if (product) {            
            return (
              <li key={item.order_item_id} className='container-order-items'>
                <div className="cart-order-items">
                  <div className="cart-order-items">
                    <img src={product.image_url} alt={product.name} />
                  </div>                             
                </div>
                
                <div className='container-order-items-discription'>
                  <Link to={`/products/${product.product_id}`}>
                    <p>{product.model}</p>
                  </Link>                
                  <p>${product.price}</p>                
                  <p>Quantity : {item.quantity}</p>
                </div>                
              </li>
            );
          } else {
            return null; // Якщо продукт не знайдено, пропустити його
          }
        })}
      </ul>      
    </Layout>
  );
};

export default OrderItem;


// console.log('products: ',products);

  // ============================= Отримання даних про користувача
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

  //       if (authenticated) {
  //         // console.log('isAuthenticated --> true')
  //         // Якщо користувач аутентифікований, зробимо запит для отримання інформації про користувача
  //         const profileResponse = await fetch(`${SERVER_HOST}/profile`, {
  //           method: 'GET',
  //           credentials: 'include',
  //         });
  //         const profileData = await profileResponse.json();
  //         // console.log(profileData);
  //         setUser(profileData);
  //         setIsAuthenticated(true);
  //         // setUserId(profileData.user_id)
  //       } else {
  //         setIsAuthenticated(false);
  //       }
  //     } catch (error) {
  //       console.log('користувач не автентифікований:')
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, [isAuthenticated]);