import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brutal-black border-t-4 border-primary-600 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-xl font-black text-white brutal-hover">
            <div className="w-8 h-8 border-3 border-white flex items-center justify-center" style={{ backgroundColor: '#FFA500' }}>
              <Play size={16} className="text-white ml-1" fill="currentColor" />
            </div>
            <span className="font-mono uppercase tracking-wider">
              DELI<span style={{ color: '#FFA500' }}>TUBE</span>
            </span>
          </Link>
          <p className="text-white font-mono text-sm uppercase tracking-wide">
            © {new Date().getFullYear()} DELITUBE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;