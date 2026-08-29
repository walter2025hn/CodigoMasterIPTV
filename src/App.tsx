/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ChannelItem,
  FavoriteItem,
  HistoryItem,
  PlaylistSource,
  UserSettings,
} from './types/iptv';
import { StorageService, DEFAULT_DEMO_SOURCE, DEMO_CHANNELS } from './services/storageService';
import { XtreamService } from './services/xtreamService';
import { parseM3U } from './services/m3uParser';
import { NetworkService } from './services/networkService';
import { Header } from './components/Header';
import { Navigation, MainTab } from './components/Navigation';
import { LiveTVView } from './components/LiveTV/LiveTVView';
import { MoviesView } from './components/Movies/MoviesView';
import { SeriesView } from './components/Series/SeriesView';
import { FavoritesView } from './components/Favorites/FavoritesView';
import { HistoryView } from './components/History/HistoryView';
import { SourcesManagerView } from './components/Sources/SourcesManagerView';
import { AddSourceModal } from './components/Modals/AddSourceModal';
import { ApkExportModal } from './components/Modals/ApkExportModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { AccountDetailsModal } from './components/Modals/AccountDetailsModal';
import { PlayerOverlayModal } from './components/Player/PlayerOverlayModal';

export default function App() {
  // Sources & Channels
  const [sources, setSources] = useState<PlaylistSource[]>([]);
  const [activeSourceId, setActiveSourceId] = useState<string>('');
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(false);
  const [isSyncingVod, setIsSyncingVod] = useState<boolean>(false);
  const [isSyncingSeries, setIsSyncingSeries] = useState<boolean>(false);

  // Playback & Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('live');
  const [currentPlayingItem, setCurrentPlayingItem] = useState<ChannelItem | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Favorites, History & Settings
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());

  // Modals
  const [isAddSourceOpen, setIsAddSourceOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState<boolean>(false);

  // Initial Load
  useEffect(() => {
    const initApp = async () => {
      const loadedSources = StorageService.getSources();
      setSources(loadedSources);

      const activeId = StorageService.getActiveSourceId() || loadedSources[0]?.id || '';
      setActiveSourceId(activeId);

      setFavorites(StorageService.getFavorites());
      setHistory(StorageService.getHistory());
      setSettings(StorageService.getSettings());

      if (activeId) {
        await loadChannelsForSource(activeId, loadedSources);
      }
    };
    initApp();
  }, []);

  // Active Source Object
  const activeSource = useMemo(() => {
    return sources.find((s) => s.id === activeSourceId) || null;
  }, [sources, activeSourceId]);

  // Sync VOD Movies specifically
  const handleSyncMovies = async (source = activeSource) => {
    if (!source || source.type !== 'xtream' || isSyncingVod) return;
    setIsSyncingVod(true);
    try {
      const vod = await XtreamService.getVodStreams(source, undefined, settings.useProxy);
      setChannels((prev) => {
        const nonMovies = prev.filter((c) => c.streamType !== 'movie');
        const updated = [...nonMovies, ...vod];
        StorageService.saveChannels(source.id, updated);
        return updated;
      });
      source.moviesCount = vod.length;
      StorageService.addSource(source);
    } catch (e) {
      console.error('Error syncing movies:', e);
    } finally {
      setIsSyncingVod(false);
    }
  };

  // Sync Series specifically
  const handleSyncSeries = async (source = activeSource) => {
    if (!source || source.type !== 'xtream' || isSyncingSeries) return;
    setIsSyncingSeries(true);
    try {
      const series = await XtreamService.getSeriesStreams(source, undefined, settings.useProxy);
      setChannels((prev) => {
        const nonSeries = prev.filter((c) => c.streamType !== 'series');
        const updated = [...nonSeries, ...series];
        StorageService.saveChannels(source.id, updated);
        return updated;
      });
      source.seriesCount = series.length;
      StorageService.addSource(source);
    } catch (e) {
      console.error('Error syncing series:', e);
    } finally {
      setIsSyncingSeries(false);
    }
  };

  // Load Channels For Specific Source
  const loadChannelsForSource = async (sourceId: string, currentSources = sources) => {
    setIsLoadingChannels(true);

    if (sourceId === DEFAULT_DEMO_SOURCE.id) {
      setChannels(DEMO_CHANNELS);
      if (!currentPlayingItem) {
        setCurrentPlayingItem(DEMO_CHANNELS[0]);
      }
      setIsLoadingChannels(false);
      return;
    }

    const targetSource = currentSources.find((s) => s.id === sourceId);

    // Try reading full cached channels from IndexedDB / Storage
    const cached = await StorageService.getChannelsAsync(sourceId);
    if (cached && cached.length > 0) {
      setChannels(cached);
      if (!currentPlayingItem) {
        const firstLive = cached.find((c) => c.streamType === 'live') || cached[0];
        setCurrentPlayingItem(firstLive);
      }
      setIsLoadingChannels(false);

      // If Xtream source is missing movies or series in cache, auto-fetch them in background
      if (targetSource && targetSource.type === 'xtream') {
        const hasMovies = cached.some((c) => c.streamType === 'movie');
        const hasSeries = cached.some((c) => c.streamType === 'series');

        if (!hasMovies) {
          handleSyncMovies(targetSource);
        }
        if (!hasSeries) {
          handleSyncSeries(targetSource);
        }
      }
      return;
    }

    // Otherwise fetch fresh from source
    if (!targetSource) {
      setIsLoadingChannels(false);
      return;
    }

    try {
      if (targetSource.type === 'xtream') {
        const [live, vod, series] = await Promise.all([
          XtreamService.getLiveStreams(targetSource, undefined, settings.useProxy).catch(() => []),
          XtreamService.getVodStreams(targetSource, undefined, settings.useProxy).catch(() => []),
          XtreamService.getSeriesStreams(targetSource, undefined, settings.useProxy).catch(() => []),
        ]);
        const all = [...live, ...vod, ...series];
        setChannels(all);
        StorageService.saveChannels(sourceId, all);

        // Update counts
        targetSource.channelCount = live.length;
        targetSource.moviesCount = vod.length;
        targetSource.seriesCount = series.length;
        StorageService.addSource(targetSource);

        if (!currentPlayingItem && live.length > 0) {
          setCurrentPlayingItem(live[0]);
        }
      } else if (targetSource.type === 'm3u' && targetSource.url) {
        const content = await NetworkService.fetchText(targetSource.url, settings.useProxy);
        const parsed = parseM3U(content, sourceId);
        setChannels(parsed);
        StorageService.saveChannels(sourceId, parsed);
        if (!currentPlayingItem && parsed.length > 0) {
          setCurrentPlayingItem(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching channels for source:', e);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // Auto trigger movie/series sync when user switches tabs if empty
  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    if (tab === 'movies' && moviesList.length === 0 && activeSource?.type === 'xtream') {
      handleSyncMovies(activeSource);
    } else if (tab === 'series' && seriesList.length === 0 && activeSource?.type === 'xtream') {
      handleSyncSeries(activeSource);
    }
  };

  // Switch Active Source
  const handleSelectSource = (sourceId: string) => {
    setActiveSourceId(sourceId);
    StorageService.setActiveSourceId(sourceId);
    loadChannelsForSource(sourceId);
  };

  // Add Source Callback
  const handleSourceAdded = (newSource: PlaylistSource) => {
    const updated = StorageService.getSources();
    setSources(updated);
    setActiveSourceId(newSource.id);
    loadChannelsForSource(newSource.id, updated);
  };

  // Delete Source
  const handleDeleteSource = (sourceId: string) => {
    StorageService.removeSource(sourceId);
    const updated = StorageService.getSources();
    setSources(updated);
    const nextActive = StorageService.getActiveSourceId();
    setActiveSourceId(nextActive);
    loadChannelsForSource(nextActive, updated);
  };

  // Refresh current source
  const handleRefreshChannels = async () => {
    if (!activeSource) return;
    setIsLoadingChannels(true);

    try {
      if (activeSource.type === 'xtream') {
        const [live, vod, series] = await Promise.all([
          XtreamService.getLiveStreams(activeSource, undefined, settings.useProxy),
          XtreamService.getVodStreams(activeSource, undefined, settings.useProxy),
          XtreamService.getSeriesStreams(activeSource, undefined, settings.useProxy),
        ]);
        const all = [...live, ...vod, ...series];
        setChannels(all);
        StorageService.saveChannels(activeSource.id, all);

        activeSource.channelCount = live.length;
        activeSource.moviesCount = vod.length;
        activeSource.seriesCount = series.length;
        StorageService.addSource(activeSource);
      } else if (activeSource.type === 'm3u' && activeSource.url) {
        const content = await NetworkService.fetchText(activeSource.url, settings.useProxy);
        const parsed = parseM3U(content, activeSource.id);
        setChannels(parsed);
        StorageService.saveChannels(activeSource.id, parsed);
      }
    } catch (e) {
      console.error('Error refreshing source:', e);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // Reset to Demo
  const handleResetToDemo = () => {
    StorageService.saveSources([DEFAULT_DEMO_SOURCE]);
    StorageService.saveChannels(DEFAULT_DEMO_SOURCE.id, DEMO_CHANNELS);
    StorageService.setActiveSourceId(DEFAULT_DEMO_SOURCE.id);
    setSources([DEFAULT_DEMO_SOURCE]);
    setActiveSourceId(DEFAULT_DEMO_SOURCE.id);
    setChannels(DEMO_CHANNELS);
    setCurrentPlayingItem(DEMO_CHANNELS[0]);
  };

  // Categorize streams into Live, Movies, Series
  const liveChannels = useMemo(() => {
    return channels.filter((c) => c.streamType === 'live' || !c.streamType);
  }, [channels]);

  const moviesList = useMemo(() => {
    return channels.filter((c) => c.streamType === 'movie');
  }, [channels]);

  const seriesList = useMemo(() => {
    return channels.filter((c) => c.streamType === 'series');
  }, [channels]);

  // Handle Play item
  const handlePlayItem = (
    item: ChannelItem,
    seasonNum?: number,
    epNum?: number,
    episodeTitle?: string,
    openModal: boolean = false
  ) => {
    setCurrentPlayingItem(item);
    StorageService.addToHistory(item, 0, 0, seasonNum, epNum, episodeTitle);
    setHistory(StorageService.getHistory());

    if (openModal || item.streamType === 'movie' || item.streamType === 'series') {
      setIsPlayerModalOpen(true);
    } else if (item.streamType === 'live' && activeTab !== 'live' && activeTab !== 'favorites') {
      setActiveTab('live');
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (item: ChannelItem) => {
    StorageService.toggleFavorite(item);
    setFavorites(StorageService.getFavorites());
  };

  // Favorite IDs array
  const favoriteIds = useMemo(() => {
    return favorites.map((f) => f.id);
  }, [favorites]);

  // Navigation Channel Up / Down in Live TV
  const handleNextChannel = () => {
    if (!currentPlayingItem || liveChannels.length === 0) return;
    const currentIndex = liveChannels.findIndex((c) => c.id === currentPlayingItem.id);
    const nextIndex = (currentIndex + 1) % liveChannels.length;
    handlePlayItem(liveChannels[nextIndex]);
  };

  const handlePrevChannel = () => {
    if (!currentPlayingItem || liveChannels.length === 0) return;
    const currentIndex = liveChannels.findIndex((c) => c.id === currentPlayingItem.id);
    const prevIndex = (currentIndex - 1 + liveChannels.length) % liveChannels.length;
    handlePlayItem(liveChannels[prevIndex]);
  };

  // Progress update for history resume
  const handleProgress = (currentTime: number, duration: number) => {
    if (!currentPlayingItem || currentPlayingItem.streamType === 'live') return;
    if (Math.floor(currentTime) % 10 === 0) {
      StorageService.addToHistory(currentPlayingItem, currentTime, duration);
      setHistory(StorageService.getHistory());
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        sources={sources}
        activeSource={activeSource}
        onSelectSource={handleSelectSource}
        onOpenAddSource={() => setIsAddSourceOpen(true)}
        onOpenApkExport={() => setIsApkModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAccountDetails={
          activeSource?.type === 'xtream' ? () => setIsAccountDetailsOpen(true) : undefined
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefreshChannels={handleRefreshChannels}
        isLoading={isLoadingChannels}
      />

      {/* Main Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden pb-14 lg:pb-0">
        {/* Navigation Sidebar */}
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={{
            live: liveChannels.length,
            movies: moviesList.length,
            series: seriesList.length,
            favorites: favorites.length,
            history: history.length,
          }}
          onOpenApkModal={() => setIsApkModalOpen(true)}
        />

        {/* Dynamic Tab Content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* TAB 1: En Vivo (Live TV) */}
          {activeTab === 'live' && (
            <LiveTVView
              channels={liveChannels}
              currentChannel={currentPlayingItem}
              onSelectChannel={(ch) => handlePlayItem(ch, undefined, undefined, undefined, false)}
              settings={settings}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onNextChannel={handleNextChannel}
              onPrevChannel={handlePrevChannel}
              searchQuery={searchQuery}
              onOpenModal={(ch) => handlePlayItem(ch, undefined, undefined, undefined, true)}
            />
          )}

          {/* TAB 2: Películas VOD */}
          {activeTab === 'movies' && (
            <MoviesView
              movies={moviesList}
              onPlayMovie={(m) => handlePlayItem(m, undefined, undefined, undefined, true)}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              searchQuery={searchQuery}
              onSyncMovies={() => handleSyncMovies()}
              isSyncing={isSyncingVod}
            />
          )}

          {/* TAB 3: Series */}
          {activeTab === 'series' && (
            <SeriesView
              series={seriesList}
              activeSource={activeSource}
              onPlayEpisode={(item, s, ep) => handlePlayItem(item, s, ep, undefined, true)}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              searchQuery={searchQuery}
              settings={settings}
              onSyncSeries={() => handleSyncSeries()}
              isSyncing={isSyncingSeries}
            />
          )}

          {/* TAB 4: Favoritos */}
          {activeTab === 'favorites' && (
            <FavoritesView
              favorites={favorites}
              onPlayItem={(item) => handlePlayItem(item, undefined, undefined, undefined, true)}
              onRemoveFavorite={handleToggleFavorite}
            />
          )}

          {/* TAB 5: Historial */}
          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onPlayItem={(item) => handlePlayItem(item, undefined, undefined, undefined, true)}
              onClearHistory={() => {
                StorageService.clearHistory();
                setHistory([]);
              }}
            />
          )}

          {/* TAB 6: Administrador de Listas */}
          {activeTab === 'sources' && (
            <SourcesManagerView
              sources={sources}
              activeSourceId={activeSourceId}
              onSelectSource={handleSelectSource}
              onDeleteSource={handleDeleteSource}
              onOpenAddModal={() => setIsAddSourceOpen(true)}
              onSyncSource={() => handleRefreshChannels()}
              isLoading={isLoadingChannels}
            />
          )}
        </main>
      </div>

      {/* FULLSCREEN PLAYER OVERLAY FOR MOVIES, SERIES & POPOUT */}
      <PlayerOverlayModal
        channel={currentPlayingItem}
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        settings={settings}
        isFavorite={currentPlayingItem ? favoriteIds.includes(currentPlayingItem.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onNext={handleNextChannel}
        onPrev={handlePrevChannel}
        onProgress={handleProgress}
      />

      {/* MODALS */}
      <AddSourceModal
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onSourceAdded={handleSourceAdded}
        settings={settings}
      />

      <ApkExportModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetToDemo={handleResetToDemo}
      />

      <AccountDetailsModal
        isOpen={isAccountDetailsOpen}
        onClose={() => setIsAccountDetailsOpen(false)}
        source={activeSource}
      />
    </div>
  );
}
