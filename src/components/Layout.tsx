import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-main dark:bg-dark-main text-brutal-black dark:text-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <Toaster 
        position="top-right" 
        richColors 
        toastOptions={{
          style: {
            border: '3px solid #000000',
            borderRadius: '0',
            background: '#ffffff',
            color: '#000000',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            boxShadow: '4px 4px 0px 0px #000000',
          },
        }}
      />
    </div>
  );
};

export default Layout;