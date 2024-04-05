import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Categories from "./Categories";

const Layout = ({ children }) => {


  return (
    <div className="layout ">
      <Header/>
      
      <main className="main-container">
        <Categories/>
        <div className="children-container">
          {children}
        </div>        
      </main>
      {/* <Footer /> */}
    </div>
  )

}

export default Layout;