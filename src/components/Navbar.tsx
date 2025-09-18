import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, User, Menu, X, Moon, Sun, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useVideoStore } from '../stores/videoStore';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const { user, signOut } = useAuthStore();
  const { searchVideos, setSearchQuery } = useVideoStore();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput);
      searchVideos(searchInput);
      navigate('/search');
      setIsSearchOpen(false);
      setSearchInput('');
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
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400 transition-transform hover:scale-105"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="text-primary-700 dark:text-primary-300">Video</span>
            <span className="text-accent-500">Vault</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Explore
            </Link>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/upload" 
                  className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Upload size={18} />
                  <span>Upload</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <User size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                    <span>{user.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Profile
                    </Link>
                    <Link to="/my-videos" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      My Videos
                    </Link>
                    {user.is_admin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(!isSearchOpen);
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/explore" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/upload" 
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Upload size={18} />
                    <span>Upload Video</span>
                  </Link>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <Link 
                    to="/my-videos" 
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pl-6"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Videos
                  </Link>
                  {user.is_admin && (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pl-6"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/login" 
                    className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}

        {/* Search bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;