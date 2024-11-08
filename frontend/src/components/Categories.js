import React from 'react';
import { Link } from 'react-router-dom';




const Categories = () => {


  return (
    <div className='categories-container'>
      <h3>Category</h3>      
      <Link to={`/Laptop`} className='categories-link-container'>
        <div className='categories-img-container'>
          <img src={`${process.env.PUBLIC_URL}/images/computing.svg`} alt="categories-computing-icon" /> 
        </div>        
        <p>Laptops</p>
      </Link>
      <Link to={`/Phone`} className='categories-link-container'>
        <div className='categories-img-container'>
          <img src={`${process.env.PUBLIC_URL}/images/mobile.svg`} alt="categories-computing-icon" />
        </div>
        <p>Phones</p>
      </Link>
      <Link to={`/Watch`} className='categories-link-container'>
        <div className='categories-img-container'>
          <img src={`${process.env.PUBLIC_URL}/images/smart.svg`} alt="categories-computing-icon" />
        </div>
        <p>Watches</p>
      </Link>
      <Link to={`/TVs`} className='categories-link-container'>
        <div className='categories-img-container'>
          <img src={`${process.env.PUBLIC_URL}/images/tv.svg`} alt="categories-computing-icon" />
        </div>
        <p>TVs</p>
      </Link> 
      <h3>Account</h3>
      <Link to={`/cart`} className='categories-link-container categories-account'>
        <div className='categories-img-container'>
          <img src={`${process.env.PUBLIC_URL}/images/shopping.svg`} alt="categories-computing-icon" />
        </div>        
        <p>Basket</p>
      </Link>
      <Link to={`/orders`} className='categories-link-container categories-account'>
        <div className='categories-img-container'>
          <img src={`${process.env.PUBLIC_URL}/images/list.svg`} alt="categories-computing-icon" />
        </div>
        <p>Orders</p>
      </Link>
    </div>
  );
};

export default Categories;
