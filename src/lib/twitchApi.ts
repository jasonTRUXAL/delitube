interface TwitchClip {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
  vod_offset: number;
}

interface TwitchClipsResponse {
  data: TwitchClip[];
  pagination?: {
    cursor?: string;
  };
}

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchUserResponse {
  data: Array<{
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    created_at: string;
  }>;
}

class TwitchAPI {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = import.meta.env.VITE_TWITCH_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Twitch API credentials not found. Using mock data.');
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data: TwitchTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Twitch access token:', error);
      throw error;
    }
  }

  private async makeApiRequest(endpoint: string): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`https://api.twitch.tv/helix${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': this.clientId,
      },
    });

    if (!response.ok) {
      throw new Error(`Twitch API request failed: ${response.status}`);
    }

    return response.json();
  }

  async getUserByLogin(login: string): Promise<string | null> {
    try {
      const data: TwitchUserResponse = await this.makeApiRequest(`/users?login=${login}`);
      return data.data.length > 0 ? data.data[0].id : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getClipsByBroadcaster(broadcasterId: string, count: number = 8): Promise<TwitchClip[]> {
    try {
      const data: TwitchClipsResponse = await this.makeApiRequest(
        `/clips?broadcaster_id=${broadcasterId}&first=${count}&started_at=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`
      );
      return data.data;
    } catch (error) {
      console.error('Error fetching clips:', error);
      return [];
    }
  }

  async getClipsByUsername(username: string, count: number = 8): Promise<TwitchClip[]> {
    try {
      const userId = await this.getUserByLogin(username);
      if (!userId) {
        throw new Error(`User ${username} not found`);
      }
      
      return await this.getClipsByBroadcaster(userId, count);
    } catch (error) {
      console.error('Error fetching clips by username:', error);
      return [];
    }
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

export const twitchApi = new TwitchAPI();
export type { TwitchClip };