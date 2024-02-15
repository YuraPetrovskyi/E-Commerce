import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import './Products.css'

const Cart = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartID, setCartId] = useState(null);
  // const [productsID, setProductsId] = useState([]);
  const [products, setProducts] = useState([]); 


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
          setCartId(profileData.user_id)
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
        const response = await fetch(`http://localhost:3000/cart_items/${cartID}`);
        const cartData  = await response.json();
        console.log('cartData : ', cartData );
        setCart(cartData );

        // Отримання даних про кожен продукт у корзині та оновлення стану products
        const productPromises = cartData.map(async (item) => {
          const productResponse = await fetch(`http://localhost:3000/products/${item.product_id}`);
          return productResponse.json();
        });
        
        Promise.all(productPromises).then((productData) => {
          setProducts(productData);
        });
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, [cartID]);

  console.log('user', user);
  console.log('cart', cart);
  console.log('cartID', cartID);
  // console.log('productsID', productsID);
  console.log('products', products);
  console.log('isAuthenticated', isAuthenticated);

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
      const deleteProduct = await fetch(`http://localhost:3000/cart_items/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
  
      // Оновлюємо стан корзини
      const updatedCart = cart.filter((item) => item.cart_item_id !== cartItemId);
      setCart(updatedCart);
      console.log('updatedCart', updatedCart)
      console.log('cartItem', cartItem)
      console.log('cartItemId', cartItemId)
      // Оновлюємо стан корзини, видаляючи відповідний товар з масиву products
      const updatedProducts = products.filter((product) => product[0].product_id !== productId);
      setProducts(updatedProducts);
      // Оновлюємо cartID, щоб спровокувати оновлення useEffect
      setCartId(cartID);
      alert(`Product with productId ${productId} and cartItemId ${cartItemId} was deleted`);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };


  return (
    <div>
      {/* <Link to="/cart" >Cart ({cart.carts.length})</Link> */}
      <p>My Cart</p>
      {/* <p>products in cart: {cart[0].quantity}</p> */}
      <ul className='container'>
        {products.map((product) => (
          <li key={product[0].product_id}>
            <p>{product[0].name} {product[0].model}</p>
            <p>${product[0].price}</p>
            <p>{product[0].quantity}</p>

            <Link to={`/products/${product[0].product_id}`}>More information</Link>
            <button onClick={() => handleDelete(product[0].product_id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
