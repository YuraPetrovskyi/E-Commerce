import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { CartContext } from './CartContext';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;


const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { authenticated, setAuthenticated } = useContext(CartContext);
  const { setUser, setUserId, setCartId } = useContext(CartContext);

  const navigate = useNavigate();  

  const handleRegister = async (e) => {
    e.preventDefault();
    // console.log('started handleLogin');
    try {
      const response = await fetch(`${SERVER_HOST}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({username, email, password }),
      });
      console.log('finish registered fetch');
      if (response.ok) {
        try {
          const response = await fetch(`${SERVER_HOST}/loginjwt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });
          console.log('finish login fetch');
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
      } else {
        const errorMessage = await response.text(); // Отримати текст повідомлення з тіла відповіді
        setErrorMessage(errorMessage);
        console.log(errorMessage);
        console.error(`Login failed: ${errorMessage}`);
      }
    } catch (error) {
      setErrorMessage(error);
    }
  };
  
  console.log('isAuthenticated', authenticated);

  return (
    <div className="register-container">
      <h2>Register</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleRegister}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <label>User name:</label>
        <input type="name" value={username} onChange={(e) => setUsername(e.target.value)} required />
        
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit">Register</button>
      </form>

      <p>
        Do you have an account? <Link to="/login">Login here</Link>.
      </p>
      <Link className='home' to="/">Home</Link>
    </div>
  );
};

export default Register;


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