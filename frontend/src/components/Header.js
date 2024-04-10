import React, { useContext, useState  }from "react";
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

const Header = () => {  
  const navigate = useNavigate();
  const { cartlenght, user, authenticated } = useContext(CartContext);
  const { setAuthenticated } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);



  const handleLogout = async () => {
    try {
      const response = await fetch(`${SERVER_HOST}/logout`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Якщо використовуєте автентифікацію через токен
        }
      });
      if (response.ok) {
        const data = await response.json();
        // console.log(data);
        if (data.redirect) {
          localStorage.removeItem('token');
          setAuthenticated(false);
          navigate(data.redirect); // Перенаправити за допомогою useNavigate
        } else {
          console.error('Login failed');
        }
      }      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleDropdownClose = () => setIsOpen(!isOpen);

  return (
    <div className="header-container">
      <div className="header-emblem">
        <Link to="/">eCOMMERS</Link>        
      </div>
      {/* <div className="header-person-icon-container">
        <button>
          <img src="/images/person.svg" alt="person-icon" />
        </button>
      </div> */}
      <div className="dropdown">
        <button onClick={toggleDropdown} className="dropdown-button">
          <img src="/images/person.svg" alt="person-icon" />
        </button>
        {isOpen && (
          <div className="dropdown-content" onClick={toggleDropdownClose}>
            <Link to="/cart" ><span>Basket</span></Link>
            <Link to="/orders"><span>Orders</span></Link>
            <p>Category</p>   
            <Link to="/Laptop"><span>Laptop</span></Link>
            <Link to="/Phone"><span>Phone</span></Link>
            <Link to="/Watch"><span>Watch</span></Link>
            <Link to="/TVs"><span>TVs</span></Link>            
          </div>
        )}
      </div>
      {authenticated ? (
        <div className='header-customer'>
          <div className='welcome-customer'>
            <p>Welcome, {user?.username}!</p>
          </div>
          {/* {authenticated ? (<p>authenticated</p>) :(<p>none</p>)} */}
          <button onClick={handleLogout}>Logout</button>  
          <Link to="/cart" className='cart-image-container'>
            <img src="/images/shopping.svg" alt="shopping-cart-icon" />
            <span className='cart-count'>{cartlenght}</span>
          </Link>
        </div>
      ) : (
        <div className='header-customer'>
          <div className='welcome-customer'>
            <p>Please sign in or register</p>
          </div>
          {/* {authenticated ? (<p>authenticated</p>) :(<p>none</p>)} */}
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      )}
    </div>
  )}

export default Header;

  // const cartItemCount = carts.reduce((total, cartItem) => total + cartItem.quantity, 0);

// const [user, setUser] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [cartID, setCartId] = useState(null);
  // const [carts, setCart] = useState([]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     // console.log('startet Home before fetch');
  //     try {        
  //       const authResponse = await fetch(`${SERVER_HOST}/check-auth`, {
  //         method: 'GET',
  //         credentials: 'include',
  //       });
    
  //       if (authResponse.ok) {
  //         const authData = await authResponse.json();
    
  //         if (authData.isAuthenticated) {
  //           // console.log('isAuthenticated --> true');
  //           const profileResponse = await fetch(`${SERVER_HOST}/profile`, {
  //             method: 'GET',
  //             credentials: 'include',
  //           });
  //           const profileData = await profileResponse.json();
  //           // console.log(profileData);
  //           setUser(profileData);
  //           setIsAuthenticated(true);
  //           setCartId(profileData.user_id);
  //           setAuthenticated(true);

  //         } else {
  //           setIsAuthenticated(false);
  //           setAuthenticated(false);
  //         }
  //       } else {
  //         console.log('користувач не автентифікований:');
  //         setIsAuthenticated(false);
  //         setAuthenticated(false);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setIsAuthenticated(false);
  //       setAuthenticated(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (cartID) {
  //       try {
  //         const response = await fetch(`${SERVER_HOST}/cart_items/${cartID}`);
  //         if(response.ok) {            
  //           const cartrespons = await response.json();
  //           // console.log('response: ', response);
  //           // console.log('cartrespons: ', cartrespons);
  //           // setCart(cartrespons);
  //           setCartLenght(cartrespons.length)
  //         }
  //         if(response.status === 404){
  //           const text = await response.text()  
  //           console.log('response: ', text);  
  //         }          
  //       } catch (error) {
  //         console.error('Error fetching product data:', error);
  //       }
  //     };      
  //   };

  //   fetchData();
  // }, [cartID, setCartLenght]);