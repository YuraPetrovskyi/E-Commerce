import React from "react";
import { Link } from 'react-router-dom';
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
          <button>Click on me to complete your purchase</button>
        </Link>
        <Link to="/">
          <button>Home</button>
        </Link>       
      </div>      
    </Layout>
  )
}

export default OrderCreated;