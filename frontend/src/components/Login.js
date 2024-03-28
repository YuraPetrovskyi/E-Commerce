import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { CartContext } from './CartContext';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // const [isAuthenticated] = useState(false);

  const { authenticated, setAuthenticated } = useContext(CartContext);
  const { setUser, setUserId, setCartId } = useContext(CartContext);

  const navigate = useNavigate();  

  const handleLogin = async () => {
    // e.preventDefault();
    console.log('started handleLogin');
    try {
      const response = await fetch(`${SERVER_HOST}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      console.log('finish fetch');
      if (response.ok) {
        const data = await response.json();
        // localStorage.setItem('token', data.token);
        setAuthenticated(true);
        
        console.log('data', data);
        // console.log('token', data.token);
        if (data.redirect) {
          navigate(data.redirect); // Перенаправити за допомогою useNavigate
        } else {
          console.error('Login failed 1');
        }
      } else {
        console.error('Login failed 2');
        const errorMessage = await response.json(); // Отримати текст повідомлення з тіла відповіді
        setErrorMessage(errorMessage.error);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  console.log('isAuthenticated', authenticated);

  const handleLoginJWT = async (e) => {
    e.preventDefault();
    console.log('started handleLoginJWT', email, password);
    try {
      const response = await fetch(`${SERVER_HOST}/loginjwt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      console.log('finish fetch');
      if (response.ok) {
        console.log('response.ok');
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setAuthenticated(true);
        setUser(data.user);
        setUserId(data.user.user_id);
        setCartId(data.user.user_id);
        console.log('data', data);
        console.log('token', data.token);
        navigate('/');        
      } else {
        console.error('Login failed 2');
        const errorMessage = await response.json(); // Отримати текст повідомлення з тіла відповіді
        console.log(errorMessage.message);
        setErrorMessage(errorMessage.error);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }
  return (
    <div className="login-container">
      <h2>Login</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleLoginJWT}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit">Login</button>
      </form>
      {/* <button onClick={handleLoginJWT}>Login JWT</button> */}
      <p>
        Don't have an account? <Link to="/register">Register here</Link>.
      </p>
      
      <div className="login-link-container">
        <Link to="/">Home</Link>
        <Link to={`${SERVER_HOST}/auth/google`}>Login with Google</Link>
        {/* <h2>Hey there!</h2> */}
        {/* <p>You'll be redirected to Google to login to your account!</p> */}
        {/* <br/>
        <a href="http://localhost:3000/auth/facebook" className="button">Login with Facebook</a> */}
      </div>
    </div>
  );
};

export default Login;

// useEffect(() => {
  //   console.log('checkAuthentication()')

  //   checkAuthentication();       
  // }, []);
  
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     console.log('navigate("/")')
  //     navigate('/');
  //   }
  // }, [isAuthenticated, navigate]);

  // const checkAuthentication = async () => {
  //   try {
  //     const response = await fetch(`${SERVER_HOST}/check-auth`, {
  //       method: 'GET',
  //       credentials: 'include',
  //     });
  //     console.log(response)
  //     if (response.ok) {
  //       setIsAuthenticated(true);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching checkAuthentication:', error);
  //   }
  // }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     console.log('startet Home before fitch')
  //     console.log(isAuthenticated)
  //     try {        
  //       const authResponse = await fetch('http://localhost:3000/check-auth', {
  //         method: 'GET',
  //         credentials: 'include',
  //       });
  //       const authData = await authResponse.json();

  //       if (authData.isAuthenticated) {
  //         console.log('isAuthenticated --> true')
  //         // Якщо користувач аутентифікований, зробимо запит для отримання інформації про користувача
  //         const profileResponse = await fetch('http://localhost:3000/profile', {
  //           method: 'GET',
  //           credentials: 'include',
  //         });
  //         const profileData = await profileResponse.json();
  //         setUser(profileData);
  //         setIsAuthenticated(true);
  //       } else {
  //         setIsAuthenticated(false);
  //       }
  //     } catch (error) {
  //       console.log('користувач не автентифікований:')
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);