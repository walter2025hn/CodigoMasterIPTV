export type StreamType = 'live' | 'movie' | 'series';

export interface XtreamAccountInfo {
  user_info?: {
    username: string;
    password?: string;
    message?: string;
    auth?: number;
    status: string;
    exp_date: string;
    is_trial?: string;
    active_cons: string;
    created_at?: string;
    max_connections: string;
    allowed_output_formats?: string[];
  };
  server_info?: {
    url: string;
    port: string;
    https_port?: string;
    server_protocol?: string;
    rtmp_port?: string;
    timezone?: string;
    timestamp_now?: number;
    time_now?: string;
  };
}

export interface PlaylistSource {
  id: string;
  name: string;
  type: 'm3u' | 'xtream';
  url?: string;
  serverUrl?: string;
  username?: string;
  password?: string;
  epgUrl?: string;
  createdAt: number;
  lastSync?: number;
  channelCount?: number;
  moviesCount?: number;
  seriesCount?: number;
  accountInfo?: XtreamAccountInfo;
}

export interface ChannelItem {
  id: string;
  num?: number | string;
  name: string;
  streamType: StreamType;
  url: string;
  logo?: string;
  group: string;
  tvgId?: string;
  tvgName?: string;
  streamId?: number | string;
  sourceId: string;
  rating?: string | number;
  added?: string;
  containerExtension?: string;
  plot?: string;
  director?: string;
  cast?: string;
  duration?: string;
  genre?: string;
  releaseDate?: string;
  backdrop_path?: string[];
}

export interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id?: number | string;
}

export interface XtreamEpisodeInfo {
  duration_secs?: number;
  duration?: string;
  plot?: string;
  releasedate?: string;
  cover_big?: string;
  rating?: string;
  movie_image?: string;
}

export interface XtreamEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info?: XtreamEpisodeInfo;
  streamUrl?: string;
}

export interface XtreamSeason {
  air_date?: string;
  episode_count?: number;
  id?: number;
  name: string;
  overview?: string;
  season_number: number;
  cover?: string;
  episodes?: XtreamEpisode[];
}

export interface XtreamSeriesDetail {
  seasons: XtreamSeason[];
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
    backdrop_path?: string[];
    youtube_trailer?: string;
    episode_run_time?: string;
    category_id?: string;
  };
  episodes: Record<string, XtreamEpisode[]>;
}

export interface FavoriteItem {
  id: string;
  name: string;
  logo?: string;
  group: string;
  url: string;
  streamType: StreamType;
  sourceId: string;
  streamId?: string | number;
  containerExtension?: string;
}

export interface HistoryItem {
  id: string;
  name: string;
  logo?: string;
  group: string;
  url: string;
  streamType: StreamType;
  sourceId: string;
  streamId?: string | number;
  timestamp: number;
  currentTime?: number;
  duration?: number;
  season?: number;
  episode?: number;
  episodeTitle?: string;
}

export type PerformanceProfile = 'potato' | 'low' | 'medium' | 'high';

export type VideoQualityPreset = 'auto' | '480p' | '720p' | '1080p' | '2k' | '4k';

export interface UserSettings {
  useProxy: boolean;
  autoPlay: boolean;
  defaultAspectRatio: 'auto' | '16:9' | '4:3' | 'fill' | 'contain';
  volume: number;
  muted: boolean;
  bufferLength: number;
  tvRemoteMode: boolean;
  audioTrackIndex?: number;
  performanceMode?: PerformanceProfile;
  preferredQuality?: VideoQualityPreset;
}

export type SportType = 'football' | 'basketball' | 'motor' | 'tennis' | 'combat' | 'other';
export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface MatchChannel {
  name: string;
  quality?: string;
  language?: string;
  customUrl?: string;
  channelId?: string;
}

export interface SportsMatch {
  id: string;
  sport: SportType;
  tournament: string;
  tournamentLogo?: string;
  homeTeam: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  status: MatchStatus;
  date: string;
  time: string;
  timestamp: number;
  score?: string;
  liveMinute?: string;
  stadiumOrLocation?: string;
  channels: MatchChannel[];
  isHot?: boolean;
  category?: string;
}

