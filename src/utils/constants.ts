// Application-wide constants

export const APP_CONFIG = {
  name: 'DeliTube',
  tagline: 'Yikes and Describe',
  description: "Deli-kun's premiere streaming and video sharing service, rated best only option annually!",
  maxHashtags: 3,
  maxFileSize: {
    video: 500 * 1024 * 1024, // 500MB (increased since we now compress)
    image: 5 * 1024 * 1024,   // 5MB
  },
  compression: {
    threshold: 10 * 1024 * 1024, // 10MB - compress files larger than this
    targetQuality: 'high', // high, medium, low
    maxResolution: {
      width: 1920,
      height: 1080
    }
  },
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 50,
  },
} as const;

export const STORAGE_KEYS = {
  likedVideos: 'likedVideos',
  theme: 'theme',
} as const;

export const API_ENDPOINTS = {
  deleteUser: '/functions/v1/delete-user',
  sendNotificationEmail: '/functions/v1/send-notification-email',
} as const;

export const VALIDATION = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  password: {
    minLength: 6,
  },
  title: {
    maxLength: 100,
  },
  hashtag: {
    maxLength: 30,
    pattern: /^[a-z0-9_]+$/,
  },
} as const;