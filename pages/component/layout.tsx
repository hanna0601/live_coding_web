import React from 'react';
import Navbar from '../Navbar'; // Assuming you have a Navbar component

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
