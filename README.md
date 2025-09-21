# DeliTube

A brutal video sharing platform with automatic video compression.

## Features

- **Video Upload & Sharing** - Upload and share videos with the community
- **Automatic Video Compression** - Videos over 10MB are automatically compressed to save bandwidth and storage
- **User Authentication** - Secure user registration and login
- **Video Comments** - Comment on videos and engage with creators
- **Hashtag System** - Tag videos with hashtags for better discoverability
- **Admin Panel** - Comprehensive admin tools for user and content management
- **Dark Mode** - Full dark mode support
- **Responsive Design** - Works on all devices

## Video Compression

DeliTube automatically compresses videos to optimize storage and streaming:

- **Smart Compression** - Only compresses videos larger than 10MB
- **Quality Preservation** - Uses advanced settings to maintain visual quality
- **Multiple Formats** - Supports MP4, WebM, and MOV input formats
- **Progress Tracking** - Real-time compression progress feedback
- **Fallback Support** - Uses original file if compression fails

### Compression Settings

- **Large Files (>100MB or 4K+)**: Compressed to 1080p, CRF 28, 2000k bitrate
- **Medium Files (>50MB or 1080p)**: Compressed to 720p, CRF 26, 1500k bitrate  
- **Small Files (>25MB)**: Light compression, CRF 24, 1000k bitrate
- **Tiny Files (<25MB)**: Minimal compression, original resolution preserved

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Video Processing**: FFmpeg.js (client-side compression)
- **Deployment**: Bolt Hosting

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start development server: `npm run dev`

## Environment Variables

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```