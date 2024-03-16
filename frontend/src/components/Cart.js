import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import './Cart.css';

import Layout from './Layout';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

// require('dotenv').config();
const Cart = () => {
  // const [user, setUser] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartID, setCartId] = useState(null);
  const [products, setProducts] = useState([]); 
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartEmpty, setCartEmpty] = useState('');
  
  const { setCartLenght } = useContext(CartContext);
  const navigate = useNavigate();

  // ============================= Отримання даних про користувача
  useEffect(() => {
    const fetchData = async () => {
      // console.log('startet Cart before fitch')
      console.log(`${SERVER_HOST}/check-auth`)
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
          // setUser(profileData);
          // setIsAuthenticated(true);
          setCartId(profileData.user_id)
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
        if (!cartID) return;
  
        const response = await fetch(`${SERVER_HOST}/cart_items/${cartID}`);
        
        // Перевіряємо, чи відповідь вдала
        if (!response.ok) {
          if (response.status === 404) {
            // Відобразити повідомлення, якщо корзина порожня
            console.log('Your basket is empty :)');
            setCartEmpty('Your basket is empty :)');
            // alert('Your basket is empty :)');
            setProducts([]);
            setCart([]);
            setCartLenght(null);
          } else {
            // Інші статуси можуть сигналізувати про помилку на сервері або інші проблеми
            console.error('Unexpected response status:', response.status);
          }
          return;
        }
  
        // Отримуємо дані корзини
        const cartData = await response.json();
        // console.log('cartData : ', cartData );
        setCart(cartData);
        
        // Отримуємо дані про кожен продукт у корзині та оновлюємо стан products
        const productPromises = cartData.map(async (item) => {
          const productResponse = await fetch(`${SERVER_HOST}/products/${item.product_id}`);
          return productResponse.json();
        });          
        
        const productData = await Promise.all(productPromises);
        setProducts(productData);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };
  
    fetchData();
  }, [cartID, setCartLenght]);

  // ============================= Обчислення загальної суми
  useEffect(() => {
    // Після кожного оновлення корзини перераховуємо загальну суму
    let totalPrice = 0;
    cart.forEach((item) => {
      const product = products.find((p) => p[0].product_id === item.product_id);
      if (product) {
        totalPrice += parseFloat(product[0].price) * item.quantity;
      }
    });
    setTotalPrice(totalPrice);
  }, [cart, products]);

  // ============================= Видалення товару з корзини
  const handleDelete = async (productId) => {
    try {
      // Знаходимо cart_item_id за product_id
      const cartItem = cart.find((item) => item.product_id === productId);  
      if (!cartItem) {
        // Якщо відповідний товар не знайдено в корзині
        console.error('Product not found in cart');
        alert(`Product not found in cart`);
        return;
      }  
      const cartItemId = cartItem.cart_item_id;  
      // Відправляємо запит на видалення з сервера за допомогою cart_item_id
      await fetch(`${SERVER_HOST}/cart_items/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });  
      // Оновлюємо стан корзини
      const updatedCart = cart.filter((item) => item.cart_item_id !== cartItemId);
      setCart(updatedCart);            
      // console.log('updatedCart in handleDelete', updatedCart)
      if(updatedCart.length > 0) {
        setCartLenght(updatedCart.length);
      }
      if (updatedCart.length === 0) {
        setCartEmpty('Your basket is empty :)');
        setCartLenght(null);
      }
      // console.log('cartItem in handleDelete', cartItem)
      // console.log('cartItemId in handleDelete', cartItemId)

      // Оновлюємо стан корзини, видаляючи відповідний товар з масиву products
      const updatedProducts = products.filter((product) => product[0].product_id !== productId);
      setProducts(updatedProducts);      
      setCartId(cartID);// Оновлюємо cartID, щоб спровокувати оновлення useEffect
      alert(`Product with productId ${productId} and cartItemId ${cartItemId} was deleted`);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // console.log('cart', cart);
  // console.log('products', products);


  // ============================= Зміна кількості товару
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      const cartItem = cart.find((item) => item.product_id === productId);
      if (!cartItem) {
        console.error('Product not found in cart');
        alert(`Product not found in cart`);
        return;
      }
      const cartItemId = cartItem.cart_item_id;
      const response = await fetch(`${SERVER_HOST}/cart_items/${cartItemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (response.ok) {
        const updatedCart = cart.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedCart);
        setCartId(cartID); // Спровокує оновлення useEffect
      } else {
        console.error('Failed to update quantity');
        alert('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      const featch_heckout = await fetch(`${SERVER_HOST}/orders/${cartID}`, {
            method: 'POST',
            credentials: 'include',
          });
      // console.log(featch_heckout);
      if (featch_heckout.ok) {
        // console.log('featch_heckout.ok : ', featch_heckout.ok);
        setProducts([]);
        setCartLenght(null);
        setCartEmpty('');
        setCartId(cartID);// Оновлюємо cartID, щоб спровокувати оновлення useEffect 
        alert(`Замовлення створено`); 
        navigate('/order_created');       
      } else {
        alert(`Помилка при створенні ордеру!`);
      } 
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

return (
  <Layout>

    <div className="cart-back-container">
      <div className="back-cart-container">
        <button onClick={() => navigate(-1)} className="button-back">
          <img src="/images/back.png" alt="shopping-cart-icon" />
        </button>                  
        <h2>My basket</h2>      
        <Link to="/orders"><button>Orders</button></Link>
      </div>
    </div>
    <div className="cart-empty-message">
      {cartEmpty && <h3>{cartEmpty}</h3>}
    </div> 
    
    <ul className='container-cart'>
      
      {products.map((product, index) => {
        const item = cart[index];
        const productInfo = product[0];
        const subtotal = parseFloat(productInfo.price) * item.quantity;
        const inventoryOptions = Array.from({ length: productInfo.inventory }, (_, i) => i + 1); // Варіанти кількості товару
        
        return (
          <li key={productInfo.product_id} className='container-items'>
            
            <div className="cart-item-info">
              <div className="cart-item-image">
                <img src={productInfo.image_url} alt={productInfo.name} />
              </div>                             
            </div>

            <div className='container-discription'>              
              <div className='container-discription-price'>
                <Link to={`/products/${productInfo.product_id}`}>
                  <p>{productInfo.model}</p>
                </Link>
                
                <div className="cart-price">
                  <p>${productInfo.price}</p>
                  <select
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(productInfo.product_id, e.target.value)}
                  >
                    {inventoryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select> 
                  <p>Total: ${subtotal.toFixed(2)}</p>               
                </div>
              </div> 
              
              <div className='container-delete-button'>                
                <button onClick={() => handleDelete(productInfo.product_id)}>Delete</button>
              </div>              
            </div> 
                    
          </li>
        );
      })}
    </ul>

    <div>
      {cartEmpty ?
        (
          <div></div>
        ) : (
          <div className="total-price"> 
            <p>Total: ${totalPrice.toFixed(2)}</p>
            <button className="checkout-button" onClick={() => handleCheckout()}>Create an order</button>
          </div>
        )}
    </div>  

  </Layout>
);

};

export default Cart;
