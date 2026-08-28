import { ChannelItem, StreamType } from '../types/iptv';

export function parseM3U(content: string, sourceId: string): ChannelItem[] {
  const lines = content.split(/\r?\n/);
  const channels: ChannelItem[] = [];

  let currentItem: Partial<ChannelItem> | null = null;
  let counter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentItem = {};
      currentItem.id = `${sourceId}-ch-${counter++}`;
      currentItem.sourceId = sourceId;

      // Extract tvg attributes
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
      if (tvgIdMatch) currentItem.tvgId = tvgIdMatch[1];

      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
      if (tvgNameMatch) currentItem.tvgName = tvgNameMatch[1];

      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/i);
      if (tvgLogoMatch) currentItem.logo = tvgLogoMatch[1];

      const groupTitleMatch = line.match(/group-title="([^"]*)"/i);
      if (groupTitleMatch) currentItem.group = groupTitleMatch[1];

      const tvgTypeMatch = line.match(/(?:tvg-type|type)="([^"]*)"/i);
      const explicitType = tvgTypeMatch ? tvgTypeMatch[1].toLowerCase() : null;

      // Extract channel name after the last comma
      const lastCommaIndex = line.lastIndexOf(',');
      if (lastCommaIndex !== -1) {
        currentItem.name = line.substring(lastCommaIndex + 1).trim();
      } else {
        currentItem.name = currentItem.tvgName || `Elemento ${counter}`;
      }

      if (!currentItem.group) {
        currentItem.group = 'General';
      }

      if (explicitType) {
        if (explicitType === 'movie' || explicitType === 'vod' || explicitType === 'film') {
          currentItem.streamType = 'movie';
        } else if (explicitType === 'series' || explicitType === 'serie' || explicitType === 'tvshow') {
          currentItem.streamType = 'series';
        } else if (explicitType === 'live' || explicitType === 'tv') {
          currentItem.streamType = 'live';
        }
      }

    } else if (line.startsWith('#EXTGRP:')) {
      if (currentItem) {
        currentItem.group = line.replace('#EXTGRP:', '').trim() || currentItem.group;
      }
    } else if (!line.startsWith('#') && currentItem) {
      currentItem.url = line;
      
      // If stream type was not explicitly set via tvg-type, detect it intelligently
      if (!currentItem.streamType) {
        let streamType: StreamType = 'live';
        const groupLower = (currentItem.group || '').toLowerCase();
        const nameLower = (currentItem.name || '').toLowerCase();
        const urlLower = line.toLowerCase();

        const isSeriesIndicator =
          urlLower.includes('/series/') ||
          urlLower.includes('/series_') ||
          groupLower.includes('serie') ||
          groupLower.includes('series') ||
          groupLower.includes('temporada') ||
          groupLower.includes('season') ||
          groupLower.includes('novela') ||
          groupLower.includes('telenovela') ||
          groupLower.includes('anime') ||
          groupLower.includes('dorama') ||
          groupLower.includes('kdrama') ||
          /s\d{1,2}[\s._-]*e\d{1,2}/i.test(nameLower) ||
          /t\d{1,2}[\s._-]*e\d{1,2}/i.test(nameLower) ||
          /\b\d{1,2}x\d{1,2}\b/i.test(nameLower) ||
          /temporada\s*\d+/i.test(nameLower) ||
          /episodio\s*\d+/i.test(nameLower) ||
          /capitulo\s*\d+/i.test(nameLower);

        const isMovieIndicator =
          urlLower.includes('/movie/') ||
          urlLower.includes('/movies/') ||
          urlLower.includes('/vod/') ||
          groupLower.includes('pelicula') ||
          groupLower.includes('película') ||
          groupLower.includes('movie') ||
          groupLower.includes('movies') ||
          groupLower.includes('vod') ||
          groupLower.includes('cine') ||
          groupLower.includes('cinema') ||
          groupLower.includes('film') ||
          groupLower.includes('films') ||
          groupLower.includes('estreno') ||
          groupLower.includes('estrenos') ||
          groupLower.includes('documental') ||
          groupLower.includes('documentales') ||
          (
            (urlLower.endsWith('.mp4') || urlLower.endsWith('.mkv') || urlLower.endsWith('.avi') || urlLower.endsWith('.mov')) &&
            !urlLower.includes('/live/') &&
            !urlLower.includes('.m3u8')
          );

        if (isSeriesIndicator) {
          streamType = 'series';
        } else if (isMovieIndicator) {
          streamType = 'movie';
        } else {
          streamType = 'live';
        }

        currentItem.streamType = streamType;
      }

      // Try extracting release year from title if movie or series (e.g. "Avatar (2022)")
      const yearMatch = (currentItem.name || '').match(/[\(\[]\s*(19\d{2}|20\d{2})\s*[\)\]]/);
      if (yearMatch) {
        currentItem.releaseDate = yearMatch[1];
      }

      channels.push(currentItem as ChannelItem);
      currentItem = null;
    }
  }

  return channels;
}
