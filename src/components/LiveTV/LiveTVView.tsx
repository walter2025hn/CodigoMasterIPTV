import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  Radio,
  Tv,
  Heart,
  Play,
  Layers,
  Sparkles,
  Flame,
  Volume2,
  ChevronDown,
} from 'lucide-react';
import { ChannelItem, UserSettings } from '../../types/iptv';
import { VideoPlayer } from '../Player/VideoPlayer';

interface LiveTVViewProps {
  channels: ChannelItem[];
  currentChannel: ChannelItem | null;
  onSelectChannel: (channel: ChannelItem) => void;
  settings: UserSettings;
  favorites: string[];
  onToggleFavorite: (channel: ChannelItem) => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  searchQuery: string;
}

const ITEMS_PER_PAGE = 50;

export const LiveTVView: React.FC<LiveTVViewProps> = ({
  channels,
  currentChannel,
  onSelectChannel,
  settings,
  favorites,
  onToggleFavorite,
  onNextChannel,
  onPrevChannel,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchQuery]);

  // Extract unique categories & counts
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    channels.forEach((ch) => {
      const grp = ch.group || 'General';
      map.set(grp, (map.get(grp) || 0) + 1);
    });

    const list = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return [{ name: 'Todos los Canales', count: channels.length, key: 'all' }, ...list];
  }, [channels]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      // Category filter
      if (selectedCategory !== 'all' && (ch.group || 'General') !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = ch.name.toLowerCase().includes(q);
        const matchGroup = (ch.group || '').toLowerCase().includes(q);
        return matchName || matchGroup;
      }
      return true;
    });
  }, [channels, selectedCategory, searchQuery]);

  // Paginated visible channels
  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredChannels.length));
  };

  const handleLoadAll = () => {
    setVisibleCount(filteredChannels.length);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-3 lg:p-5 overflow-y-auto lg:overflow-hidden min-h-0 pb-24 lg:pb-5">
      {/* Mobile Category Quick Chips (visible on < lg) */}
      <div className="lg:hidden flex flex-col gap-2 shrink-0 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Categorías ({categories.length - 1})
            </span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] text-indigo-400 font-semibold hover:underline"
            >
              Ver todos
            </button>
          )}
        </div>

        {/* Horizontal scrollable category pill bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {categories.slice(0, 25).map((cat: any) => {
            const isSelected =
              (cat.key === 'all' && selectedCategory === 'all') ||
              cat.name === selectedCategory;

            return (
              <button
                key={cat.key || cat.name}
                onClick={() => setSelectedCategory(cat.key || cat.name)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Category Sidebar (visible on lg+) */}
      <div className="hidden lg:flex w-72 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 flex-col shrink-0 h-full overflow-hidden">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Categorías
            </span>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500">
            {categories.length - 1} grupos
          </span>
        </div>

        {/* Category Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Filtrar categorías..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/80 text-xs text-zinc-200 placeholder-zinc-500 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredCategories.map((cat: any) => {
            const isSelected =
              (cat.key === 'all' && selectedCategory === 'all') ||
              cat.name === selectedCategory;

            return (
              <button
                key={cat.key || cat.name}
                onClick={() => setSelectedCategory(cat.key || cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Channels & Player Area */}
      <div className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0 lg:overflow-hidden">
        {/* Active Player Box (Mobile & Desktop View) */}
        <div className="w-full xl:w-[58%] shrink-0 flex flex-col">
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-zinc-800">
            <VideoPlayer
              channel={currentChannel}
              settings={settings}
              isFavorite={currentChannel ? favorites.includes(currentChannel.id) : false}
              onToggleFavorite={onToggleFavorite}
              onNextChannel={onNextChannel}
              onPrevChannel={onPrevChannel}
            />
          </div>

          {/* Quick channel info banner */}
          {currentChannel && (
            <div className="mt-3 p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{currentChannel.name}</h4>
                  <p className="text-xs text-zinc-400 truncate">{currentChannel.group}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={() => onToggleFavorite(currentChannel)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    favorites.includes(currentChannel.id)
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      favorites.includes(currentChannel.id) ? 'fill-rose-400' : ''
                    }`}
                  />
                  <span>Favorito</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Channel Grid / List */}
        <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 flex flex-col lg:min-h-0 lg:overflow-hidden">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Canales ({visibleChannels.length} de {filteredChannels.length})
              </span>
            </div>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            )}
          </div>

          {filteredChannels.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <Tv className="w-10 h-10 mb-2 stroke-1 text-zinc-600" />
              <p className="text-sm font-semibold">No se encontraron canales</p>
              <p className="text-xs text-zinc-500">Prueba con otra búsqueda o categoría</p>
            </div>
          ) : (
            <div className="flex-1 lg:overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2 pb-2">
                {visibleChannels.map((ch, idx) => {
                  const isPlayingThis = currentChannel?.id === ch.id;
                  const isFav = favorites.includes(ch.id);

                  return (
                    <div
                      key={ch.id}
                      onClick={() => onSelectChannel(ch)}
                      className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isPlayingThis
                          ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                          : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Logo or Icon */}
                        <div className="relative w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden p-1">
                          {ch.logo ? (
                            <img
                              src={ch.logo}
                              alt={ch.name}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <Tv className="w-4 h-4 text-zinc-500 absolute -z-0" />
                          {isPlayingThis && (
                            <div className="absolute inset-0 bg-indigo-600/70 backdrop-blur-xs flex items-center justify-center">
                              <Volume2 className="w-4 h-4 text-white animate-bounce" />
                            </div>
                          )}
                        </div>

                        {/* Channel Text */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono font-bold text-zinc-500">
                              {idx + 1}.
                            </span>
                            <h4
                              className={`text-xs font-bold truncate ${
                                isPlayingThis ? 'text-indigo-300' : 'text-zinc-200 group-hover:text-white'
                              }`}
                            >
                              {ch.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{ch.group}</p>
                        </div>
                      </div>

                      {/* Action buttons on card */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(ch);
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            isFav
                              ? 'text-rose-400 hover:bg-rose-500/20'
                              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load more if channels exceed visibleCount */}
              {filteredChannels.length > visibleCount && (
                <div className="py-4 flex flex-col items-center justify-center gap-2 border-t border-zinc-800/80 mt-3">
                  <p className="text-xs text-zinc-400">
                    Mostrando {visibleChannels.length} de {filteredChannels.length} canales
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleLoadMore}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95"
                    >
                      <span>Cargar +50 canales</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {filteredChannels.length > visibleCount + 50 && (
                      <button
                        onClick={handleLoadAll}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all cursor-pointer active:scale-95"
                      >
                        Cargar Todos ({filteredChannels.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
