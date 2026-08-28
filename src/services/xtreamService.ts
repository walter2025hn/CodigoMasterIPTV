import {
  ChannelItem,
  PlaylistSource,
  XtreamAccountInfo,
  XtreamCategory,
  XtreamSeriesDetail,
} from '../types/iptv';

export class XtreamService {
  private static cleanServerUrl(url: string): string {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    // Remove trailing slashes and player_api.php if typed
    clean = clean.replace(/\/+$/, '');
    clean = clean.replace(/\/player_api\.php.*$/, '');
    return clean;
  }

  private static buildUrl(
    source: PlaylistSource,
    params: Record<string, string | number> = {},
    useProxy: boolean = true
  ): string {
    const baseUrl = this.cleanServerUrl(source.serverUrl || '');
    const urlObj = new URL(`${baseUrl}/player_api.php`);
    urlObj.searchParams.set('username', source.username || '');
    urlObj.searchParams.set('password', source.password || '');

    for (const [key, value] of Object.entries(params)) {
      urlObj.searchParams.set(key, String(value));
    }

    const fullUrl = urlObj.toString();
    if (useProxy) {
      return `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
    }
    return fullUrl;
  }

  public static async authenticate(
    serverUrl: string,
    username: string,
    password: string,
    useProxy: boolean = true
  ): Promise<XtreamAccountInfo> {
    const dummySource: PlaylistSource = {
      id: 'test',
      name: 'Test',
      type: 'xtream',
      serverUrl,
      username,
      password,
      createdAt: Date.now(),
    };

    const targetUrl = this.buildUrl(dummySource, {}, useProxy);
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Error del servidor (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    if (data.user_info && data.user_info.auth === 0) {
      throw new Error(data.user_info.message || 'Credenciales inválidas');
    }

    if (!data.user_info) {
      throw new Error('Respuesta inválida del servidor Xtream Codes');
    }

    return data as XtreamAccountInfo;
  }

  public static async getLiveCategories(
    source: PlaylistSource,
    useProxy: boolean = true
  ): Promise<XtreamCategory[]> {
    const url = this.buildUrl(source, { action: 'get_live_categories' }, useProxy);
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  public static async getVodCategories(
    source: PlaylistSource,
    useProxy: boolean = true
  ): Promise<XtreamCategory[]> {
    const url = this.buildUrl(source, { action: 'get_vod_categories' }, useProxy);
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  public static async getSeriesCategories(
    source: PlaylistSource,
    useProxy: boolean = true
  ): Promise<XtreamCategory[]> {
    const url = this.buildUrl(source, { action: 'get_series_categories' }, useProxy);
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  public static async getLiveStreams(
    source: PlaylistSource,
    categoryId?: string,
    useProxy: boolean = true
  ): Promise<ChannelItem[]> {
    const params: Record<string, string | number> = { action: 'get_live_streams' };
    if (categoryId && categoryId !== 'all') {
      params.category_id = categoryId;
    }

    const url = this.buildUrl(source, params, useProxy);
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    const baseUrl = this.cleanServerUrl(source.serverUrl || '');

    return data.map((item: any) => {
      const streamId = item.stream_id;
      const streamUrl = `${baseUrl}/live/${source.username}/${source.password}/${streamId}.m3u8`;

      return {
        id: `${source.id}-live-${streamId}`,
        num: item.num,
        name: item.name || 'Canal sin nombre',
        streamType: 'live',
        url: streamUrl,
        logo: item.stream_icon || '',
        group: item.category_name || 'General',
        tvgId: item.epg_channel_id || '',
        tvgName: item.name,
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
    useProxy: boolean = true
  ): Promise<ChannelItem[]> {
    const params: Record<string, string | number> = { action: 'get_vod_streams' };
    if (categoryId && categoryId !== 'all') {
      params.category_id = categoryId;
    }

    const url = this.buildUrl(source, params, useProxy);
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    const baseUrl = this.cleanServerUrl(source.serverUrl || '');

    return data.map((item: any) => {
      const streamId = item.stream_id;
      const ext = item.container_extension || 'mp4';
      const streamUrl = `${baseUrl}/movie/${source.username}/${source.password}/${streamId}.${ext}`;

      return {
        id: `${source.id}-vod-${streamId}`,
        num: item.num,
        name: item.name || 'Película sin título',
        streamType: 'movie',
        url: streamUrl,
        logo: item.stream_icon || '',
        group: item.category_name || 'Películas',
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
    useProxy: boolean = true
  ): Promise<ChannelItem[]> {
    const params: Record<string, string | number> = { action: 'get_series' };
    if (categoryId && categoryId !== 'all') {
      params.category_id = categoryId;
    }

    const url = this.buildUrl(source, params, useProxy);
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const seriesId = item.series_id;

      return {
        id: `${source.id}-series-${seriesId}`,
        num: item.num,
        name: item.name || item.title || 'Serie',
        streamType: 'series',
        url: '', // Loaded when episode selected
        logo: item.cover || item.stream_icon || '',
        group: item.category_name || 'Series',
        streamId: seriesId,
        sourceId: source.id,
        rating: item.rating_5based || item.rating || '',
        plot: item.plot || item.description || '',
        cast: item.cast || '',
        director: item.director || '',
        genre: item.genre || '',
        releaseDate: item.releaseDate || item.year || '',
        backdrop_path: item.backdrop_path || [],
      };
    });
  }

  public static async getSeriesInfo(
    source: PlaylistSource,
    seriesId: string | number,
    useProxy: boolean = true
  ): Promise<XtreamSeriesDetail | null> {
    const url = this.buildUrl(source, { action: 'get_series_info', series_id: seriesId }, useProxy);
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
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
