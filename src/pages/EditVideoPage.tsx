import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image, X, Upload, Square } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';
import { useHashtagStore } from '../stores/hashtagStore';
import { toast } from 'sonner';
import HashtagInput from '../components/HashtagInput';

const EditVideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentVideo, loading, fetchVideoById, updateVideo } = useVideoStore();
  const { getVideoHashtags } = useHashtagStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);
  const [isHoveringThumbnail, setIsHoveringThumbnail] = useState(false);
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    
    fetchVideoById(id);
  }, [id, fetchVideoById]);
  
  useEffect(() => {
    if (currentVideo) {
      setTitle(currentVideo.title);
      setDescription(currentVideo.description || '');
      setThumbnailPreview(currentVideo.thumbnail_url);
      
      // Load hashtags for this video
      if (id) {
        getVideoHashtags(id).then(videoHashtags => {
          setHashtags(videoHashtags.map(h => h.name));
        });
      }
    }
  }, [currentVideo, id, getVideoHashtags]);
  
  // Get video dimensions when video metadata is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      setVideoDimensions({ width, height });
      
      // Calculate aspect ratio and simplify it
      const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
      const divisor = gcd(width, height);
      setAspectRatio(`${width/divisor}:${height/divisor}`);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [currentVideo]);
  
  // Redirect if not logged in or not the video owner
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (currentVideo && user.id !== currentVideo.user_id && !user.is_admin) {
      navigate('/');
      return;
    }
  }, [user, currentVideo, navigate]);
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('PLEASE SELECT A VALID IMAGE FILE');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('IMAGE FILE IS TOO LARGE. PLEASE SELECT A FILE UNDER 5MB');
      return;
    }
    
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };
  
  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(currentVideo?.thumbnail_url || null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      await updateVideo(id, {
        title: title.trim(),
        description: description.trim(),
        thumbnailFile,
        hashtags,
      });
      
      toast.success('VIDEO UPDATED SUCCESSFULLY');
      navigate(`/video/${id}`);
    } catch (error: any) {
      toast.error(error.message?.toUpperCase() || 'FAILED TO UPDATE VIDEO');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-16 h-16 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
      </div>
    );
  }
  
  if (!currentVideo) {
    return (
      <div className="text-center py-20 card-brutal p-12">
        <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
          <Square size={24} className="text-white" fill="currentColor" />
        </div>
        <h2 className="text-2xl font-black text-brutal-black mb-4 font-mono uppercase">VIDEO NOT FOUND</h2>
        <p className="text-brutal-gray font-bold uppercase">THE VIDEO YOU'RE LOOKING FOR DOESN'T EXIST OR HAS BEEN REMOVED.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="card-brutal p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-secondary-600 border-3 border-brutal-black flex items-center justify-center">
            <Upload size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brutal-black font-mono uppercase mb-2">
              EDIT VIDEO
            </h1>
            <p className="text-brutal-gray font-bold uppercase tracking-wide">
              UPDATE YOUR VIDEO DETAILS
            </p>
          </div>
        </div>
      </div>
      
      {/* Hidden video element to get dimensions */}
      <video
        ref={videoRef}
        src={currentVideo.url}
        className="hidden"
        preload="metadata"
      />
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Thumbnail section */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-brutal-black font-mono uppercase">
              THUMBNAIL
            </label>
            
            <div 
              className="relative aspect-video card-brutal overflow-hidden"
              onMouseEnter={() => setIsHoveringThumbnail(true)}
              onMouseLeave={() => setIsHoveringThumbnail(false)}
            >
              <img
                src={thumbnailPreview || currentVideo.thumbnail_url}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              
              {/* Hover overlay */}
              <div 
                className={`absolute inset-0 bg-brutal-black/70 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                  isHoveringThumbnail ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => thumbnailInputRef.current?.click()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
                    <Upload size={24} className="text-brutal-black" />
                  </div>
                  <p className="text-white font-black font-mono uppercase text-sm mb-2">
                    CLICK TO UPLOAD NEW THUMBNAIL
                  </p>
                  {videoDimensions && (
                    <p className="text-white/80 font-bold uppercase text-xs">
                      RECOMMENDED: {videoDimensions.width}×{videoDimensions.height}PX
                    </p>
                  )}
                </div>
              </div>
              
              {/* Clear button for new thumbnail */}
              {thumbnailFile && (
                <button
                  type="button"
                  onClick={clearThumbnail}
                  className="absolute top-4 right-4 w-10 h-10 bg-accent-600 border-3 border-white flex items-center justify-center brutal-hover"
                >
                  <X size={16} className="text-white" />
                </button>
              )}
            </div>
            
            <input
              type="file"
              ref={thumbnailInputRef}
              onChange={handleThumbnailChange}
              className="hidden"
              accept="image/*"
            />
            
            {videoDimensions && (
              <div className="card-brutal p-4">
                <p className="text-sm text-brutal-black font-bold font-mono uppercase">
                  VIDEO: {videoDimensions.width}×{videoDimensions.height}PX
                </p>
                {aspectRatio && (
                  <p className="text-sm text-brutal-gray font-bold font-mono uppercase">
                    RATIO: {aspectRatio}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Title, description, and hashtags */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase">
                TITLE <span className="text-accent-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-brutal w-full px-4 py-3 font-mono placeholder:text-brutal-gray"
                placeholder="Enter a title for your video"
                required
              />
              <p className="text-xs text-brutal-gray font-bold mt-1 uppercase">
                {title.length}/100 CHARACTERS
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase">
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
        </div>
        
        {/* Submit Section */}
        <div className="card-brutal p-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center">
                <Square size={16} className="text-white" fill="currentColor" />
              </div>
              <div>
                <p className="font-black text-brutal-black font-mono uppercase text-sm">
                  READY TO UPDATE?
                </p>
                <p className="text-xs text-brutal-gray font-bold uppercase">
                  SAVE YOUR CHANGES
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/video/${id}`)}
                className="btn-brutal-secondary px-6 py-3"
              >
                CANCEL
              </button>
              
              <button
                type="submit"
                className="btn-brutal px-8 py-3"
              >
                <Square size={16} className="inline mr-2" />
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditVideoPage;