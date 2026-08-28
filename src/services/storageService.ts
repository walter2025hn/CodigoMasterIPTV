import {
  ChannelItem,
  FavoriteItem,
  HistoryItem,
  PlaylistSource,
  UserSettings,
} from '../types/iptv';

const STORAGE_KEYS = {
  SOURCES: 'codigomaster_sources',
  ACTIVE_SOURCE: 'codigomaster_active_source',
  CACHED_CHANNELS: 'codigomaster_cached_channels_',
  FAVORITES: 'codigomaster_favorites',
  HISTORY: 'codigomaster_history',
  SETTINGS: 'codigomaster_settings',
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
  useProxy: true,
  autoPlay: true,
  defaultAspectRatio: 'auto',
  volume: 1,
  muted: false,
  bufferLength: 30,
  tvRemoteMode: false,
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
    try {
      localStorage.setItem(`${STORAGE_KEYS.CACHED_CHANNELS}${sourceId}`, JSON.stringify(channels));
    } catch (e) {
      console.warn('LocalStorage limit exceeded, caching subset:', e);
      // Cache first 2000 channels to avoid quota error if list is huge
      localStorage.setItem(
        `${STORAGE_KEYS.CACHED_CHANNELS}${sourceId}`,
        JSON.stringify(channels.slice(0, 2000))
      );
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
}
