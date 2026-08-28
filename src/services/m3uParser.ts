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

      // Extract channel name after the last comma
      const lastCommaIndex = line.lastIndexOf(',');
      if (lastCommaIndex !== -1) {
        currentItem.name = line.substring(lastCommaIndex + 1).trim();
      } else {
        currentItem.name = currentItem.tvgName || `Canal ${counter}`;
      }

      if (!currentItem.group) {
        currentItem.group = 'General';
      }

    } else if (line.startsWith('#EXTGRP:')) {
      if (currentItem) {
        currentItem.group = line.replace('#EXTGRP:', '').trim() || currentItem.group;
      }
    } else if (!line.startsWith('#') && currentItem) {
      currentItem.url = line;
      
      // Determine stream type from url, group or name
      let streamType: StreamType = 'live';
      const groupLower = (currentItem.group || '').toLowerCase();
      const nameLower = (currentItem.name || '').toLowerCase();
      const urlLower = line.toLowerCase();

      if (
        groupLower.includes('pelicula') || 
        groupLower.includes('película') || 
        groupLower.includes('movie') || 
        groupLower.includes('vod') || 
        groupLower.includes('cine') ||
        urlLower.includes('/movie/')
      ) {
        streamType = 'movie';
      } else if (
        groupLower.includes('serie') || 
        groupLower.includes('season') || 
        groupLower.includes('temporada') || 
        urlLower.includes('/series/') ||
        /s\d{1,2}e\d{1,2}/i.test(nameLower)
      ) {
        streamType = 'series';
      }

      currentItem.streamType = streamType;
      channels.push(currentItem as ChannelItem);
      currentItem = null;
    }
  }

  return channels;
}
