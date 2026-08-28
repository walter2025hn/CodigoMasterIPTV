import React, { useMemo, useState, useEffect } from 'react';
import {
  Clapperboard,
  Search,
  Star,
  Play,
  Heart,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Tv,
  ListVideo,
  RefreshCw,
} from 'lucide-react';
import {
  ChannelItem,
  PlaylistSource,
  UserSettings,
  XtreamEpisode,
  XtreamSeriesDetail,
} from '../../types/iptv';
import { XtreamService } from '../../services/xtreamService';
import { PosterImage } from '../Common/PosterImage';

interface SeriesViewProps {
  series: ChannelItem[];
  activeSource: PlaylistSource | null;
  onPlayEpisode: (channelItem: ChannelItem, seasonNum?: number, epNum?: number) => void;
  favorites: string[];
  onToggleFavorite: (seriesItem: ChannelItem) => void;
  searchQuery: string;
  settings: UserSettings;
  onSyncSeries?: () => void;
  isSyncing?: boolean;
}

const ITEMS_PER_PAGE = 50;

export const SeriesView: React.FC<SeriesViewProps> = ({
  series,
  activeSource,
  onPlayEpisode,
  favorites,
  onToggleFavorite,
  searchQuery,
  settings,
  onSyncSeries,
  isSyncing = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categorySearch, setCategorySearch] = useState<string>('');

  // Selected series for modal
  const [selectedSeries, setSelectedSeries] = useState<ChannelItem | null>(null);
  const [seriesDetails, setSeriesDetails] = useState<XtreamSeriesDetail | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('1');
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchQuery]);

  // Group & count categories
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    series.forEach((s) => {
      const grp = s.group || 'Series';
      map.set(grp, (map.get(grp) || 0) + 1);
    });

    const list = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return [{ name: 'Todas las Series', count: series.length, key: 'all' }, ...list];
  }, [series]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Filtered series
  const filteredSeries = useMemo(() => {
    return series.filter((s) => {
      if (selectedCategory !== 'all' && (s.group || 'Series') !== selectedCategory) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = s.name.toLowerCase().includes(q);
        const matchGenre = (s.genre || '').toLowerCase().includes(q);
        const matchGroup = (s.group || '').toLowerCase().includes(q);
        return matchTitle || matchGenre || matchGroup;
      }
      return true;
    });
  }, [series, selectedCategory, searchQuery]);

  // Paginated visible series (50 by 50 to prevent freezing)
  const visibleSeries = useMemo(() => {
    return filteredSeries.slice(0, visibleCount);
  }, [filteredSeries, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredSeries.length));
  };

  const handleLoadAll = () => {
    setVisibleCount(filteredSeries.length);
  };

  // Handle open series detail
  const handleOpenSeries = async (item: ChannelItem) => {
    setSelectedSeries(item);
    setSeriesDetails(null);
    setSelectedSeason('1');

    if (activeSource?.type === 'xtream' && item.streamId) {
      setIsLoadingDetails(true);
      try {
        const detail = await XtreamService.getSeriesInfo(
          activeSource,
          item.streamId,
          settings.useProxy
        );
        if (detail) {
          setSeriesDetails(detail);
          const firstSeasonKey = Object.keys(detail.episodes || {})[0] || '1';
          setSelectedSeason(firstSeasonKey);
        }
      } catch (err) {
        console.error('Error fetching series details:', err);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-3 lg:p-5 overflow-y-auto lg:overflow-hidden min-h-0 pb-24 lg:pb-5">
      {/* Mobile Category Quick Chips (visible on < lg) */}
      <div className="lg:hidden flex flex-col gap-2 shrink-0 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Categorías ({categories.length - 1})
            </span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] text-purple-400 font-semibold hover:underline"
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
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-purple-800 text-purple-200' : 'bg-zinc-800 text-zinc-400'
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
            <Clapperboard className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Categorías de Series
            </span>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500">
            {categories.length - 1} grupos
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Filtrar categorías..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/80 text-xs text-zinc-200 placeholder-zinc-500 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500"
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
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isSelected ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Series Grid */}
      <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col min-h-0 lg:overflow-hidden">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Series ({visibleSeries.length} de {filteredSeries.length})
            </h3>
          </div>
          {filteredSeries.length > visibleCount && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
              Carga rápida activa (50 en 50)
            </span>
          )}
        </div>

        {isSyncing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
            <h4 className="text-base font-bold text-white mb-1">Cargando Series de TV</h4>
            <p className="text-xs text-zinc-400 max-w-sm">
              Descargando y organizando el catálogo completo de series y temporadas desde tu servidor IPTV...
            </p>
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <Clapperboard className="w-8 h-8 stroke-1" />
            </div>
            <p className="text-base font-bold text-zinc-200 mb-1">
              {series.length === 0
                ? 'No hay series cargadas'
                : 'No se encontraron series en esta categoría'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mb-5 leading-relaxed">
              {series.length === 0
                ? 'Puedes sincronizar el catálogo de series directamente desde tu servidor Xtream Codes haciendo clic abajo.'
                : 'Prueba seleccionando otra categoría de la barra lateral o limpiando el filtro de búsqueda.'}
            </p>

            {onSyncSeries && (
              <button
                onClick={onSyncSeries}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sincronizar Series del Servidor</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 lg:overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 pb-4">
              {visibleSeries.map((item) => {
                const isFav = favorites.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenSeries(item)}
                    className="group relative bg-zinc-950/80 border border-zinc-800/80 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer flex flex-col"
                  >
                    {/* Poster Image with Robust Fallback */}
                    <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                      <PosterImage
                        src={item.logo}
                        alt={item.name}
                        type="series"
                        year={item.releaseDate}
                        category={item.group}
                      />

                      {/* Rating Badge */}
                      {item.rating && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-amber-400 text-[11px] font-bold flex items-center gap-1 z-20">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{item.rating}</span>
                        </div>
                      )}

                      {/* Favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item);
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md border transition-all z-20 ${
                          isFav
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                            : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
                      </button>

                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <div className="px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                          <span>Ver Episodios</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Title & Info */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                        <span>{item.releaseDate || 'Serie'}</span>
                        <span className="truncate max-w-[80px] text-zinc-500">{item.group}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls (50 in 50) */}
            {filteredSeries.length > visibleCount && (
              <div className="py-6 flex flex-col items-center justify-center gap-3 border-t border-zinc-800/80 mt-2">
                <p className="text-xs text-zinc-400">
                  Mostrando <strong className="text-white">{visibleSeries.length}</strong> de <strong className="text-white">{filteredSeries.length}</strong> series disponibles
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadMore}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Cargar más (+50 series)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {filteredSeries.length > visibleCount + 50 && (
                    <button
                      onClick={handleLoadAll}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all cursor-pointer border border-zinc-700 active:scale-95"
                    >
                      Cargar Todas ({filteredSeries.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Series Detail & Episodes Modal */}
      {selectedSeries && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 lg:p-6">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header / Backdrop banner */}
            <div className="relative p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-purple-950/30 to-zinc-900 flex flex-col md:flex-row gap-5 items-start">
              <button
                onClick={() => setSelectedSeries(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="w-28 shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-xl bg-zinc-900 border border-zinc-800 hidden sm:block">
                <PosterImage
                  src={selectedSeries.logo}
                  alt={selectedSeries.name}
                  type="series"
                  year={selectedSeries.releaseDate}
                  category={selectedSeries.group}
                />
              </div>

              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                    SERIE DE TV
                  </span>
                  {selectedSeries.rating && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {selectedSeries.rating}
                    </span>
                  )}
                  {selectedSeries.genre && (
                    <span className="text-xs text-zinc-400 truncate">{selectedSeries.genre}</span>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-white mb-2">{selectedSeries.name}</h2>
                <p className="text-xs text-zinc-300 leading-relaxed max-h-16 overflow-y-auto">
                  {selectedSeries.plot ||
                    'Selecciona un capítulo de la temporada para comenzar a reproducir de inmediato.'}
                </p>
              </div>
            </div>

            {/* Content: Season selector & Episode list */}
            <div className="flex-1 overflow-hidden flex flex-col p-4">
              {isLoadingDetails ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-3" />
                  <span className="text-xs text-zinc-400">Cargando temporadas y capítulos...</span>
                </div>
              ) : seriesDetails && seriesDetails.episodes ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Season Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-zinc-800 shrink-0">
                    {Object.keys(seriesDetails.episodes).map((seasonKey) => (
                      <button
                        key={seasonKey}
                        onClick={() => setSelectedSeason(seasonKey)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide shrink-0 transition-all cursor-pointer ${
                          selectedSeason === seasonKey
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        Temporada {seasonKey}
                      </button>
                    ))}
                  </div>

                  {/* Episodes Grid */}
                  <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(seriesDetails.episodes[selectedSeason] || []).map((ep) => (
                      <div
                        key={ep.id}
                        onClick={() => {
                          if (ep.streamUrl) {
                            const epItem: ChannelItem = {
                              id: `${selectedSeries.id}-s${selectedSeason}-e${ep.episode_num}`,
                              name: `${selectedSeries.name} - T${selectedSeason}:E${ep.episode_num} ${ep.title}`,
                              streamType: 'series',
                              url: ep.streamUrl,
                              logo: ep.info?.movie_image || ep.info?.cover_big || selectedSeries.logo,
                              group: `Temporada ${selectedSeason}`,
                              sourceId: selectedSeries.sourceId,
                            };
                            onPlayEpisode(epItem, parseInt(selectedSeason), ep.episode_num);
                            setSelectedSeries(null);
                          }
                        }}
                        className="group bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 rounded-xl p-3 flex flex-col justify-between hover:bg-zinc-800/80 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                            E{ep.episode_num}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                              {ep.title || `Capítulo ${ep.episode_num}`}
                            </h4>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                              {ep.info?.plot || 'Reproducir capítulo completo en alta definición.'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                          <span>{ep.info?.duration || 'HD'}</span>
                          <span className="flex items-center gap-1 text-purple-400 font-semibold group-hover:underline">
                            <Play className="w-3 h-3 fill-purple-400" />
                            Reproducir
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Fallback for M3U single stream or direct play */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <Clapperboard className="w-10 h-10 text-purple-400 mb-2" />
                  <h4 className="text-sm font-bold text-white mb-1">Reproducir Serie</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mb-4">
                    Inicia la reproducción del contenido multimedia de esta serie.
                  </p>
                  <button
                    onClick={() => {
                      if (selectedSeries.url) {
                        onPlayEpisode(selectedSeries);
                        setSelectedSeries(null);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Iniciar Reproducción</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
