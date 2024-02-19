import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductsDetail.css';

const ProductDetail = () => {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [user_id, setUserID] = useState(null);

  const [carts, setCart] = useState([]);
  const [renue, setRenue] = useState(0);
  

  useEffect(() => {
    checkAuthentication();       
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/products/${product_id}`);
        const data = await response.json();
        setProduct(data[0]); // Assuming the API response is an array with a single product
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchData();
  }, [product_id]);
  
  

  const checkAuthentication = async () => {
    try {
      const response = await fetch('http://localhost:3000/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('response: ',response)
      if (response.ok) {
        const data = await response.json();
        console.log('data from respons: ', data)
        setUser(data.username);
        setIsAuthenticated(true);
        setUserID(data.user_id);
      }
    } catch (error) {
      console.error('Error fetching checkAuthentication:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/cart_items/${user_id}`);
        const cartrespons = await response.json();
        console.log('carts: ', cartrespons);
        setCart(cartrespons);
        
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, [user_id, renue]);
  console.log('carts', carts);


  const handleAddToCart = async () => {
    try {
      // Перевірка, чи є товар з таким самим product_id в корзині
    const existingCartItem = carts.find((item) => item.product_id === product.product_id);
    
    if (existingCartItem) {
      // Якщо товар вже є в корзині, виводимо повідомлення користувачу та пропонуємо перейти до корзини
      alert(`Product ${product.name} ${product.model} is already in the cart!`);
      return;
    }

    // Якщо товар відсутній в корзині, відправляємо запит на сервер для додавання його в корзину
    
      await fetch(`http://localhost:3000/cart_items/${user_id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id, quantity }),
      });

      console.log(`Product ${product.name} ${product.model} added to the cart!`);
      alert(`${quantity} of product ${product.name} ${product.model} added to the cart!`);
      setQuantity(1);
      setRenue(1);
    } catch (error) {
      console.error('Error adding product to the cart:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-detail-container">
      {isAuthenticated ? (
        <div className="auth-container">
          <Link className='container-home' to="/">Home</Link>
          <p>Welcome, {user}!</p>
          <Link to="/cart">Cart ({carts.length})</Link>
        </div>
      ) : (
        <div className="auth-container">
          <h3>If you want to buy this item, please login.</h3>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      )}
      <div className="product-detail">
        <div className="product-image">
          <img src={product.image_url} alt={product.name} />
        </div>    

        <div className="product-info">
          <p>{product.name}</p>
          <div  className="product-name">            
            <p>Model:</p>
            <p>{product.model}</p>
          </div>
          <div className="product-name">
            <p>Description:</p>
            <p>{product.description}</p>
          </div>
          <div className="product-name">
            <p>Price: ${product.price}</p> 
          </div>    
        </div>        
      </div>
      <div>
        {product.inventory > 10 ? (
          <p>This product is in stock</p>
        ) : (
          <p>This product is almost out of stock</p>
        )}
        {isAuthenticated && (
              <div className="add-to-cart">
                <label htmlFor="quantity">Quantity:</label>
                <select id="quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}>
                  {[...Array(product.inventory).keys()].map((index) => (
                    <option key={index + 1} value={index + 1}>{index + 1}</option>
                  ))}
                </select>
                <button onClick={handleAddToCart}>Add to Cart</button>
              </div>
            )}
      </div>      
    </div>
  );
};

export default ProductDetail;
