import { ChannelItem, MatchChannel, SportType, SportsMatch } from '../types/iptv';

/**
 * Service to detect and parse "Eventos Del Día" channels and groups from IPTV playlists.
 */
export class EventosService {
  /**
   * Check if a channel or group belongs to "Eventos del día" / Sports Events
   */
  public static isEventChannel(channel: ChannelItem): boolean {
    const group = (channel.group || '').toLowerCase();
    const name = (channel.name || '').toLowerCase();

    const eventKeywords = [
      'evento',
      'eventos',
      'eventos del dia',
      'eventos del día',
      'eventos hoy',
      'eventos ppv',
      'eventos deportivos',
      'agenda deportiva',
      'agenda',
      'partido',
      'partidos',
      'partidos del dia',
      'partidos del día',
      'partidos hoy',
      'ppv',
      'directos',
      'deportes en vivo',
      'sports events',
      'match day',
    ];

    const isGroupMatch = eventKeywords.some((keyword) => group.includes(keyword));
    const isNameMatch =
      name.includes('evento') ||
      name.includes('eventos') ||
      name.includes('partido') ||
      name.includes(' vs ') ||
      name.includes(' v ') ||
      name.includes(' vs. ');

    return isGroupMatch || isNameMatch;
  }

  /**
   * Extract all channels that belong to "Eventos Del Día" and sports event categories
   */
  public static getEventChannels(channels: ChannelItem[]): ChannelItem[] {
    return channels.filter((ch) => this.isEventChannel(ch));
  }

  /**
   * Group event channels by their exact playlist group (e.g. "EVENTOS DEL DIA", "EVENTOS PPV")
   */
  public static getEventGroups(channels: ChannelItem[]): { [groupName: string]: ChannelItem[] } {
    const eventChannels = this.getEventChannels(channels);
    const groups: { [groupName: string]: ChannelItem[] } = {};

    eventChannels.forEach((ch) => {
      const g = ch.group || 'Eventos Del Día';
      if (!groups[g]) {
        groups[g] = [];
      }
      groups[g].push(ch);
    });

    return groups;
  }

  /**
   * Detect sport type based on channel name or tournament
   */
  public static detectSport(text: string): SportType {
    const lower = text.toLowerCase();
    if (
      lower.includes('f1') ||
      lower.includes('formula') ||
      lower.includes('fórmula') ||
      lower.includes('motogp') ||
      lower.includes('nascar') ||
      lower.includes('rally') ||
      lower.includes('carrera') ||
      lower.includes('gp ') ||
      lower.includes('gran premio')
    ) {
      return 'motor';
    }

    if (
      lower.includes('nba') ||
      lower.includes('baloncesto') ||
      lower.includes('basket') ||
      lower.includes('euroleague') ||
      lower.includes('acb')
    ) {
      return 'basketball';
    }

    if (
      lower.includes('ufc') ||
      lower.includes('boxeo') ||
      lower.includes('boxing') ||
      lower.includes('mma') ||
      lower.includes('bellator') ||
      lower.includes('wwe') ||
      lower.includes('fight')
    ) {
      return 'combat';
    }

    if (
      lower.includes('tenis') ||
      lower.includes('tennis') ||
      lower.includes('atp') ||
      lower.includes('wta') ||
      lower.includes('wimbledon') ||
      lower.includes('roland garros') ||
      lower.includes('us open') ||
      lower.includes('australian open')
    ) {
      return 'tennis';
    }

    return 'football';
  }

  /**
   * Intelligently parse a channel name from "Eventos Del Día" into a structured SportsMatch
   */
  public static parseChannelToMatch(channel: ChannelItem, index: number): SportsMatch {
    const rawName = channel.name || `Evento ${index + 1}`;
    let name = rawName;

    // Clean prefix like "EVENTOS 01:", "EVENTOS DEL DIA |", "ES:", "[HD]", etc.
    const cleanPrefixRegex = /^(?:eventos?\s*(?:del?\s*d[ií]a)?\s*\d*[\s|:\-_]+|es\s*[\s|:\-_]+|hd\s*[\s|:\-_]+|\d+\s*[\s|:\-_]+)/i;
    name = name.replace(cleanPrefixRegex, '').trim();

    // Extract time (e.g. "21:00", "19:30", "20:45", "15:00")
    let matchTime = '20:00';
    const timeMatch = rawName.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (timeMatch) {
      matchTime = timeMatch[0];
      name = name.replace(timeMatch[0], '').replace(/[\[\]\(\)\-:]/g, ' ').trim();
    }

    // Detect tournament or league
    let tournament = 'Eventos Del Día';
    const lowerRaw = rawName.toLowerCase();
    if (lowerRaw.includes('champions') || lowerRaw.includes('ucl')) tournament = 'UEFA Champions League';
    else if (lowerRaw.includes('laliga') || lowerRaw.includes('la liga')) tournament = 'LaLiga EA Sports';
    else if (lowerRaw.includes('premier') || lowerRaw.includes('epl')) tournament = 'Premier League';
    else if (lowerRaw.includes('libertadores')) tournament = 'Copa Libertadores';
    else if (lowerRaw.includes('sudamericana')) tournament = 'Copa Sudamericana';
    else if (lowerRaw.includes('serie a')) tournament = 'Serie A';
    else if (lowerRaw.includes('bundesliga')) tournament = 'Bundesliga';
    else if (lowerRaw.includes('liga mx') || lowerRaw.includes('ligamx')) tournament = 'Liga MX';
    else if (lowerRaw.includes('f1') || lowerRaw.includes('formula 1')) tournament = 'Fórmula 1';
    else if (lowerRaw.includes('ufc')) tournament = 'UFC';
    else if (lowerRaw.includes('nba')) tournament = 'NBA';
    else if (channel.group && channel.group.length > 2) tournament = channel.group;

    const sport = this.detectSport(rawName);

    // Extract teams (e.g. "Real Madrid vs Barcelona", "Boca - River", "Liverpool / City")
    let homeTeam = name;
    let awayTeam: string | undefined = undefined;

    const separatorRegex = /\s+(?:vs\.?|vs|v|\-|\/|contra)\s+/i;
    if (separatorRegex.test(name)) {
      const parts = name.split(separatorRegex);
      if (parts.length >= 2) {
        homeTeam = parts[0].trim().replace(/^[^\w\s]+|[^\w\s]+$/g, '');
        awayTeam = parts[1].trim().replace(/^[^\w\s]+|[^\w\s]+$/g, '');
      }
    }

    // Clean excess words in team names
    homeTeam = homeTeam.replace(/\s*\([^\)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').trim();
    if (awayTeam) {
      awayTeam = awayTeam.replace(/\s*\([^\)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').trim();
    }

    if (!homeTeam) {
      homeTeam = channel.name;
    }

    const channelObj: MatchChannel = {
      name: channel.name,
      quality: rawName.toLowerCase().includes('fhd') || rawName.toLowerCase().includes('1080') ? 'FHD' : 'HD',
      language: 'Español',
      customUrl: channel.url,
      channelId: channel.id,
    };

    return {
      id: `match-ev-${channel.id || index}`,
      sport,
      tournament,
      homeTeam,
      awayTeam: awayTeam || undefined,
      status: 'live',
      date: 'Hoy',
      time: matchTime,
      timestamp: Date.now(),
      stadiumOrLocation: 'Transmisión En Vivo',
      channels: [channelObj],
      isHot: true,
      category: 'Evento del Día',
    };
  }

  /**
   * Scan channels array, group and merge matches from "Eventos Del Día"
   */
  public static extractMatchesFromChannels(channels: ChannelItem[]): SportsMatch[] {
    const eventChannels = this.getEventChannels(channels);
    if (eventChannels.length === 0) return [];

    const matchesMap: { [key: string]: SportsMatch } = {};

    eventChannels.forEach((ch, idx) => {
      const parsed = this.parseChannelToMatch(ch, idx);
      const key = `${parsed.homeTeam.toLowerCase()}_${(parsed.awayTeam || '').toLowerCase()}_${parsed.sport}`;

      if (matchesMap[key]) {
        // Add channel to existing match
        const existing = matchesMap[key];
        const alreadyHasChannel = existing.channels.some(
          (c) => c.channelId === ch.id || c.name === ch.name
        );
        if (!alreadyHasChannel) {
          existing.channels.push({
            name: ch.name,
            quality: 'HD',
            language: 'Español',
            customUrl: ch.url,
            channelId: ch.id,
          });
        }
      } else {
        matchesMap[key] = parsed;
      }
    });

    return Object.values(matchesMap);
  }
}
