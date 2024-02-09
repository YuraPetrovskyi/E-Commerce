import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Login from './Login';

const ProductDetail = () => {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      }
    } catch (error) {
      console.error('Error fetching checkAuthentication:', error);
    }
  }

  const handleAddToCart = async () => {
    try {
      // Implement logic to add the product to the user's cart
      // You can make a request to the server to handle the cart update
      // Example: await fetch(`http://localhost:3000/carts/${user_id}`, {
      //   method: 'POST',
      //   credentials: 'include',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ product_id, quantity: 1 }),
      // });

      console.log(`Product ${product.name} added to the cart!`);
    } catch (error) {
      console.error('Error adding product to the cart:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
          <>
            <p>Welcome, {user}!</p>         
          </>
        ) : (
          <>
          </>
        )}
      <h2>{product.name}</h2>
      <p>Model: {product.model}</p>
      <p>Description: {product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Inventory: {product.inventory}</p>
      {isAuthenticated ? (
          <>
            <button onClick={handleAddToCart}>Add to Cart</button>       
          </>
        ) : (
          <>
            <h3>If you want to bay this item? you need to  login</h3>      
            <Link to="/login">
              <button>Login</button>
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </>
        )}
    </div>
  );
};

export default ProductDetail;


// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import './Products.css';

// const Products = () => {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/products');
//       if (response.ok) {
//         const data = await response.json();
//         console.log(data)
//         setProducts(data);
//       }
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     }
//   };

//   const addToCart = async (productId) => {
//     try {
//       const response = await fetch('http://localhost:3000/add-to-cart', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           userId: 1, // Потрібно замінити на реальний ID користувача після автентифікації
//           productId,
//           quantity: 1, // Кількість товару, яку додаємо
//         }),
//       });

//       if (response.ok) {
//         console.log('Product added to cart successfully');
//         // Тут можна додати оновлення стану корзини або інші дії
//       }
//     } catch (error) {
//       console.error('Error adding to cart:', error);
//     }
//   };

//   return (
//     <div className="products-container">
//       <h2>Products</h2>
//       <div className="product-list">
//         {products.map((product) => (
//           <div key={product.product_id} className="product-card">
//             <h3>{product.name}</h3>
//             <p>{product.description}</p>
//             <p>Price: ${product.price}</p>
//             <p>Inventory: {product.inventory}</p>
//             <button onClick={() => addToCart(product.product_id)}>Add to Cart</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Products;