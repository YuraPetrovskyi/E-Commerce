import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './OrderItem.css';

const OrderItem = () => {
  const { order_id } = useParams();
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [userID, setUserId] = useState(null);
  const [orderItems, setOrderItems] = useState([]); 

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);
  console.log('products: ',products);
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
        const response = await fetch(`http://localhost:3000/order_items/${order_id}`, {
          method: 'GET',
          credentials: 'include',
        });
      if (response.ok) {
        const dataOrders = await response.json();
        console.log('my order items:', dataOrders);
        setOrderItems(dataOrders);
      }
        
      } catch (error) {
        console.log('Помилка при спробі глянути деталі покупок:( :')
        console.error('Error fetching data:', error);
      }
    };
    fetchData()
  }, [user]);



  console.log('orders: ', orderItems);

  return (
    <div>
      <div className='navigation'>
        <Link  to="/"><button>Home</button></Link>
        <h2>My  order history</h2> 
        <Link  to="/orders"><button>Orders</button></Link>
      </div>      
      <ul className='container-oreder-item'>
        {orderItems.map((item) => {
          // Знаходимо відповідний продукт за його product_id
          const product = products.find((prod) => prod.product_id === item.product_id);
          // Перевіряємо, чи знайдено продукт
          if (product) {
            return (
              <li key={item.order_item_id} className='oreder-item-list'>
                {/* <p>product_id : {product.product_id}</p> */}
                <div className='img-container'>
                  <img src={product.image_url} alt={product.name} className='img-container'/>
                </div>
                {/* <p>Image URL: {product.image_url}</p> */}
                <p>{product.name}</p>
                <Link to={`/products/${product.product_id}`}>
                  <p>{product.model}</p>
                </Link>                
                {/* <p>Description: {product.description}</p> */}
                <p>$ {product.price} * {item.quantity}</p>                
                {/* <p>Quantity : {item.quantity}</p> */}
                {/* <p>Order_item ID: {item.order_item_id}</p>             */}
              </li>
            );
          } else {
            return null; // Якщо продукт не знайдено, пропустити його
          }
        })}
      </ul>      
    </div>
  );
};

export default OrderItem;
