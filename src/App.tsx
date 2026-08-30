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
  PerformanceProfile,
} from './types/iptv';
import { StorageService, DEFAULT_DEMO_SOURCE, DEMO_CHANNELS } from './services/storageService';
import { XtreamService } from './services/xtreamService';
import { parseM3U } from './services/m3uParser';
import { NetworkService } from './services/networkService';
import { Header } from './components/Header';
import { Navigation, MainTab } from './components/Navigation';
import { LiveTVView } from './components/LiveTV/LiveTVView';
import { MatchesView } from './components/Matches/MatchesView';
import { MoviesView } from './components/Movies/MoviesView';
import { SeriesView } from './components/Series/SeriesView';
import { FavoritesView } from './components/Favorites/FavoritesView';
import { HistoryView } from './components/History/HistoryView';
import { SourcesManagerView } from './components/Sources/SourcesManagerView';
import { AddSourceModal } from './components/Modals/AddSourceModal';
import { ApkExportModal } from './components/Modals/ApkExportModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { AccountDetailsModal } from './components/Modals/AccountDetailsModal';
import { VirtualRemoteModal } from './components/Modals/VirtualRemoteModal';
import { SupportCreatorModal } from './components/Modals/SupportCreatorModal';
import { PlayerOverlayModal } from './components/Player/PlayerOverlayModal';
import { SplashScreen } from './components/Splash/SplashScreen';
import { Tv as TvIcon } from 'lucide-react';

export default function App() {
  // Sources & Channels
  const [sources, setSources] = useState<PlaylistSource[]>([]);
  const [activeSourceId, setActiveSourceId] = useState<string>('');
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(false);
  const [isSyncingVod, setIsSyncingVod] = useState<boolean>(false);
  const [isSyncingSeries, setIsSyncingSeries] = useState<boolean>(false);

  // Splash Screen Intro
  const [showSplash, setShowSplash] = useState<boolean>(true);

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
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState<boolean>(false);
  const [isVirtualRemoteOpen, setIsVirtualRemoteOpen] = useState<boolean>(false);

  // Initial Load & TV Remote Keyboard Listeners
  useEffect(() => {
    const initApp = async () => {
      const loadedSources = StorageService.getSources();
      setSources(loadedSources);

      const activeId = StorageService.getActiveSourceId() || loadedSources[0]?.id || '';
      setActiveSourceId(activeId);

      setFavorites(StorageService.getFavorites());
      setHistory(StorageService.getHistory());
      const loadedSettings = StorageService.getSettings();

      // Auto-detect Smart TV / Android TV / WebOS / Tizen / FireTV
      const isTvDevice =
        /smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast.tv|webos|tizen|android tv|viera|roku|firetv/i.test(
          navigator.userAgent.toLowerCase()
        );
      if (isTvDevice && !loadedSettings.tvRemoteMode) {
        loadedSettings.tvRemoteMode = true;
        StorageService.saveSettings(loadedSettings);
      }

      setSettings(loadedSettings);

      if (activeId) {
        await loadChannelsForSource(activeId, loadedSources);
      }
    };
    initApp();
  }, []);

  // Global Smart TV Remote Control Listener (D-Pad, Back, Colors, Channels)
  useEffect(() => {
    const handleGlobalTvKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // TV Back Keys (Escape, Android Back, Tizen 10009, WebOS 461)
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack' || e.keyCode === 10009 || e.keyCode === 461 || e.keyCode === 4) {
        if (isPlayerModalOpen) {
          setIsPlayerModalOpen(false);
          e.preventDefault();
        } else if (isSettingsOpen || isApkModalOpen || isAddSourceOpen || isVirtualRemoteOpen || isSupportModalOpen || isAccountDetailsOpen) {
          setIsSettingsOpen(false);
          setIsApkModalOpen(false);
          setIsAddSourceOpen(false);
          setIsVirtualRemoteOpen(false);
          setIsSupportModalOpen(false);
          setIsAccountDetailsOpen(false);
          e.preventDefault();
        }
        return;
      }

      // TV Channel Up / Down
      if (e.key === 'PageUp' || e.key === 'ChannelUp' || e.keyCode === 427 || e.keyCode === 33) {
        handleNextChannel();
        e.preventDefault();
      } else if (e.key === 'PageDown' || e.key === 'ChannelDown' || e.keyCode === 428 || e.keyCode === 34) {
        handlePrevChannel();
        e.preventDefault();
      }

      // TV Remote Color Keys (Red, Green, Yellow, Blue)
      if (e.key === 'ColorF0Red' || e.keyCode === 403) {
        setActiveTab('matches');
        e.preventDefault();
      } else if (e.key === 'ColorF1Green' || e.keyCode === 404) {
        setActiveTab('live');
        e.preventDefault();
      } else if (e.key === 'ColorF2Yellow' || e.keyCode === 405) {
        setActiveTab('movies');
        e.preventDefault();
      } else if (e.key === 'ColorF3Blue' || e.keyCode === 406) {
        setActiveTab('series');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleGlobalTvKeys);
    return () => window.removeEventListener('keydown', handleGlobalTvKeys);
  }, [
    isPlayerModalOpen,
    isSettingsOpen,
    isApkModalOpen,
    isAddSourceOpen,
    isVirtualRemoteOpen,
    isSupportModalOpen,
    isAccountDetailsOpen,
  ]);

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

  // Channel number direct jump for TV Remote
  const handleSelectChannelNumber = (num: number) => {
    if (num <= 0 || liveChannels.length === 0) return;
    const target = liveChannels[num - 1] || liveChannels[liveChannels.length - 1];
    if (target) {
      handlePlayItem(target);
    }
  };

  const handlePerformanceModeChange = (mode: PerformanceProfile) => {
    let suggestedBuffer = settings.bufferLength || 30;
    if (mode === 'potato') suggestedBuffer = 6;
    else if (mode === 'low') suggestedBuffer = 15;
    else if (mode === 'medium') suggestedBuffer = 30;
    else if (mode === 'high') suggestedBuffer = 45;

    const updated: UserSettings = {
      ...settings,
      performanceMode: mode,
      bufferLength: suggestedBuffer,
    };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  return (
    <div
      className={`fixed inset-0 flex flex-col h-full w-full min-h-screen min-w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none ${
        settings.tvRemoteMode ? 'tv-mode-active text-scale-tv' : ''
      } ${
        settings.performanceMode === 'potato'
          ? 'perf-potato potato-mode-active'
          : settings.performanceMode === 'low'
          ? 'perf-low'
          : settings.performanceMode === 'high'
          ? 'perf-high'
          : 'perf-medium'
      }`}
    >
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
        onOpenVirtualRemote={() => setIsVirtualRemoteOpen(true)}
        onReplayIntro={() => setShowSplash(true)}
        performanceMode={settings.performanceMode || 'medium'}
        onChangePerformanceMode={handlePerformanceModeChange}
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
            matches: StorageService.getMatches().length,
            movies: moviesList.length,
            series: seriesList.length,
            favorites: favorites.length,
            history: history.length,
          }}
          onOpenSupportModal={() => setIsSupportModalOpen(true)}
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

          {/* TAB 2: Partidos y Eventos Deportivos en Vivo */}
          {activeTab === 'matches' && (
            <MatchesView
              channels={channels}
              onPlayChannel={(ch) => handlePlayItem(ch, undefined, undefined, undefined, true)}
              settings={settings}
            />
          )}

          {/* TAB 3: Películas VOD */}
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

          {/* Floating TV Remote Launcher Button (Ergonomic for mobile & TV Box users) */}
          <button
            onClick={() => setIsVirtualRemoteOpen(true)}
            className="fixed bottom-18 lg:bottom-6 right-5 z-30 p-3 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/40 border border-indigo-400/30 backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 group/remote"
            title="Abrir Mando Virtual TV"
          >
            <TvIcon className="w-5 h-5 group-hover/remote:animate-bounce" />
            <span className="text-xs font-bold hidden sm:inline">Mando TV</span>
          </button>
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

      {/* VIRTUAL TV REMOTE CONTROL MODAL */}
      <VirtualRemoteModal
        isOpen={isVirtualRemoteOpen}
        onClose={() => setIsVirtualRemoteOpen(false)}
        currentChannel={currentPlayingItem}
        onNextChannel={handleNextChannel}
        onPrevChannel={handlePrevChannel}
        onTogglePlay={() => {
          // Trigger Space key on document to toggle player
          window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }));
        }}
        isPlaying={true}
        onToggleMute={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', code: 'KeyM' }));
        }}
        isMuted={false}
        onVolumeUp={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' }));
        }}
        onVolumeDown={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown' }));
        }}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }}
        onToggleFavorite={
          currentPlayingItem ? () => handleToggleFavorite(currentPlayingItem) : undefined
        }
        isFavorite={currentPlayingItem ? favoriteIds.includes(currentPlayingItem.id) : false}
        onSelectChannelNumber={handleSelectChannelNumber}
        onCycleAspectRatio={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }));
        }}
        onToggleCategories={() => {
          setActiveTab('live');
        }}
        performanceMode={settings.performanceMode || 'medium'}
        onChangePerformanceMode={handlePerformanceModeChange}
        currentQuality={settings.preferredQuality || 'auto'}
        onChangeQuality={(q) => {
          const updated = { ...settings, preferredQuality: q };
          setSettings(updated);
          StorageService.saveSettings(updated);
        }}
      />

      {/* MODALS */}
      <SupportCreatorModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

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
        onReplayIntro={() => setShowSplash(true)}
      />

      <AccountDetailsModal
        isOpen={isAccountDetailsOpen}
        onClose={() => setIsAccountDetailsOpen(false)}
        source={activeSource}
      />

      {/* Adaptive Animated Splash Screen */}
      {showSplash && (
        <SplashScreen
          performanceMode={settings.performanceMode || 'medium'}
          onFinish={() => setShowSplash(false)}
        />
      )}
    </div>
  );
}
