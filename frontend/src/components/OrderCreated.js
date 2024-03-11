import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './OrderCreated.css';


const OrderCreated = () => {

  return (
    <Layout>
      <div className="order-created-container">
        <h2> 
          Congratulations, your order has been successfully created!          
        </h2>
        <Link to="/orders">
          <div className="order-created">
            <h3>Click on me to complete your purchase</h3>
          </div>          
        </Link>
        <Link to="/">
          <button>Home</button>
        </Link>       
      </div>      
    </Layout>
  )
}

export default OrderCreated;