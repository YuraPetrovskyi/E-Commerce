import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartID, setCartId] = useState(null);
  const [products, setProducts] = useState([]); 

  const [totalPrice, setTotalPrice] = useState(0);

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

  // ============================= Отримання даних про товари у корзині
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
      await fetch(`http://localhost:3000/cart_items/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });  
      // Оновлюємо стан корзини
      const updatedCart = cart.filter((item) => item.cart_item_id !== cartItemId);
      setCart(updatedCart);
      console.log('updatedCart in handleDelete', updatedCart)
      console.log('cartItem in handleDelete', cartItem)
      console.log('cartItemId in handleDelete', cartItemId)
      // Оновлюємо стан корзини, видаляючи відповідний товар з масиву products
      const updatedProducts = products.filter((product) => product[0].product_id !== productId);
      setProducts(updatedProducts);      
      setCartId(cartID);// Оновлюємо cartID, щоб спровокувати оновлення useEffect
      alert(`Product with productId ${productId} and cartItemId ${cartItemId} was deleted`);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };
  // console.log('user', user);
  console.log('cart', cart);
  // console.log('cartID', cartID);
  // // console.log('productsID', productsID);
  console.log('products', products);
  // console.log('isAuthenticated', isAuthenticated);


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
      const response = await fetch(`http://localhost:3000/cart_items/${cartItemId}`, {
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
    
  }

return (
  <div>
    <Link className='container-home' to="/">Home</Link>
    <p>My basket</p>
    <Link className='container-home' to="/history">Order history</Link>
    <ul className='container-cart'>
      {products.map((product, index) => {
        const item = cart[index];
        const productInfo = product[0];
        const subtotal = parseFloat(productInfo.price) * item.quantity;
        const inventoryOptions = Array.from({ length: productInfo.inventory }, (_, i) => i + 1); // Варіанти кількості товару
        return (
          <li key={productInfo.product_id} className='container-items'>
            <div className="product-info">
              <Link to={`/products/${productInfo.product_id}`}>
                <p>{productInfo.name} {productInfo.model}</p>
              </Link>              
            </div>
            <div className='container-price'>
              <p>${productInfo.price}</p>
              <div className="quantity-control">
                <select
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(productInfo.product_id, e.target.value)}
                >
                  {inventoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                
              </div>
              <p className="subtotal">Total: ${subtotal.toFixed(2)}</p>
              <button onClick={() => handleDelete(productInfo.product_id)}>Delete</button>
            </div>            
          </li>
        );
      })}
    </ul>
    <p className="total-price">Total Price: ${totalPrice.toFixed(2)}</p>
    <button className="checkout-button" onClick={() => handleCheckout()}>Proceed to Checkout</button>
  </div>
);

};

export default Cart;
