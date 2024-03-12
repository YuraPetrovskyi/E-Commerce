import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();       
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('http://localhost:3000/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
      // console.log(response)
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error fetching checkAuthentication:', error);
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    // console.log('started handleLogin');
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({username, email, password }),
      });
      // console.log('finish registered fetch');
      if (response.ok) {
        try {
          const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });
          // console.log('finish login fetch');
          if (response.ok) {
            const data = await response.json();
            // console.log(data);
            if (data.redirect) {
              navigate(data.redirect); // Перенаправити за допомогою useNavigate
            } else {
              console.error('Login failed 4');
            }
          } else {
            console.error('Login failed 5');
          }
        } catch (error) {
          console.error('Error during login:', error);
        }
      } else {
        const errorMessage = await response.text(); // Отримати текст повідомлення з тіла відповіді
        setErrorMessage(errorMessage);
        // console.log(errorMessage);
        // console.error(`Login failed: ${errorMessage}`);
      }
    } catch (error) {
      setErrorMessage(error);
    }
  };

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
      <Link to="/">Home</Link>
    </div>
  );
};

export default Register;
