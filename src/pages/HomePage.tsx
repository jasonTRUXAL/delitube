import React, { useEffect } from 'react';
import { ArrowRight, Zap, Shield, Users, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';

const HomePage = () => {
  const { recentVideos, loading, fetchRecentVideos } = useVideoStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRecentVideos(8);
  }, [fetchRecentVideos]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-primary-600 border-4 border-brutal-black shadow-brutal-lg p-8 md:p-12 dark:border-brutal-dark-brown dark:shadow-brutal-dark-lg">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white border-3 border-brutal-black px-6 py-3 mb-8 shadow-brutal dark:border-brutal-dark-brown dark:shadow-brutal-dark">
            <Square size={16} className="text-brutal-black" fill="currentColor" />
            <span className="font-mono font-bold uppercase tracking-wide text-brutal-black">YIKES AND DESCRIBE</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight text-brutal-black font-mono uppercase">
            <span className="text-brutal-black">DOODLETOWN'S #1</span>
            <span className="block text-white mt-2">
              LEADING WEBTUBE
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed text-brutal-black font-bold">
            DELI-KUN'S PREMIERE STREAMING AND VIDEO SHARING SERVICE, RATED BEST ONLY OPTION ANNUALLY!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {user ? (
              <Link
                to="/upload"
                className="btn-brutal px-8 py-4 text-lg"
              >
                <Square size={20} className="inline mr-3" />
                UPLOAD NOW
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-brutal px-8 py-4 text-lg"
              >
                <Square size={20} className="inline mr-3" />
                JOIN NOW
              </Link>
            )}
            <Link
              to="/explore"
              className="btn-brutal-secondary px-8 py-4 text-lg"
            >
              EXPLORE VIDEOS
              <ArrowRight size={20} className="inline ml-3" />
            </Link>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-secondary-400 border-3 border-brutal-black dark:border-brutal-dark-brown"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white border-3 border-brutal-black dark:border-brutal-dark-brown"></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-accent-500 border-2 border-brutal-black dark:border-brutal-dark-brown"></div>
      </section>

      {/* Recent Videos Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-brutal-black dark:text-white mb-2 font-mono uppercase">
              RECENT VIDEOS
            </h2>
            <p className="text-brutal-gray dark:text-gray-400 font-bold uppercase tracking-wide">
              FRESH CONTENT FROM OUR CREATORS
            </p>
          </div>
          <Link
            to="/explore"
            className="btn-brutal-secondary px-6 py-3"
          >
            VIEW ALL
            <ArrowRight size={16} className="inline ml-2" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-brutal-black bg-primary-400 animate-spin dark:border-brutal-dark-brown"></div>
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
        <section className="text-center py-16 bg-brutal-black border-4 border-primary-400 shadow-brutal-orange-lg dark:bg-brutal-dark-brown dark:border-primary-500">
          <div className="max-w-3xl mx-auto px-8">
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-white font-mono uppercase">
              READY TO JOIN DOODLETOWN?
            </h2>
            <p className="text-xl mb-8 text-white font-bold leading-relaxed">
              CREATE YOUR ACCOUNT AND START SHARING VIDEO CONTENT TODAY.
              NO BULLSHIT. NO FAKE PROMISES. JUST REAL VIDEO SHARING.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-success-600 text-white border-3 border-white px-8 py-4 font-black uppercase tracking-wide shadow-brutal hover:bg-success-700 transition-all duration-100 brutal-hover"
            >
              <Square size={20} />
              START NOW
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;