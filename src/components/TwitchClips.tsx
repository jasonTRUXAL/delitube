import React, { useEffect, useState } from 'react';
import { ExternalLink, Play, Clock, Square } from 'lucide-react';
import { twitchApi, TwitchClip } from '../lib/twitchApi';

const TwitchClips = () => {
  const [clips, setClips] = useState<TwitchClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development since we can't make actual Twitch API calls without proper setup
  const mockClips: TwitchClip[] = [
    {
      id: '1',
      url: 'https://clips.twitch.tv/mock1',
      embed_url: 'https://clips.twitch.tv/embed?clip=mock1',
      broadcaster_id: '123456789',
      broadcaster_name: 'julieee22',
      creator_id: '987654321',
      creator_name: 'viewer1',
      video_id: 'v123456789',
      game_id: '509658',
      language: 'en',
      title: 'INSANE CLUTCH PLAY!',
      view_count: 15420,
      created_at: '2025-01-07T10:30:00Z',
      thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
      duration: 28.5,
      vod_offset: 3600
    },
    {
      id: '2',
      url: 'https://clips.twitch.tv/mock2',
      embed_url: 'https://clips.twitch.tv/embed?clip=mock2',
      broadcaster_id: '123456789',
      broadcaster_name: 'julieee22',
      creator_id: '987654322',
      creator_name: 'viewer2',
      video_id: 'v123456790',
      game_id: '509658',
      language: 'en',
      title: 'Epic Fail Compilation',
      view_count: 8930,
      created_at: '2025-01-06T18:45:00Z',
      thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
      duration: 45.2,
      vod_offset: 7200
    },
    {
      id: '3',
      url: 'https://clips.twitch.tv/mock3',
      embed_url: 'https://clips.twitch.tv/embed?clip=mock3',
      broadcaster_id: '123456789',
      broadcaster_name: 'julieee22',
      creator_id: '987654323',
      creator_name: 'viewer3',
      video_id: 'v123456791',
      game_id: '509658',
      language: 'en',
      title: 'WHAT JUST HAPPENED?!',
      view_count: 23150,
      created_at: '2025-01-06T14:20:00Z',
      thumbnail_url: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
      duration: 19.8,
      vod_offset: 1800
    },
    {
      id: '4',
      url: 'https://clips.twitch.tv/mock4',
      embed_url: 'https://clips.twitch.tv/embed?clip=mock4',
      broadcaster_id: '123456789',
      broadcaster_name: 'julieee22',
      creator_id: '987654324',
      creator_name: 'viewer4',
      video_id: 'v123456792',
      game_id: '509658',
      language: 'en',
      title: 'Perfect Timing Moment',
      view_count: 12680,
      created_at: '2025-01-05T21:15:00Z',
      thumbnail_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      duration: 33.7,
      vod_offset: 5400
    },
    {
      id: '5',
      url: 'https://clips.twitch.tv/mock5',
      embed_url: 'https://clips.twitch.tv/embed?clip=mock5',
      broadcaster_id: '123456789',
      broadcaster_name: 'julieee22',
      creator_id: '987654325',
      creator_name: 'viewer5',
      video_id: 'v123456793',
      game_id: '509658',
      language: 'en',
      title: 'Chat Goes Wild',
      view_count: 18750,
      created_at: '2025-01-05T16:30:00Z',
      thumbnail_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      duration: 41.3,
      vod_offset: 9000
    },
    {
      id: '6',
      url: 'https://clips.twitch.tv/mock6',
      embed_url: 'https://clips.twitch.tv/embed?clip=mock6',
      broadcaster_id: '123456789',
      broadcaster_name: 'julieee22',
      creator_id: '987654326',
      creator_name: 'viewer6',
      video_id: 'v123456794',
      game_id: '509658',
      language: 'en',
      title: 'Unbelievable RNG',
      view_count: 9420,
      created_at: '2025-01-04T19:45:00Z',
      thumbnail_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      duration: 26.1,
      vod_offset: 2700
    },
    {
      id: '7',
      url: 'https://clips.twitch.tv/mock7',
      embed_url: 'https://clips.twitch.tv/embed?clip=mock7',
      broadcaster_id: '123456789',
      broadcaster_name: 'julieee22',
      creator_id: '987654327',
      creator_name: 'viewer7',
      video_id: 'v123456795',
      game_id: '509658',
      language: 'en',
      title: 'Stream Highlight Reel',
      view_count: 31200,
      created_at: '2025-01-04T12:00:00Z',
      thumbnail_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      duration: 52.9,
      vod_offset: 4500
    },
    {
      id: '8',
      url: 'https://clips.twitch.tv/mock8',
      embed_url: 'https://clips.twitch.tv/embed?clip=mock8',
      broadcaster_id: '123456789',
      broadcaster_name: 'julieee22',
      creator_id: '987654328',
      creator_name: 'viewer8',
      video_id: 'v123456796',
      game_id: '509658',
      language: 'en',
      title: 'Viewer Requested Challenge',
      view_count: 14890,
      created_at: '2025-01-03T20:30:00Z',
      thumbnail_url: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg',
      duration: 37.4,
      vod_offset: 6300
    }
  ];

  useEffect(() => {
    const loadClips = async () => {
      setLoading(true);
      try {
        if (twitchApi.isConfigured()) {
          console.log('Fetching real Twitch clips...');
          const realClips = await twitchApi.getClipsByUsername('julieee22', 8);
          
          if (realClips.length > 0) {
            setClips(realClips);
          } else {
            console.log('No clips found, using mock data');
            setClips(mockClips);
          }
        } else {
          console.log('Twitch API not configured, using mock data');
          // Simulate loading delay for mock data
          await new Promise(resolve => setTimeout(resolve, 1000));
          setClips(mockClips);
        }
      } catch (err) {
        console.error('Error loading Twitch clips:', err);
        console.log('Falling back to mock data');
        setClips(mockClips);
      } finally {
        setLoading(false);
      }
    };

    loadClips();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'NOW';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M AGO`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H AGO`;
    return `${Math.floor(diffInSeconds / 86400)}D AGO`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-16 h-16 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-brutal p-8 text-center">
        <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
          <Square size={24} className="text-white" fill="currentColor" />
        </div>
        <p className="text-brutal-black font-black font-mono uppercase dark:text-white">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {clips.map(clip => (
        <a
          key={clip.id}
          href={clip.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block card-brutal brutal-hover"
        >
          <div className="relative aspect-video overflow-hidden bg-brutal-black">
            <img
              src={clip.thumbnail_url}
              alt={clip.title}
              className="w-full h-full object-cover"
            />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 bg-brutal-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="w-16 h-16 bg-primary-600 border-3 border-white flex items-center justify-center brutal-hover">
                <Play size={24} className="text-white ml-1" fill="currentColor" />
              </div>
            </div>
            
            {/* Duration badge */}
            <div className="absolute bottom-2 right-2 bg-brutal-black/80 text-white px-2 py-1 border border-white font-mono font-bold text-xs">
              {formatDuration(clip.duration)}
            </div>
            
            {/* View count badge */}
            <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 border-2 border-white font-mono font-bold text-xs">
              {formatViews(clip.view_count)} VIEWS
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-brutal-dark-brown">
            <h3 className="font-black text-brutal-black line-clamp-2 group-hover:text-primary-600 transition-colors text-lg leading-tight font-mono uppercase mb-3 dark:text-white">
              {clip.title}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-brutal-black font-bold dark:text-white">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 border-2 border-brutal-black flex items-center justify-center">
                  <ExternalLink size={10} className="text-white" />
                </div>
                <span className="font-mono uppercase">JULIEEE22</span>
              </div>
              
              <div className="flex items-center bg-brutal-gray/20 border border-brutal-black px-2 py-1 font-mono">
                <Clock size={10} className="mr-1" />
                <span className="text-xs whitespace-nowrap">{formatTimeAgo(clip.created_at)}</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default TwitchClips;