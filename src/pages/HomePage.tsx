import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl py-12 md:py-16 px-8 text-white">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Share Your Videos With The World
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Upload, share, and discover amazing video content from creators around the globe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/upload"
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 focus:outline-none"
              >
                Upload Your Video
              </Link>
            ) : (
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 focus:outline-none"
              >
                Create Account
              </Link>
            )}
            <Link
              to="/explore"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium transition-colors focus:ring-2 focus:ring-white focus:outline-none"
            >
              Explore Videos
            </Link>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      </section>

      {/* Recent Videos Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Videos</h2>
          <Link
            to="/explore"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <VideoGrid
            videos={recentVideos}
            emptyMessage="No videos have been uploaded yet. Be the first to share a video!"
          />
        )}
      </section>

      {/* Features Section */}
      <section className="py-12 rounded-xl bg-gray-100 dark:bg-gray-800 px-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Why Choose VideoVault?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
            <div className="w-16 h-16 flex items-center justify-center bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure Sharing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your content is safe with us. Control who sees your videos with flexible privacy settings.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
            <div className="w-16 h-16 flex items-center justify-center bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enjoy fast uploads and smooth playback with our optimized streaming technology.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
            <div className="w-16 h-16 flex items-center justify-center bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Engage with Community</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with creators and viewers through comments and likes on videos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="text-center py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to join our community?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Create an account today and start sharing your videos with the world.
            It's free and only takes a minute to get started.
          </p>
          <Link
            to="/register"
            className="inline-block bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Get Started Now
          </Link>
        </section>
      )}
    </div>
  );
};

export default HomePage;