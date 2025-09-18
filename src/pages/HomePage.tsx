import React, { useEffect } from 'react';
import { ArrowRight, Zap, Shield, Users, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';
import { generateRandomTagline, generateRandomHeroText } from '../utils/slogans';

const HomePage = () => {
  const { recentVideos, loading, fetchRecentVideos } = useVideoStore();
  const { user } = useAuthStore();
  
  // Generate random text on component mount
  const [tagline, setTagline] = React.useState('');
  const [heroText, setHeroText] = React.useState({ number: '#1', leading: 'Leading' });
  
  React.useEffect(() => {
    setTagline(generateRandomTagline());
    setHeroText(generateRandomHeroText());
  }, []);

  useEffect(() => {
    fetchRecentVideos(8);
  }, [fetchRecentVideos]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-primary-600 border-4 border-brutal-black shadow-brutal-lg p-4 sm:p-6 md:p-8 lg:p-12 dark:border-brutal-dark-brown dark:shadow-brutal-dark-lg">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-white border-3 border-brutal-black px-3 py-2 sm:px-6 sm:py-3 mb-6 sm:mb-8 shadow-brutal dark:border-brutal-dark-brown dark:shadow-brutal-dark">
            <Square size={12} className="sm:w-4 sm:h-4 text-brutal-black" fill="currentColor" />
            <span className="font-mono font-bold uppercase tracking-wide text-brutal-black text-xs sm:text-sm">{tagline.toUpperCase()}</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-tight text-brutal-black font-mono uppercase">
            <span className="text-brutal-black">DOODLETOWN'S {heroText.number}</span>
            <span className="block text-white mt-1 sm:mt-2">
              {heroText.leading.toUpperCase()} WEBTUBE
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto leading-relaxed text-brutal-black font-bold px-4 sm:px-0">
            DELI-KUN'S PREMIERE STREAMING AND VIDEO SHARING SERVICE, RATED BEST ONLY OPTION ANNUALLY!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 sm:px-0">
            {user ? (
              <Link
                to="/upload"
                className="btn-brutal px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
              >
                <Square size={16} className="sm:w-5 sm:h-5 inline mr-2 sm:mr-3" />
                UPLOAD NOW
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-brutal px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
              >
                <Square size={16} className="sm:w-5 sm:h-5 inline mr-2 sm:mr-3" />
                JOIN NOW
              </Link>
            )}
            <Link
              to="/explore"
              className="btn-brutal-secondary px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
            >
              EXPLORE VIDEOS
              <ArrowRight size={16} className="sm:w-5 sm:h-5 inline ml-2 sm:ml-3" />
            </Link>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-secondary-400 border-2 sm:border-3 border-brutal-black dark:border-brutal-dark-brown"></div>
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-white border-2 sm:border-3 border-brutal-black dark:border-brutal-dark-brown"></div>
        <div className="hidden sm:block absolute top-1/2 right-1/4 w-6 h-6 lg:w-8 lg:h-8 bg-accent-500 border-2 border-brutal-black dark:border-brutal-dark-brown"></div>
      </section>

      {/* Recent Videos Section */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-brutal-black dark:text-white mb-2 font-mono uppercase">
              RECENT VIDEOS
            </h2>
            <p className="text-brutal-gray dark:text-gray-400 font-bold uppercase tracking-wide text-sm sm:text-base">
              FRESH CONTENT FROM OUR CREATORS
            </p>
          </div>
          <Link
            to="/explore"
            className="btn-brutal-secondary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
          >
            VIEW ALL
            <ArrowRight size={14} className="sm:w-4 sm:h-4 inline ml-2" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-brutal-black bg-primary-400 animate-spin dark:border-brutal-dark-brown"></div>
          </div>
        ) : (
          <VideoGrid
            videos={recentVideos}
            emptyMessage="NO VIDEOS YET. BE THE FIRST TO UPLOAD!"
          />
        )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="text-center py-8 sm:py-12 lg:py-16 bg-brutal-black border-4 border-primary-400 shadow-brutal-orange-lg dark:bg-brutal-dark-brown dark:border-primary-500">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-4 sm:mb-6 text-white font-mono uppercase">
              READY TO JOIN DOODLETOWN?
            </h2>
            <p className="text-sm sm:text-base lg:text-xl mb-6 sm:mb-8 text-white font-bold leading-relaxed">
              CREATE YOUR ACCOUNT AND START SHARING VIDEO CONTENT TODAY.
              NO BULLSHIT. NO FAKE PROMISES. JUST REAL VIDEO SHARING.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 sm:gap-3 bg-success-600 text-white border-3 border-white px-6 py-3 sm:px-8 sm:py-4 font-black uppercase tracking-wide shadow-brutal hover:bg-success-700 transition-all duration-100 brutal-hover text-sm sm:text-base"
            >
              <Square size={16} className="sm:w-5 sm:h-5" />
              START NOW
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;