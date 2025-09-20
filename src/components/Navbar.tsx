import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Upload, User, Menu, X, Moon, Sun, LogOut, Play } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useVideoStore } from '../stores/videoStore';
import ThemeToggle from './ThemeToggle';
import { generateRandomTagline } from '../utils/slogans';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [tagline, setTagline] = useState('');
  const { user, signOut } = useAuthStore();
  const { searchVideos, setSearchQuery, clearSearch, searchQuery } = useVideoStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Generate random tagline on component mount
  useEffect(() => {
    setTagline(generateRandomTagline());
  }, []);

  // Update local search input when searchQuery changes
  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchInput(searchQuery);
    } else {
      // Clear search input when not on search page
      setSearchInput('');
    }
  }, [searchQuery, location.pathname]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput);
      await searchVideos(searchInput);
      navigate('/search');
      setIsSearchOpen(false);
    } else {
      clearSearch();
      navigate('/explore');
      setIsSearchOpen(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="border-b-4 border-brutal-black sticky top-0 z-50 dark:border-brutal-dark-brown" style={{ backgroundColor: 'rgb(0 4 10 / 50%)' }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 text-2xl font-black text-white brutal-hover"
            onClick={() => {
              setIsMenuOpen(false);
              clearSearch();
              setSearchInput('');
            }}
          >
            <div className="w-10 h-10 bg-white border-3 border-brutal-black flex items-center justify-center dark:border-brutal-dark-brown" style={{ backgroundColor: '#FFA500' }}>
              <Play size={20} className="text-white ml-1" fill="currentColor" />
            </div>
            <span className="font-mono uppercase tracking-wider">
              DELI<span style={{ color: '#FFA500' }}>TUBE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-white hover:text-orange-400 font-bold uppercase tracking-wide px-4 py-2 border-2 border-transparent hover:border-white transition-all duration-100"
              onClick={() => {
                clearSearch();
                setSearchInput('');
              }}
            >
              HOME
            </Link>
            <Link 
              to="/explore" 
              className="text-white hover:text-orange-400 font-bold uppercase tracking-wide px-4 py-2 border-2 border-transparent hover:border-white transition-all duration-100"
              onClick={() => {
                clearSearch();
                setSearchInput('');
              }}
            >
              EXPLORE
            </Link>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white hover:text-orange-400 focus:outline-none p-2 border-2 border-transparent hover:border-white transition-all duration-100"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/upload" 
                  className="btn-brutal px-4 py-2"
                >
                  <Upload size={18} className="inline mr-2" />
                  UPLOAD
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-white hover:text-orange-400 font-bold px-3 py-2 border-2 border-transparent hover:border-white transition-all duration-100">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-8 h-8 border-2 border-white" />
                    ) : (
                      <div className="w-8 h-8 bg-white border-2 border-white flex items-center justify-center">
                        <User size={16} className="text-brutal-black" />
                      </div>
                    )}
                    <span className="uppercase font-mono">{user.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 card-brutal py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-brutal-black font-bold uppercase hover:bg-primary-100 transition-colors dark:text-white dark:hover:bg-primary-900">
                      PROFILE
                    </Link>
                    <Link to="/my-videos" className="block px-4 py-2 text-brutal-black font-bold uppercase hover:bg-primary-100 transition-colors dark:text-white dark:hover:bg-primary-900">
                      MY VIDEOS
                    </Link>
                    {user.is_admin && (
                      <Link to="/admin" className="block px-4 py-2 text-brutal-black font-bold uppercase hover:bg-primary-100 transition-colors dark:text-white dark:hover:bg-primary-900">
                        ADMIN
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-accent-600 font-bold uppercase hover:bg-accent-50 transition-colors dark:hover:bg-accent-900"
                    >
                      SIGN OUT
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-white hover:text-orange-400 font-bold uppercase tracking-wide px-4 py-2 border-2 border-transparent hover:border-white transition-all duration-100"
                >
                  LOGIN
                </Link>
                <Link 
                  to="/register" 
                  className="btn-brutal px-4 py-2"
                >
                  SIGN UP
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(!isSearchOpen);
              }}
              className="text-white hover:text-orange-400 p-2 border-2 border-transparent hover:border-white transition-all duration-100"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <ThemeToggle />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-white hover:text-orange-400 p-2 border-2 border-transparent hover:border-white transition-all duration-100"
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-main z-40 border-t-4 border-brutal-black dark:bg-dark-main dark:border-brutal-dark-brown">
            <nav className="h-full overflow-y-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="text-brutal-black hover:text-primary-600 font-bold uppercase tracking-wide px-4 py-3 border-2 border-transparent hover:border-brutal-black transition-all duration-100 dark:text-white dark:hover:border-brutal-dark-brown"
                  onClick={() => {
                    setIsMenuOpen(false);
                    clearSearch();
                    setSearchInput('');
                  }}
                >
                  HOME
                </Link>
                <Link 
                  to="/explore" 
                  className="text-brutal-black hover:text-primary-600 font-bold uppercase tracking-wide px-4 py-3 border-2 border-transparent hover:border-brutal-black transition-all duration-100 dark:text-white dark:hover:border-brutal-dark-brown"
                  onClick={() => {
                    setIsMenuOpen(false);
                    clearSearch();
                    setSearchInput('');
                  }}
                >
                  EXPLORE
                </Link>
                {user ? (
                  <>
                    <Link 
                      to="/upload" 
                      className="btn-brutal px-4 py-3 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Upload size={18} className="inline mr-2" />
                      UPLOAD VIDEO
                    </Link>
                    <Link 
                      to="/profile" 
                      className="text-brutal-black hover:text-primary-600 font-bold uppercase tracking-wide px-4 py-3 border-2 border-transparent hover:border-brutal-black transition-all duration-100 dark:text-white dark:hover:border-brutal-dark-brown"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={18} className="inline mr-2" />
                      PROFILE
                    </Link>
                    <Link 
                      to="/my-videos" 
                      className="text-brutal-black hover:text-primary-600 font-bold uppercase tracking-wide px-4 py-3 border-2 border-transparent hover:border-brutal-black transition-all duration-100 dark:text-white dark:hover:border-brutal-dark-brown"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      MY VIDEOS
                    </Link>
                    {user.is_admin && (
                      <Link 
                        to="/admin" 
                        className="text-brutal-black hover:text-primary-600 font-bold uppercase tracking-wide px-4 py-3 border-2 border-transparent hover:border-brutal-black transition-all duration-100 dark:text-white dark:hover:border-brutal-dark-brown"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ADMIN PANEL
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-accent-600 hover:text-accent-700 font-bold uppercase tracking-wide px-4 py-3 border-2 border-transparent hover:border-accent-600 transition-all duration-100 text-left"
                    >
                      <LogOut size={18} className="inline mr-2" />
                      SIGN OUT
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link 
                      to="/login" 
                      className="btn-brutal-secondary px-4 py-3 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      LOGIN
                    </Link>
                    <Link 
                      to="/register" 
                      className="btn-brutal px-4 py-3 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      SIGN UP
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}

        {/* Search bar */}
        {isSearchOpen && (
          <div className="py-4 border-t-2 border-white animate-fadeIn px-4 sm:px-0">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-grow input-brutal px-3 py-2 sm:px-4 sm:py-3 font-mono uppercase placeholder:text-brutal-gray text-sm sm:text-base"
                autoFocus
              />
              <button
                type="submit"
                className="btn-brutal-primary px-4 py-2 sm:px-6 sm:py-3 ml-2"
              >
                <Search size={16} className="sm:w-5 sm:h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;