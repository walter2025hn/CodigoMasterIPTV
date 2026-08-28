import {
  ChannelItem,
  PlaylistSource,
  XtreamAccountInfo,
  XtreamCategory,
  XtreamSeriesDetail,
} from '../types/iptv';
import { NetworkService } from './networkService';

export class XtreamService {
  public static cleanServerUrl(url: string): string {
    return NetworkService.cleanUrl(url)
      .replace(/\/+$/, '')
      .replace(/\/player_api\.php.*$/, '');
  }

  public static buildDirectUrl(
    source: PlaylistSource,
    params: Record<string, string | number> = {}
  ): string {
    const baseUrl = this.cleanServerUrl(source.serverUrl || '');
    const urlObj = new URL(`${baseUrl}/player_api.php`);
    urlObj.searchParams.set('username', source.username || '');
    urlObj.searchParams.set('password', source.password || '');

    for (const [key, value] of Object.entries(params)) {
      urlObj.searchParams.set(key, String(value));
    }

    return urlObj.toString();
  }

  public static async authenticate(
    serverUrl: string,
    username: string,
    password: string,
    useProxy: boolean = false
  ): Promise<XtreamAccountInfo> {
    const dummySource: PlaylistSource = {
      id: 'auth_test',
      name: 'Test',
      type: 'xtream',
      serverUrl,
      username,
      password,
      createdAt: Date.now(),
    };

    const targetUrl = this.buildDirectUrl(dummySource, {});
    const data = await NetworkService.fetchJson<any>(targetUrl, useProxy);

    if (data.user_info && (data.user_info.auth === 0 || data.user_info.status === 'Banned')) {
      throw new Error(data.user_info.message || 'Credenciales inválidas o cuenta inactiva');
    }

    if (!data.user_info) {
      throw new Error('El servidor respondió pero no devolvió información de usuario válida');
    }

    return data as XtreamAccountInfo;
  }

  public static async getLiveCategories(
    source: PlaylistSource,
    useProxy: boolean = false
  ): Promise<XtreamCategory[]> {
    try {
      const url = this.buildDirectUrl(source, { action: 'get_live_categories' });
      const data = await NetworkService.fetchJson<any>(url, useProxy);
      const list = Array.isArray(data)
        ? data
        : data && typeof data === 'object' && !('user_info' in data)
        ? Object.values(data)
        : [];
      return list as XtreamCategory[];
    } catch {
      return [];
    }
  }

  public static async getVodCategories(
    source: PlaylistSource,
    useProxy: boolean = false
  ): Promise<XtreamCategory[]> {
    try {
      const url = this.buildDirectUrl(source, { action: 'get_vod_categories' });
      const data = await NetworkService.fetchJson<any>(url, useProxy);
      const list = Array.isArray(data)
        ? data
        : data && typeof data === 'object' && !('user_info' in data)
        ? Object.values(data)
        : [];
      return list as XtreamCategory[];
    } catch {
      return [];
    }
  }

  public static async getSeriesCategories(
    source: PlaylistSource,
    useProxy: boolean = false
  ): Promise<XtreamCategory[]> {
    try {
      const url = this.buildDirectUrl(source, { action: 'get_series_categories' });
      const data = await NetworkService.fetchJson<any>(url, useProxy);
      const list = Array.isArray(data)
        ? data
        : data && typeof data === 'object' && !('user_info' in data)
        ? Object.values(data)
        : [];
      return list as XtreamCategory[];
    } catch {
      return [];
    }
  }

  public static async getLiveStreams(
    source: PlaylistSource,
    categoryId?: string,
    useProxy: boolean = false
  ): Promise<ChannelItem[]> {
    const params: Record<string, string | number> = { action: 'get_live_streams' };
    if (categoryId && categoryId !== 'all') {
      params.category_id = categoryId;
    }

    const url = this.buildDirectUrl(source, params);
    const data = await NetworkService.fetchJson<any>(url, useProxy);
    const rawList: any[] = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && !('user_info' in data)
      ? Object.values(data)
      : [];

    if (rawList.length === 0) return [];

    const baseUrl = this.cleanServerUrl(source.serverUrl || '');

    return rawList.map((item: any) => {
      const streamId = item.stream_id ?? item.id;
      const streamUrl = `${baseUrl}/live/${source.username}/${source.password}/${streamId}.m3u8`;

      return {
        id: `${source.id}-live-${streamId}`,
        num: item.num,
        name: item.name || item.stream_display_name || 'Canal sin nombre',
        streamType: 'live',
        url: streamUrl,
        logo: item.stream_icon || item.logo || '',
        group: item.category_name || item.category_id || 'En Vivo',
        tvgId: item.epg_channel_id || '',
        tvgName: item.name || item.stream_display_name,
        streamId: streamId,
        sourceId: source.id,
        rating: item.rating,
        added: item.added,
      };
    });
  }

  public static async getVodStreams(
    source: PlaylistSource,
    categoryId?: string,
    useProxy: boolean = false
  ): Promise<ChannelItem[]> {
    const params: Record<string, string | number> = { action: 'get_vod_streams' };
    if (categoryId && categoryId !== 'all') {
      params.category_id = categoryId;
    }

    const url = this.buildDirectUrl(source, params);
    const data = await NetworkService.fetchJson<any>(url, useProxy);
    const rawList: any[] = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && !('user_info' in data)
      ? Object.values(data)
      : [];

    if (rawList.length === 0) return [];

    const baseUrl = this.cleanServerUrl(source.serverUrl || '');

    return rawList.map((item: any) => {
      const streamId = item.stream_id ?? item.vod_id ?? item.id;
      const ext = item.container_extension || item.extension || 'mp4';
      const streamUrl = `${baseUrl}/movie/${source.username}/${source.password}/${streamId}.${ext}`;

      return {
        id: `${source.id}-vod-${streamId}`,
        num: item.num,
        name: item.name || item.title || item.stream_display_name || 'Película sin título',
        streamType: 'movie',
        url: streamUrl,
        logo: item.stream_icon || item.cover || item.poster || '',
        group: item.category_name || item.category_id || 'Películas',
        streamId: streamId,
        sourceId: source.id,
        rating: item.rating_5based || item.rating || '',
        added: item.added,
        containerExtension: ext,
        plot: item.plot || item.description || '',
        genre: item.genre || '',
        releaseDate: item.release_date || item.year || '',
      };
    });
  }

  public static async getSeriesStreams(
    source: PlaylistSource,
    categoryId?: string,
    useProxy: boolean = false
  ): Promise<ChannelItem[]> {
    const params: Record<string, string | number> = { action: 'get_series' };
    if (categoryId && categoryId !== 'all') {
      params.category_id = categoryId;
    }

    const url = this.buildDirectUrl(source, params);
    const data = await NetworkService.fetchJson<any>(url, useProxy);
    const rawList: any[] = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && !('user_info' in data)
      ? Object.values(data)
      : [];

    if (rawList.length === 0) return [];

    return rawList.map((item: any) => {
      const seriesId = item.series_id ?? item.id;

      return {
        id: `${source.id}-series-${seriesId}`,
        num: item.num,
        name: item.name || item.title || item.series_name || 'Serie',
        streamType: 'series',
        url: '', // Loaded when episode selected
        logo: item.cover || item.stream_icon || item.poster || '',
        group: item.category_name || item.category_id || 'Series',
        streamId: seriesId,
        sourceId: source.id,
        rating: item.rating_5based || item.rating || '',
        plot: item.plot || item.description || '',
        cast: item.cast || '',
        director: item.director || '',
        genre: item.genre || '',
        releaseDate: item.releaseDate || item.release_date || item.year || '',
        backdrop_path: item.backdrop_path || [],
      };
    });
  }

  public static async getSeriesInfo(
    source: PlaylistSource,
    seriesId: string | number,
    useProxy: boolean = false
  ): Promise<XtreamSeriesDetail | null> {
    const url = this.buildDirectUrl(source, { action: 'get_series_info', series_id: seriesId });
    const data = await NetworkService.fetchJson<any>(url, useProxy);
    if (!data) return null;

    const baseUrl = this.cleanServerUrl(source.serverUrl || '');

    // Format episode URLs
    if (data.episodes && typeof data.episodes === 'object') {
      for (const seasonNum in data.episodes) {
        const epList = data.episodes[seasonNum];
        if (Array.isArray(epList)) {
          epList.forEach((ep: any) => {
            const ext = ep.container_extension || 'mp4';
            ep.streamUrl = `${baseUrl}/series/${source.username}/${source.password}/${ep.id}.${ext}`;
          });
        }
      }
    }

    return data as XtreamSeriesDetail;
  }
}
