import React, { useEffect, useState, useContext }from "react";
import { useParams, useNavigate } from 'react-router-dom';
import './ProductsDetail.css';
import Layout from './Layout';
import { CartContext } from './CartContext';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

const ProductDetail = () => {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);  
  const { cartlenght, authenticated, cart, userId} = useContext(CartContext);
  const { setCartLenght,} = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${SERVER_HOST}/products/${product_id}`);
        const data = await response.json();
        setProduct(data[0]); // Assuming the API response is an array with a single product
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
    fetchData();
  }, [product_id]);
  
  
  const handleAddToCart = async () => {
    try {
      // Перевірка, чи є товар з таким самим product_id в корзині
      const existingCartItem = cart.find((item) => item.product_id === product.product_id);    
      if (existingCartItem) {
        // Якщо товар вже є в корзині, виводимо повідомлення користувачу та пропонуємо перейти до корзини
        toast.warn(`Product ${product.name} ${product.model} is already in the cart!`,{
          position: "top-right",
          autoClose: 3000
        });
        return;
      }
      // Якщо товар відсутній в корзині, відправляємо запит на сервер для додавання його в корзину    
      await fetch(`${SERVER_HOST}/cart_items/${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Якщо використовуєте автентифікацію через токен
        },
        body: JSON.stringify({ product_id, quantity }),
      });
      console.log(`Product ${product.name} ${product.model} added to the cart!`);      
      setQuantity(1);
      setCartLenght(cartlenght + 1);
      toast.success(`${quantity} of product ${product.name} ${product.model} added to the cart!`, {
        position: "top-right",
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error adding product to the cart:', error);
      toast.error('Error adding product to the cart.');
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="product-container">
        {authenticated ? (
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
          {authenticated && (
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




  // const checkAuthentication = async () => {
  //   try {
  //     const response = await fetch(`${SERVER_HOST}/check-auth`, {
  //       method: 'GET',
  //       credentials: 'include',
  //     });
  //     console.log('response: ',response)
  //     if (response.ok) {
  //       const data = await response.json();
  //       // console.log('data from respons: ', data)
  //       // setUser(data.username);
  //       setIsAuthenticated(true);
  //       setUserID(data.user_id);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching checkAuthentication:', error);
  //   }
  // };

  // useEffect(() => {
  //   if (user.user_id) {
  //     const fetchData = async () => {
  //       try {
  //         const response = await fetch(`${SERVER_HOST}/cart_items/${user.user_id}`);
  //         if(response.ok) {            
  //           const cartrespons = await response.json();
  //           // console.log('response: ', response);
  //           // console.log('cartrespons: ', cartrespons);
  //           setCart(cartrespons);
  //         }
  //         if(response.status === 404){
  //           const text = await response.text()  
  //           console.log('response: ', text);  
  //         } 
  //       } catch (error) {
  //         console.error('Error fetching product data:', error);
  //       }
  //     };
  //     fetchData();
  //   }
  // }, [user_id, renue, quantity]);
  // console.log('carts', carts);

