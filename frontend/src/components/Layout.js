import React from "react";
import Header from "./Header";
import Footer from "./Footer";


const Layout = ({ children }) => {


  return (
    <div className="loyout">
      <Header/>
      <main className="main-container">
        {children}
      </main>
      <Footer />
    </div>
  )

}

export default Layout;