import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { generateRandomTagline } from '../utils/slogans';

const Footer = () => {
  const [tagline, setTagline] = React.useState('');
  
  React.useEffect(() => {
    setTagline(generateRandomTagline());
  }, []);

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
          <p className="text-white font-mono text-sm uppercase tracking-wide flex items-center gap-2">
            © {new Date().getFullYear()} DELITUBE
            <span className="text-primary-400">•</span>
            <span className="text-xs">{tagline.toUpperCase()}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;