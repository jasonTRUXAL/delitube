import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from 'lucide-react';

type VideoPlayerProps = {
  src: string;
  poster?: string;
  onPlay?: () => void;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, onPlay }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Watch for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
      if (onPlay) onPlay();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;
    
    const position = (e.clientX - progress.getBoundingClientRect().left) / progress.offsetWidth;
    video.currentTime = position * video.duration;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      video.muted = false;
    } else {
      video.muted = true;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-container') as HTMLDivElement;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="relative video-container group rounded-lg overflow-hidden bg-black" onDoubleClick={toggleFullscreen}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full cursor-pointer"
        onClick={togglePlay}
        playsInline
      />
      
      {/* Video controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div 
          ref={progressRef}
          className="h-1.5 bg-gray-500/50 rounded-full cursor-pointer mb-2 relative"
          onClick={handleProgress}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-primary-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary-400 focus:outline-none transition-colors"
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={skipBackward}
                className="text-white hover:text-primary-400 focus:outline-none transition-colors"
              >
                <SkipBack size={18} />
              </button>
              
              <button
                onClick={skipForward}
                className="text-white hover:text-primary-400 focus:outline-none transition-colors"
              >
                <SkipForward size={18} />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary-400 focus:outline-none transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 md:w-24 accent-primary-500"
              />
            </div>
            
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          {/* Right controls */}
          <div>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-primary-400 focus:outline-none transition-colors"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Play button overlay when paused */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-600/90 rounded-full flex items-center justify-center hover:bg-primary-700/90 transition-colors">
            <Play size={32} className="text-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;