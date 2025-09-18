import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileVideo, Image } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';

const UploadPage = () => {
  const { user } = useAuthStore();
  const { uploadVideo, loading } = useVideoStore();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type (only accept video files)
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }
    
    // Validate file size (limit to 100MB for this example)
    if (file.size > 100 * 1024 * 1024) {
      setError('Video file is too large. Please select a file under 100MB');
      return;
    }
    
    setVideoFile(file);
    setError(null);
    
    // Create a preview URL for the video
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type (only accept image files)
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for the thumbnail');
      return;
    }
    
    setThumbnailFile(file);
    setError(null);
    
    // Create a preview URL for the thumbnail
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }
    
    if (!thumbnailFile) {
      setError('Please select a thumbnail image');
      return;
    }
    
    try {
      await uploadVideo(videoFile, thumbnailFile, title, description);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    }
  };
  
  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };
  
  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Video</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Video and thumbnail upload section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Video File <span className="text-red-500">*</span>
            </label>
            
            {videoPreview ? (
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <video
                  src={videoPreview}
                  className="w-full h-full object-contain"
                  controls
                />
                <button
                  type="button"
                  onClick={clearVideo}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors aspect-video"
              >
                <FileVideo size={48} className="text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Drag and drop or click to select a video
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  MP4, WebM or MOV (max. 100MB)
                </p>
              </div>
            )}
            
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoChange}
              className="hidden"
              accept="video/*"
            />
          </div>
          
          {/* Thumbnail upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Thumbnail <span className="text-red-500">*</span>
            </label>
            
            {thumbnailPreview ? (
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearThumbnail}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors aspect-video"
              >
                <Image size={48} className="text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Upload a thumbnail image
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  JPG, PNG or GIF (16:9 ratio recommended)
                </p>
              </div>
            )}
            
            <input
              type="file"
              ref={thumbnailInputRef}
              onChange={handleThumbnailChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>
        
        {/* Title and description */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter a title for your video"
              maxLength={100}
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white resize-none"
              placeholder="Describe your video (optional)"
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                  <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Upload Video</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;