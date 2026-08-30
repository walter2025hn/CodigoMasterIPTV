import React, { useMemo, useState, useEffect } from 'react';
import {
  Film,
  Search,
  Star,
  Play,
  Heart,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Clock,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { ChannelItem, UserSettings } from '../../types/iptv';
import { PosterImage } from '../Common/PosterImage';

interface MoviesViewProps {
  movies: ChannelItem[];
  onPlayMovie: (movie: ChannelItem) => void;
  favorites: string[];
  onToggleFavorite: (movie: ChannelItem) => void;
  searchQuery: string;
  onSyncMovies?: () => void;
  isSyncing?: boolean;
}

const ITEMS_PER_PAGE = 50;

export const MoviesView: React.FC<MoviesViewProps> = ({
  movies,
  onPlayMovie,
  favorites,
  onToggleFavorite,
  searchQuery,
  onSyncMovies,
  isSyncing = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<ChannelItem | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchQuery]);

  // Group & count categories
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    movies.forEach((m) => {
      const grp = m.group || 'Películas';
      map.set(grp, (map.get(grp) || 0) + 1);
    });

    const list = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return [{ name: 'Todas las Películas', count: movies.length, key: 'all' }, ...list];
  }, [movies]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (selectedCategory !== 'all' && (m.group || 'Películas') !== selectedCategory) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.name.toLowerCase().includes(q);
        const matchGenre = (m.genre || '').toLowerCase().includes(q);
        const matchGroup = (m.group || '').toLowerCase().includes(q);
        return matchTitle || matchGenre || matchGroup;
      }
      return true;
    });
  }, [movies, selectedCategory, searchQuery]);

  // Paginated visible movies (50 by 50 to prevent freezing)
  const visibleMovies = useMemo(() => {
    return filteredMovies.slice(0, visibleCount);
  }, [filteredMovies, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredMovies.length));
  };

  const handleLoadAll = () => {
    setVisibleCount(filteredMovies.length);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-3 lg:p-5 overflow-y-auto lg:overflow-hidden min-h-0 pb-24 lg:pb-5">
      {/* Mobile Category Quick Chips (visible on < lg) */}
      <div className="lg:hidden flex flex-col gap-2 shrink-0 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Géneros ({categories.length - 1})
            </span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] text-fuchsia-400 font-semibold hover:underline"
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
                    ? 'bg-fuchsia-600 text-white font-bold shadow-md shadow-fuchsia-600/30'
                    : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-fuchsia-800 text-fuchsia-200' : 'bg-zinc-800 text-zinc-400'
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
            <Film className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Géneros & Grupos
            </span>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500">
            {categories.length - 1} géneros
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Filtrar géneros..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/80 text-xs text-zinc-200 placeholder-zinc-500 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-fuchsia-500"
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
                    ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isSelected ? 'bg-fuchsia-500 text-white' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col min-h-0 lg:overflow-hidden">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-fuchsia-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Películas ({visibleMovies.length} de {filteredMovies.length})
            </h3>
          </div>
          {filteredMovies.length > visibleCount && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 font-medium">
              Carga rápida activa (50 en 50)
            </span>
          )}
        </div>

        {isSyncing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 border-3 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin mb-4" />
            <h4 className="text-base font-bold text-white mb-1">Cargando Películas VOD</h4>
            <p className="text-xs text-zinc-400 max-w-sm">
              Descargando y organizando el catálogo completo de películas desde tu servidor IPTV...
            </p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-4 text-fuchsia-400">
              <Film className="w-8 h-8 stroke-1" />
            </div>
            <p className="text-base font-bold text-zinc-200 mb-1">
              {movies.length === 0
                ? 'No hay películas cargadas'
                : 'No se encontraron películas en esta categoría'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mb-5 leading-relaxed">
              {movies.length === 0
                ? 'Puedes sincronizar el catálogo VOD directamente desde tu servidor Xtream Codes haciendo clic abajo.'
                : 'Prueba seleccionando otra categoría de la barra lateral o limpiando el filtro de búsqueda.'}
            </p>

            {onSyncMovies && (
              <button
                onClick={onSyncMovies}
                className="px-5 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-600/30 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sincronizar Películas del Servidor</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 lg:overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 pb-4">
              {visibleMovies.map((movie) => {
                const isFav = favorites.includes(movie.id);

                return (
                  <div
                    key={movie.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedMovieForDetail(movie)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedMovieForDetail(movie);
                      }
                    }}
                    className="group relative bg-zinc-950/80 border border-zinc-800/80 hover:border-fuchsia-500/50 focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:outline-none rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/10 cursor-pointer flex flex-col"
                  >
                    {/* Poster Image with Robust Fallback */}
                    <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                      <PosterImage
                        src={movie.logo}
                        alt={movie.name}
                        type="movie"
                        year={movie.releaseDate}
                        category={movie.group}
                      />

                      {/* Rating Badge */}
                      {movie.rating && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-amber-400 text-[11px] font-bold flex items-center gap-1 z-20">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{movie.rating}</span>
                        </div>
                      )}

                      {/* Favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(movie);
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md border transition-all z-20 ${
                          isFav
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                            : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
                      </button>

                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayMovie(movie);
                          }}
                          className="w-12 h-12 rounded-full bg-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-fuchsia-600/40 transform scale-75 group-hover:scale-100 transition-transform"
                        >
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Info */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-fuchsia-300 transition-colors">
                        {movie.name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                        <span>{movie.releaseDate || 'VOD'}</span>
                        <span className="truncate max-w-[80px] text-zinc-500">{movie.group}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls (50 in 50) */}
            {filteredMovies.length > visibleCount && (
              <div className="py-6 flex flex-col items-center justify-center gap-3 border-t border-zinc-800/80 mt-2">
                <p className="text-xs text-zinc-400">
                  Mostrando <strong className="text-white">{visibleMovies.length}</strong> de <strong className="text-white">{filteredMovies.length}</strong> películas disponibles
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadMore}
                    className="px-5 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Cargar más (+50 películas)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {filteredMovies.length > visibleCount + 50 && (
                    <button
                      onClick={handleLoadAll}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all cursor-pointer border border-zinc-700 active:scale-95"
                    >
                      Cargar Todas ({filteredMovies.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Movie Details Modal */}
      {selectedMovieForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setSelectedMovieForDetail(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row gap-6 p-6">
              {/* Poster */}
              <div className="w-44 shrink-0 mx-auto md:mx-0 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800">
                <PosterImage
                  src={selectedMovieForDetail.logo}
                  alt={selectedMovieForDetail.name}
                  type="movie"
                  year={selectedMovieForDetail.releaseDate}
                  category={selectedMovieForDetail.group}
                />
              </div>

              {/* Details info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 text-[10px] font-bold">
                      PELÍCULA VOD
                    </span>
                    {selectedMovieForDetail.releaseDate && (
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {selectedMovieForDetail.releaseDate}
                      </span>
                    )}
                    {selectedMovieForDetail.rating && (
                      <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {selectedMovieForDetail.rating}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {selectedMovieForDetail.name}
                  </h3>

                  <p className="text-xs text-zinc-400 mb-4 line-clamp-4 leading-relaxed">
                    {selectedMovieForDetail.plot ||
                      'Sin sinopsis disponible para este título. ¡Disfruta de la reproducción directa en alta definición!'}
                  </p>

                  <div className="space-y-1.5 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Género / Grupo:</span>
                      <span className="font-semibold text-zinc-200">
                        {selectedMovieForDetail.group}
                      </span>
                    </div>
                    {selectedMovieForDetail.containerExtension && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Formato de Video:</span>
                        <span className="font-mono text-[11px] uppercase text-fuchsia-400 font-bold">
                          {selectedMovieForDetail.containerExtension}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      onPlayMovie(selectedMovieForDetail);
                      setSelectedMovieForDetail(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/30 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Reproducir Ahora</span>
                  </button>

                  <button
                    onClick={() => onToggleFavorite(selectedMovieForDetail)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      favorites.includes(selectedMovieForDetail.id)
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(selectedMovieForDetail.id) ? 'fill-rose-400' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
