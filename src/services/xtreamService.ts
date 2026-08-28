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
      return (list as any[]).map((c) => ({
        category_id: String(c.category_id ?? c.id ?? ''),
        category_name: String(c.category_name ?? c.name ?? `Categoría ${c.category_id || ''}`),
        parent_id: c.parent_id,
      }));
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
      return (list as any[]).map((c) => ({
        category_id: String(c.category_id ?? c.id ?? ''),
        category_name: String(c.category_name ?? c.name ?? `Películas ${c.category_id || ''}`),
        parent_id: c.parent_id,
      }));
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
      return (list as any[]).map((c) => ({
        category_id: String(c.category_id ?? c.id ?? ''),
        category_name: String(c.category_name ?? c.name ?? `Series ${c.category_id || ''}`),
        parent_id: c.parent_id,
      }));
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

    // Fetch categories in parallel to map numeric IDs (like "227") to real names (like "DEPORTES HD")
    const [data, categories] = await Promise.all([
      NetworkService.fetchJson<any>(this.buildDirectUrl(source, params), useProxy).catch(() => []),
      this.getLiveCategories(source, useProxy).catch(() => []),
    ]);

    const catMap = new Map<string, string>();
    categories.forEach((c) => {
      if (c.category_id && c.category_name) {
        catMap.set(String(c.category_id), c.category_name);
      }
    });

    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.live_streams)) rawList = data.live_streams;
      else if (Array.isArray(data.streams)) rawList = data.streams;
      else if (Array.isArray(data.data)) rawList = data.data;
      else if (!('user_info' in data)) rawList = Object.values(data);
    }

    if (rawList.length === 0) return [];

    const baseUrl = this.cleanServerUrl(source.serverUrl || '');

    return rawList.map((item: any) => {
      const streamId = item.stream_id ?? item.id;
      const streamUrl = `${baseUrl}/live/${source.username}/${source.password}/${streamId}.m3u8`;
      const catIdStr = String(item.category_id ?? item.category_name ?? '');
      const groupName =
        item.category_name ||
        catMap.get(catIdStr) ||
        (catIdStr && !/^\d+$/.test(catIdStr) ? catIdStr : `En Vivo ${catIdStr ? `(${catIdStr})` : ''}`);

      const logoUrl =
        item.stream_icon ||
        item.logo ||
        item.icon ||
        item.tvg_logo ||
        item.cover ||
        '';

      return {
        id: `${source.id}-live-${streamId}`,
        num: item.num,
        name: item.name || item.stream_display_name || item.title || 'Canal sin nombre',
        streamType: 'live',
        url: streamUrl,
        logo: logoUrl,
        group: groupName,
        tvgId: item.epg_channel_id || item.tvg_id || '',
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

    const [data, categories] = await Promise.all([
      NetworkService.fetchJson<any>(this.buildDirectUrl(source, params), useProxy).catch(() => []),
      this.getVodCategories(source, useProxy).catch(() => []),
    ]);

    const catMap = new Map<string, string>();
    categories.forEach((c) => {
      if (c.category_id && c.category_name) {
        catMap.set(String(c.category_id), c.category_name);
      }
    });

    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.vod_streams)) rawList = data.vod_streams;
      else if (Array.isArray(data.streams)) rawList = data.streams;
      else if (Array.isArray(data.data)) rawList = data.data;
      else if (!('user_info' in data)) rawList = Object.values(data);
    }

    if (rawList.length === 0) return [];

    const baseUrl = this.cleanServerUrl(source.serverUrl || '');

    return rawList.map((item: any) => {
      const streamId = item.stream_id ?? item.vod_id ?? item.id;
      const ext = item.container_extension || item.extension || 'mp4';
      const streamUrl = `${baseUrl}/movie/${source.username}/${source.password}/${streamId}.${ext}`;
      const catIdStr = String(item.category_id ?? item.category_name ?? '');
      const groupName =
        item.category_name ||
        catMap.get(catIdStr) ||
        (catIdStr && !/^\d+$/.test(catIdStr) ? catIdStr : `Películas ${catIdStr ? `(${catIdStr})` : ''}`);

      const posterUrl =
        item.stream_icon ||
        item.cover ||
        item.cover_big ||
        item.poster ||
        item.movie_image ||
        item.backdrop_path?.[0] ||
        '';

      return {
        id: `${source.id}-vod-${streamId}`,
        num: item.num,
        name: item.name || item.title || item.stream_display_name || 'Película sin título',
        streamType: 'movie',
        url: streamUrl,
        logo: posterUrl,
        group: groupName,
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

    const [data, categories] = await Promise.all([
      NetworkService.fetchJson<any>(this.buildDirectUrl(source, params), useProxy).catch(() => []),
      this.getSeriesCategories(source, useProxy).catch(() => []),
    ]);

    const catMap = new Map<string, string>();
    categories.forEach((c) => {
      if (c.category_id && c.category_name) {
        catMap.set(String(c.category_id), c.category_name);
      }
    });

    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.series)) rawList = data.series;
      else if (Array.isArray(data.streams)) rawList = data.streams;
      else if (Array.isArray(data.data)) rawList = data.data;
      else if (!('user_info' in data)) rawList = Object.values(data);
    }

    if (rawList.length === 0) return [];

    return rawList.map((item: any) => {
      const seriesId = item.series_id ?? item.id;
      const catIdStr = String(item.category_id ?? item.category_name ?? '');
      const groupName =
        item.category_name ||
        catMap.get(catIdStr) ||
        (catIdStr && !/^\d+$/.test(catIdStr) ? catIdStr : `Series ${catIdStr ? `(${catIdStr})` : ''}`);

      const posterUrl =
        item.cover ||
        item.cover_big ||
        item.stream_icon ||
        item.poster ||
        item.series_image ||
        item.backdrop_path?.[0] ||
        '';

      return {
        id: `${source.id}-series-${seriesId}`,
        num: item.num,
        name: item.name || item.title || item.series_name || 'Serie sin título',
        streamType: 'series',
        url: '', // Loaded dynamically when episode is chosen
        logo: posterUrl,
        group: groupName,
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
