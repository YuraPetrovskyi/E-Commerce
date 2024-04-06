import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import Home from './components/Home';
import Register from './components/Register';
import Products from './components/Products';
import ProductDetail from './components/ProductsDetail';
import Cart from './components/Cart';
import Orders from './components/Orders';
import OrderItem from './components/OrderItem';
import Checkout from './components/checkout';
import Canceled from './components/Canceled';
import Success from './components/Success';
import OrderCreated from './components/OrderCreated';
// import Welcome from './components/Welcome';

import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/:category" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:product_id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order_items/:order_id" element={<OrderItem />} />
        <Route path='/checkout/:order_id' element={<Checkout />} />
        <Route path='/canceled' element={<Canceled />} />
        {/* <Route path='/success' element={<Success />} /> */}
        <Route path='/success/:order_id' element={<Success />} />
        <Route path='/order_created' element={<OrderCreated />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;