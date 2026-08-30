import {
  ChannelItem,
  FavoriteItem,
  HistoryItem,
  PlaylistSource,
  SportsMatch,
  UserSettings,
} from '../types/iptv';
import { DBService } from './dbService';
import { DEFAULT_MATCHES } from '../data/matchesData';

const STORAGE_KEYS = {
  SOURCES: 'codigomaster_sources',
  ACTIVE_SOURCE: 'codigomaster_active_source',
  CACHED_CHANNELS: 'codigomaster_cached_channels_',
  FAVORITES: 'codigomaster_favorites',
  HISTORY: 'codigomaster_history',
  SETTINGS: 'codigomaster_settings',
  SPORTS_MATCHES: 'codigomaster_sports_matches',
};

export const DEFAULT_DEMO_SOURCE: PlaylistSource = {
  id: 'demo-codigo-master',
  name: 'Canales Demo Gratuitos',
  type: 'm3u',
  createdAt: Date.now(),
  channelCount: 10,
  moviesCount: 3,
  seriesCount: 2,
};

export const DEMO_CHANNELS: ChannelItem[] = [
  // Eventos Del Día (Deportes y Partidos en Directo)
  {
    id: 'demo-evento-1',
    name: 'EVENTOS 01: Real Madrid vs Manchester City (21:00)',
    group: 'EVENTOS DEL DÍA',
    streamType: 'live',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/geo/none/linear/sports/manifest.m3u8',
    logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'EVENTOS 1',
  },
  {
    id: 'demo-evento-2',
    name: 'EVENTOS 02: FC Barcelona vs Bayern Múnich (20:00)',
    group: 'EVENTOS DEL DÍA',
    streamType: 'live',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/geo/none/linear/sports/manifest.m3u8',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'EVENTOS 2',
  },
  {
    id: 'demo-evento-3',
    name: 'EVENTOS 03: F1 GP Carrera Principal en Vivo (15:00)',
    group: 'EVENTOS DEL DÍA',
    streamType: 'live',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/geo/none/linear/sports/manifest.m3u8',
    logo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'EVENTOS 3',
  },
  {
    id: 'demo-evento-4',
    name: 'EVENTOS 04: Boca Juniors vs River Plate (21:30)',
    group: 'EVENTOS DEL DÍA',
    streamType: 'live',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/geo/none/linear/sports/manifest.m3u8',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'EVENTOS 4',
  },
  {
    id: 'demo-evento-5',
    name: 'EVENTOS 05: UFC Fight Night Main Card (22:00)',
    group: 'EVENTOS DEL DÍA',
    streamType: 'live',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/geo/none/linear/sports/manifest.m3u8',
    logo: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'EVENTOS 5',
  },

  // Live TV
  {
    id: 'demo-live-1',
    name: 'NASA TV - Transmisión en Vivo HD',
    group: 'Ciencia y Espacio',
    streamType: 'live',
    url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    logo: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'NASA TV',
  },
  {
    id: 'demo-live-2',
    name: 'Red Bull TV Deportes Extremos',
    group: 'Deportes',
    streamType: 'live',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/geo/none/linear/sports/manifest.m3u8',
    logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'Red Bull TV',
  },
  {
    id: 'demo-live-3',
    name: 'Bloomberg TV Finanzas y Negocios',
    group: 'Noticias',
    streamType: 'live',
    url: 'https://liveproduseast.global.ssl.fastly.net/btv/desktop/us_live.m3u8',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'Bloomberg TV',
  },
  {
    id: 'demo-live-4',
    name: 'Euronews Español 24h',
    group: 'Noticias',
    streamType: 'live',
    url: 'https://euronews-euronews-spanish-1-es.samsung.wurl.tv/playlist.m3u8',
    logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'Euronews ES',
  },
  {
    id: 'demo-live-5',
    name: 'France 24 Español',
    group: 'Noticias',
    streamType: 'live',
    url: 'https://f24hls-i.akamaihd.net/hls/live/221193/F24_ES_HI_HLS/master_5000.m3u8',
    logo: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'France 24 ES',
  },
  {
    id: 'demo-live-6',
    name: 'DW Español Documentales',
    group: 'Documentales',
    streamType: 'live',
    url: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/master.m3u8',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    tvgName: 'DW Español',
  },

  // VOD Películas
  {
    id: 'demo-vod-1',
    name: 'Tears of Steel (Ciencia Ficción 4K)',
    group: 'Películas Sci-Fi',
    streamType: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    logo: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    rating: '8.4',
    plot: 'En un futuro distópico, un grupo de científicos y guerreros intentan revertir la invasión cibernética utilizando tecnología cuántica en Ámsterdam.',
    genre: 'Acción, Ciencia Ficción',
    releaseDate: '2024',
  },
  {
    id: 'demo-vod-2',
    name: 'Big Buck Bunny (Animación Familiar)',
    group: 'Películas Infantil',
    streamType: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    logo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    rating: '8.7',
    plot: 'Un conejo gigante de buen corazón decide darle una lección a un grupo de roedores traviesos del bosque.',
    genre: 'Animación, Comedia',
    releaseDate: '2023',
  },
  {
    id: 'demo-vod-3',
    name: 'Sintel (Aventura Fantasía HD)',
    group: 'Películas Aventura',
    streamType: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    rating: '8.9',
    plot: 'Una joven solitaria rescata a un pequeño dragón bebé, comenzando una épica odisea a través de montañas heladas y peligrosas tierras.',
    genre: 'Fantasía, Drama',
    releaseDate: '2024',
  },

  // Series
  {
    id: 'demo-series-1',
    name: 'Cosmos & Universo Secreto (Temporada 1)',
    group: 'Series Documentales',
    streamType: 'series',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    rating: '9.2',
    plot: 'Una espectacular exploración visual a través de las galaxias lejanas, nebulosas y los misterios más profundos del espacio-tiempo.',
    genre: 'Documental, Espacio',
    releaseDate: '2025',
  },
  {
    id: 'demo-series-2',
    name: 'Wild Horizons Expedition (Temporada 1)',
    group: 'Series Naturaleza',
    streamType: 'series',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    logo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    sourceId: 'demo-codigo-master',
    rating: '9.0',
    plot: 'Expediciones a los rincones más salvajes e inaccesibles de la Tierra.',
    genre: 'Naturaleza, Aventura',
    releaseDate: '2025',
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  useProxy: false,
  autoPlay: true,
  defaultAspectRatio: 'auto',
  volume: 1,
  muted: false,
  bufferLength: 30,
  tvRemoteMode: false,
  performanceMode: 'medium',
};

export class StorageService {
  public static getSources(): PlaylistSource[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SOURCES);
      if (!stored) {
        // Initialize with default demo source
        this.saveSources([DEFAULT_DEMO_SOURCE]);
        this.saveChannels(DEFAULT_DEMO_SOURCE.id, DEMO_CHANNELS);
        this.setActiveSourceId(DEFAULT_DEMO_SOURCE.id);
        return [DEFAULT_DEMO_SOURCE];
      }
      return JSON.parse(stored);
    } catch {
      return [DEFAULT_DEMO_SOURCE];
    }
  }

  public static saveSources(sources: PlaylistSource[]): void {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  }

  public static addSource(source: PlaylistSource): void {
    const sources = this.getSources();
    const existingIndex = sources.findIndex((s) => s.id === source.id);
    if (existingIndex >= 0) {
      sources[existingIndex] = source;
    } else {
      sources.unshift(source);
    }
    this.saveSources(sources);
  }

  public static removeSource(sourceId: string): void {
    let sources = this.getSources();
    sources = sources.filter((s) => s.id !== sourceId);
    this.saveSources(sources);
    localStorage.removeItem(`${STORAGE_KEYS.CACHED_CHANNELS}${sourceId}`);
    DBService.removeChannels(sourceId).catch(() => {});

    const activeId = this.getActiveSourceId();
    if (activeId === sourceId) {
      const nextSource = sources[0];
      this.setActiveSourceId(nextSource ? nextSource.id : '');
    }
  }

  public static getActiveSourceId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SOURCE) || DEFAULT_DEMO_SOURCE.id;
  }

  public static setActiveSourceId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SOURCE, id);
  }

  public static async getChannelsAsync(sourceId: string): Promise<ChannelItem[]> {
    if (sourceId === DEFAULT_DEMO_SOURCE.id) {
      return DEMO_CHANNELS;
    }
    // 1. Try IndexedDB first for full dataset
    const idbChannels = await DBService.getChannels(sourceId);
    if (idbChannels && idbChannels.length > 0) {
      return idbChannels;
    }
    // 2. Fallback to localStorage
    return this.getChannels(sourceId);
  }

  public static getChannels(sourceId: string): ChannelItem[] {
    if (sourceId === DEFAULT_DEMO_SOURCE.id) {
      return DEMO_CHANNELS;
    }
    try {
      const cached = localStorage.getItem(`${STORAGE_KEYS.CACHED_CHANNELS}${sourceId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  public static saveChannels(sourceId: string, channels: ChannelItem[]): void {
    // 1. Save full data to IndexedDB asynchronously
    DBService.saveChannels(sourceId, channels).catch((e) => {
      console.warn('DBService saveChannels error:', e);
    });

    // 2. Save a balanced sample (live, movies, series) to localStorage for quick sync
    try {
      localStorage.setItem(`${STORAGE_KEYS.CACHED_CHANNELS}${sourceId}`, JSON.stringify(channels));
    } catch (e) {
      console.warn('LocalStorage limit exceeded, saving balanced subset:', e);
      const live = channels.filter((c) => c.streamType === 'live').slice(0, 1000);
      const vod = channels.filter((c) => c.streamType === 'movie').slice(0, 1000);
      const series = channels.filter((c) => c.streamType === 'series').slice(0, 500);
      const subset = [...live, ...vod, ...series];
      try {
        localStorage.setItem(
          `${STORAGE_KEYS.CACHED_CHANNELS}${sourceId}`,
          JSON.stringify(subset)
        );
      } catch {
        // In extreme quota case, save first 500
        try {
          localStorage.setItem(
            `${STORAGE_KEYS.CACHED_CHANNELS}${sourceId}`,
            JSON.stringify(channels.slice(0, 500))
          );
        } catch {
          // Ignore
        }
      }
    }
  }

  // Favorites
  public static getFavorites(): FavoriteItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static toggleFavorite(channel: ChannelItem): boolean {
    const favorites = this.getFavorites();
    const index = favorites.findIndex((f) => f.id === channel.id || (f.url === channel.url && f.name === channel.name));

    if (index >= 0) {
      favorites.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return false; // Removed
    } else {
      const newFav: FavoriteItem = {
        id: channel.id,
        name: channel.name,
        logo: channel.logo,
        group: channel.group,
        url: channel.url,
        streamType: channel.streamType,
        sourceId: channel.sourceId,
        streamId: channel.streamId,
        containerExtension: channel.containerExtension,
      };
      favorites.unshift(newFav);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true; // Added
    }
  }

  public static isFavorite(channelId: string, url?: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some((f) => f.id === channelId || (url && f.url === url));
  }

  // History
  public static getHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static addToHistory(
    channel: ChannelItem,
    currentTime: number = 0,
    duration: number = 0,
    season?: number,
    episode?: number,
    episodeTitle?: string
  ): void {
    let history = this.getHistory();
    // Remove if already in history
    history = history.filter((h) => h.id !== channel.id && h.url !== channel.url);

    const item: HistoryItem = {
      id: channel.id,
      name: channel.name,
      logo: channel.logo,
      group: channel.group,
      url: channel.url,
      streamType: channel.streamType,
      sourceId: channel.sourceId,
      streamId: channel.streamId,
      timestamp: Date.now(),
      currentTime,
      duration,
      season,
      episode,
      episodeTitle,
    };

    history.unshift(item);
    // Keep max 50 recent items
    history = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  public static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }

  // Settings
  public static getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Sports Matches
  public static getMatches(): SportsMatch[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SPORTS_MATCHES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return DEFAULT_MATCHES;
    } catch {
      return DEFAULT_MATCHES;
    }
  }

  public static saveMatches(matches: SportsMatch[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SPORTS_MATCHES, JSON.stringify(matches));
    } catch (err) {
      console.warn('StorageService saveMatches error:', err);
    }
  }

  public static addMatch(match: SportsMatch): void {
    const matches = this.getMatches();
    const existingIndex = matches.findIndex((m) => m.id === match.id);
    if (existingIndex >= 0) {
      matches[existingIndex] = match;
    } else {
      matches.unshift(match);
    }
    this.saveMatches(matches);
  }

  public static deleteMatch(matchId: string): void {
    const matches = this.getMatches().filter((m) => m.id !== matchId);
    this.saveMatches(matches);
  }

  public static resetMatches(): void {
    this.saveMatches(DEFAULT_MATCHES);
  }
}
