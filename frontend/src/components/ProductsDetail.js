import React, { useEffect, useState, useContext }from "react";
import { useParams, useNavigate } from 'react-router-dom';
import './ProductsDetail.css';
import Layout from './Layout';

import { CartContext } from './CartContext';


const ProductDetail = () => {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [user_id, setUserID] = useState(null);

  const [carts, setCart] = useState([]);  
  const [renue, setRenue] = useState(0);
  
  const navigate = useNavigate();

  const { cartlenght, setCartLenght } = useContext(CartContext);


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
    if (user_id) {
      const fetchData = async () => {
        try {
          const response = await fetch(`http://localhost:3000/cart_items/${user_id}`);
          if(response.ok) {            
            const cartrespons = await response.json();
            console.log('response: ', response);
            console.log('cartrespons: ', cartrespons);
            setCart(cartrespons);
          }
          if(response.status === 404){
            const text = await response.text()  
            console.log('response: ', text);  
          } 
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      };
      fetchData();
    }
  }, [user_id, renue, quantity]);
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
      setQuantity(1);
      setRenue(1);
      setCartLenght(cartlenght + 1);
      alert(`${quantity} of product ${product.name} ${product.model} added to the cart!`);
    } catch (error) {
      console.error('Error adding product to the cart:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="product-container">
        {isAuthenticated ? (
          <div className="back-product-container">
            <button onClick={() => navigate(-1)} className="button-back">
              <img src="/images/back.png" alt="shopping-cart-icon" />
            </button>  
            <div className="back-product-h2">
              <h2>{product.model}</h2>
            </div>         
          </div>
          ) : (
          <div className="back-product-container">          
            <button onClick={() => navigate(-1)} className="button-back">
              <img src="/images/back.png" alt="shopping-cart-icon" />
            </button>      
            <div className="back-product-h2">
              <h2>If you want to buy this item, please login.</h2>              
            </div>     
          </div>
        )}
        <div className="product-detail">
          <div className="product-image">
            <img src={product.image_url} alt={product.name} />
          </div> 
          <div className="product-info">
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
            <h3>This product is in stock</h3>
          ) : (
            <h3>This product is almost out of stock</h3>
          )}
          {isAuthenticated && (
                <div className="add-to-cart">
                  <label htmlFor="quantity">Quantity</label>
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
    </Layout>    
  );
};

export default ProductDetail;
