import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileVideo, Image, Square } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';
import HashtagInput from '../components/HashtagInput';

const UploadPage = () => {
  const { user } = useAuthStore();
  const { uploadVideo, loading } = useVideoStore();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
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
      setError('PLEASE SELECT A VALID VIDEO FILE');
      return;
    }
    
    // Validate file size (limit to 100MB for this example)
    if (file.size > 100 * 1024 * 1024) {
      setError('VIDEO FILE IS TOO LARGE. PLEASE SELECT A FILE UNDER 100MB');
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
      setError('PLEASE SELECT A VALID IMAGE FILE FOR THE THUMBNAIL');
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
      setError('PLEASE ENTER A TITLE');
      return;
    }
    
    if (!videoFile) {
      setError('PLEASE SELECT A VIDEO FILE');
      return;
    }
    
    if (!thumbnailFile) {
      setError('PLEASE SELECT A THUMBNAIL IMAGE');
      return;
    }
    
    try {
      await uploadVideo(videoFile, thumbnailFile, title, description, hashtags);
      navigate('/');
    } catch (err: any) {
      setError(err.message?.toUpperCase() || 'AN ERROR OCCURRED DURING UPLOAD');
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
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="card-brutal p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-primary-400 border-3 border-brutal-black flex items-center justify-center dark:border-brutal-dark-brown">
            <Upload size={32} className="text-brutal-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brutal-black font-mono uppercase mb-2 dark:text-white">
              UPLOAD VIDEO
            </h1>
            <p className="text-brutal-gray font-bold uppercase tracking-wide dark:text-gray-400">
              SHARE YOUR VIDEO WITH DOODLETOWN
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-accent-500 border-3 border-brutal-black text-white font-mono font-bold text-sm dark:border-brutal-dark-brown">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Video and thumbnail upload section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Video upload */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-brutal-black font-mono uppercase dark:text-white">
              VIDEO FILE <span className="text-accent-600">*</span>
            </label>
            
            {videoPreview ? (
              <div className="relative aspect-video card-brutal overflow-hidden">
                <video
                  src={videoPreview}
                  className="w-full h-full object-contain bg-brutal-black"
                  controls
                />
                <button
                  type="button"
                  onClick={clearVideo}
                  className="absolute top-4 right-4 w-10 h-10 bg-accent-600 border-3 border-white flex items-center justify-center brutal-hover"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => videoInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files[0]) {
                    const file = files[0];
                    if (file.type.startsWith('video/')) {
                      const event = { target: { files: [file] } } as any;
                      handleVideoChange(event);
                    } else {
                      setError('PLEASE DROP A VALID VIDEO FILE');
                    }
                  }
                }}
                className="border-4 border-dashed border-brutal-black bg-white p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-50 transition-colors aspect-video brutal-hover dark:border-brutal-dark-brown dark:bg-brutal-cream dark:hover:bg-primary-100"
              >
                <div className="w-16 h-16 bg-primary-400 border-3 border-brutal-black flex items-center justify-center mb-4 dark:border-brutal-dark-brown">
                  <FileVideo size={24} className="text-brutal-black" />
                </div>
                <p className="text-brutal-black text-center font-black font-mono uppercase mb-2">
                  DRAG AND DROP OR CLICK TO SELECT A VIDEO
                </p>
                <p className="text-xs text-brutal-gray font-bold uppercase">
                  MP4, WEBM OR MOV (MAX. 100MB)
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
          <div className="space-y-4">
            <label className="block text-sm font-black text-brutal-black font-mono uppercase dark:text-white">
              THUMBNAIL <span className="text-accent-600">*</span>
            </label>
            
            {thumbnailPreview ? (
              <div className="relative aspect-video card-brutal overflow-hidden">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearThumbnail}
                  className="absolute top-4 right-4 w-10 h-10 bg-accent-600 border-3 border-white flex items-center justify-center brutal-hover"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files[0]) {
                    const file = files[0];
                    if (file.type.startsWith('image/')) {
                      const event = { target: { files: [file] } } as any;
                      handleThumbnailChange(event);
                    } else {
                      setError('PLEASE DROP A VALID IMAGE FILE FOR THE THUMBNAIL');
                    }
                  }
                }}
                className="border-4 border-dashed border-brutal-black bg-white p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-50 transition-colors aspect-video brutal-hover dark:border-brutal-dark-brown dark:bg-brutal-cream dark:hover:bg-primary-100"
              >
                <div className="w-16 h-16 bg-secondary-600 border-3 border-brutal-black flex items-center justify-center mb-4 dark:border-brutal-dark-brown">
                  <Image size={24} className="text-white" />
                </div>
                <p className="text-brutal-black text-center font-black font-mono uppercase mb-2">
                  UPLOAD A THUMBNAIL IMAGE
                </p>
                <p className="text-xs text-brutal-gray font-bold uppercase">
                  JPG, PNG OR GIF (16:9 RATIO RECOMMENDED)
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
        
        {/* Title, description, and hashtags */}
        <div className="card-brutal p-8 space-y-6">
          <h3 className="text-xl font-black text-brutal-black font-mono uppercase mb-6 dark:text-white">
            VIDEO DETAILS
          </h3>
          
          <div>
            <label htmlFor="title" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase dark:text-white">
              TITLE <span className="text-accent-600">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-brutal w-full px-4 py-3 font-mono placeholder:text-brutal-gray"
              placeholder="Enter a title for your video"
              maxLength={100}
              required
            />
            <p className="text-xs text-brutal-gray font-bold mt-1 uppercase">
              {title.length}/100 CHARACTERS
            </p>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase dark:text-white">
              DESCRIPTION
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-brutal w-full px-4 py-3 font-mono placeholder:text-brutal-gray resize-none"
              placeholder="Describe your video (optional)"
            ></textarea>
          </div>
          
          {/* Hashtags */}
          <HashtagInput
            selectedHashtags={hashtags}
            onHashtagsChange={setHashtags}
            maxHashtags={3}
          />
        </div>
        
        {/* Submit Section */}
        <div className="card-brutal p-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center dark:border-brutal-dark-brown">
                <Square size={16} className="text-white" fill="currentColor" />
              </div>
              <div>
                <p className="font-black text-brutal-black font-mono uppercase text-sm dark:text-white">
                  READY TO UPLOAD?
                </p>
                <p className="text-xs text-brutal-gray font-bold uppercase">
                  MAKE SURE ALL FIELDS ARE FILLED
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-brutal-secondary px-6 py-3"
              >
                CANCEL
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-brutal px-8 py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin mr-3"></div>
                    UPLOADING...
                  </span>
                ) : (
                  <>
                    <Upload size={18} className="inline mr-2" />
                    UPLOAD VIDEO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;