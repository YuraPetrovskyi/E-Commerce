import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import './Cart.css';
import Layout from './Layout';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;
// require('dotenv').config();

const Cart = () => {
  const [products, setProducts] = useState([]); 
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartEmpty, setCartEmpty] = useState('');
  
  const { setCartLenght, setCart } = useContext(CartContext);
  const { cartlenght, cartId, cart, authenticated } = useContext(CartContext);

  const navigate = useNavigate();

  
        
  

  useEffect(() => {    
    const fetchData = async () => {
      if (!cartlenght) {
        // console.log('Your basket is empty :)');
        setCartEmpty('Your basket is empty :)');          
        setProducts([]);        
        return;
      }
      try {        
        // Отримуємо дані про кожен продукт у корзині та оновлюємо стан products
        const productPromises = cart.map(async (item) => {
          const productResponse = await fetch(`${SERVER_HOST}/products/${item.product_id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return productResponse.json();
        });    
        const productData = await Promise.all(productPromises);
        setProducts(productData);
      } catch (error) {
        toast.error('Error fetching product data:', error);
      }
    };
  
    fetchData();
  }, [cart, cartlenght]);

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
        toast.error(`Product not found in cart`);
        return;
      }  
      const cartItemId = cartItem.cart_item_id;  
      // Відправляємо запит на видалення з сервера за допомогою cart_item_id
      await fetch(`${SERVER_HOST}/cart_items/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      // setCartId(cartId);// Оновлюємо cartID, щоб спровокувати оновлення useEffect
      toast.success(`Product was deleted`, {
        position: "top-right",
        autoClose: 1000
      });
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
        toast.warn(`Product not found in cart`);
        return;
      }
      const cartItemId = cartItem.cart_item_id;
      const response = await fetch(`${SERVER_HOST}/cart_items/${cartItemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (response.ok) {
        const updatedCart = cart.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedCart);
        // setCartId(cartId); // Спровокує оновлення useEffect
      } else {
        console.error('Failed to update quantity');
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      const featch_heckout = await fetch(`${SERVER_HOST}/orders/${cartId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
      // console.log(featch_heckout);
      if (featch_heckout.ok) {
        // console.log('featch_heckout.ok : ', featch_heckout.ok);
        setProducts([]);
        setCartLenght(null);
        setCartEmpty('');
        setCart([]);// Оновлюємо cartID, щоб спровокувати оновлення useEffect 
        toast.success(`Замовлення створено`); 
        navigate('/order_created');       
      } else {
        // console.log('featch_heckout : ', featch_heckout);

        toast.error(`Помилка при створенні ордеру!`);
      } 
    } catch (error) {
      // console.error('Error during checkout:', error);
      toast.error('Error during checkout!', error);
    }
  };

  if (cartlenght > 0) {
    while(!products.length) {
      return (
        <Layout>
          <div>Loading...</div>
        </Layout>
        
      )
    }
  }
  if(!authenticated) {
    return (
      <Layout>
        <p className='empty-backet-massege'> Ups! Basket is available for registered users</p>
      </Layout>
    )
  }
  return (
    <Layout>
      <ToastContainer />
      
      <div className="back-cart-container">
        <button onClick={() => navigate(-1)} className="button-back">
          <img src={`${process.env.PUBLIC_URL}/images/back.png`} alt="shopping-cart-icon" />
        </button>                  
        <h2>My basket</h2>      
        <Link to="/orders">Go to Orders</Link>
      </div>
      
      <div className="cart-empty-message">
        {cartEmpty && <p>{cartEmpty}</p>}
      </div> 
      
      <div className='cart-main-container'>
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

        {cartEmpty ?
          (
            <div></div>
          ) : (
            <div className="total-price">
              <p>Total: ${totalPrice.toFixed(2)}</p> 
              <button className="checkout-button" onClick={() => handleCheckout()}>Create an order</button>
            </div>
          )
        } 
      </div>   
    </Layout>
  );

};

export default Cart;



  // const [user, setUser] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [cart, setCart] = useState([]);
  // const [cartID, setCartId] = useState(null);
  // ============================= Отримання даних про користувача
  // useEffect(() => {
  //   const fetchData = async () => {
  //     // console.log('startet Cart before fitch')
  //     console.log(`${SERVER_HOST}/check-auth`)
  //     try {        
  //       const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
  //         method: 'GET',
  //         credentials: 'include',
  //       });
  //       const authData = await authResponse.json();

  //       if (authData.isAuthenticated) {
  //         // console.log('isAuthenticated --> true')
  //         // Якщо користувач аутентифікований, зробимо запит для отримання інформації про користувача
  //         const profileResponse = await fetch(`${SERVER_HOST}/profile`, {
  //           method: 'GET',
  //           credentials: 'include',
  //         });
  //         const profileData = await profileResponse.json();
  //         // console.log(profileData);
  //         // setUser(profileData);
  //         // setIsAuthenticated(true);
  //         setCartId(profileData.user_id)
  //       } 
  //     } catch (error) {
  //       console.log('користувач не автентифікований:')
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);