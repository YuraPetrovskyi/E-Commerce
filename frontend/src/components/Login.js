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

  const { setAuthenticated } = useContext(CartContext);
  const { setUser, setUserId, setCartId } = useContext(CartContext);

  const navigate = useNavigate();  

  const handleLogin = async (e) => {
    e.preventDefault();
    // console.log('started handleLogin');
    // alert('started handleLogin')
    try {
      const response = await fetch(`${SERVER_HOST}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      // console.log('finish fetch');
      // alert('finish fetch')

      if (response.ok) {
        const data = await response.json();
        // localStorage.setItem('token', data.token);
        setAuthenticated(true);
        // console.log('token', data.token);
        if (data.redirect) {
          // console.log(data)
          setAuthenticated(true);
          setUser(data.user);
          setUserId(data.user.user_id);
          setCartId(data.user.user_id);
          navigate('/');
          // navigate(data.redirect); // Перенаправити за допомогою useNavigate
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
  // console.log('isAuthenticated', authenticated);

  const handleLoginJWT = async (e) => {
    e.preventDefault();
    // console.log('started handleLoginJWT', email, password);
    try {
      const response = await fetch(`${SERVER_HOST}/loginjwt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      // console.log('finish fetch handleLoginJWT');
      if (response.ok) {
        // console.log('response.ok');
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setAuthenticated(true);
        setUser(data.user);
        setUserId(data.user.user_id);
        setCartId(data.user.user_id);
        // console.log('data', data);
        // console.log('token', data.token);
        navigate('/');        
      } else {

        console.error('Login failed 2');
        const errorMessage = await response.json(); // Отримати текст повідомлення з тіла відповіді
        // console.log(errorMessage.message);
        // setErrorMessage(errorMessage.error);
        setErrorMessage(errorMessage.message);

      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  return (
    <div className="login-container">
      <h2>Sign in</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="button" onClick={handleLoginJWT}>Sign in (with token)</button>
        <button type="button" onClick={handleLogin}>Sign in (with passport)</button>
      </form>  
      
      
      <div className="login-link-container">
        <p>or</p>
        <Link to={`${SERVER_HOST}/auth/google`}><button>Sign in with Google</button></Link>
        
        {/* <Link to={`${SERVER_HOST}/auth/google`}>Sign in with Google</Link> */}
      </div>
      <Link to="/">Home</Link>
      <p>
        Not a member? <Link to="/register">Create an account</Link>.
      </p>
    </div>
  );
};

export default Login;
