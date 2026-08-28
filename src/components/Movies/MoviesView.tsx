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
} from 'lucide-react';
import { ChannelItem, UserSettings } from '../../types/iptv';

interface MoviesViewProps {
  movies: ChannelItem[];
  onPlayMovie: (movie: ChannelItem) => void;
  favorites: string[];
  onToggleFavorite: (movie: ChannelItem) => void;
  searchQuery: string;
}

const ITEMS_PER_PAGE = 50;

export const MoviesView: React.FC<MoviesViewProps> = ({
  movies,
  onPlayMovie,
  favorites,
  onToggleFavorite,
  searchQuery,
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
    <div className="flex flex-col lg:flex-row h-full gap-4 p-3 lg:p-5 overflow-y-auto lg:overflow-hidden min-h-0">
      {/* Category Sidebar */}
      <div className="w-full lg:w-72 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 flex flex-col shrink-0 max-h-56 lg:max-h-full overflow-hidden">
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
      <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col min-h-0 overflow-hidden">
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

        {filteredMovies.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <Film className="w-12 h-12 mb-3 stroke-1 text-zinc-600" />
            <p className="text-base font-semibold text-zinc-300">No hay películas en esta categoría</p>
            <p className="text-xs text-zinc-500 mt-1">Prueba seleccionando otra categoría o limpiando la búsqueda</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 pb-4">
              {visibleMovies.map((movie) => {
                const isFav = favorites.includes(movie.id);

                return (
                  <div
                    key={movie.id}
                    onClick={() => setSelectedMovieForDetail(movie)}
                    className="group relative bg-zinc-950/80 border border-zinc-800/80 hover:border-fuchsia-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/10 cursor-pointer flex flex-col"
                  >
                    {/* Poster Image */}
                    <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                      {movie.logo ? (
                        <img
                          src={movie.logo}
                          alt={movie.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 -z-0">
                        <Film className="w-8 h-8 text-zinc-700" />
                      </div>

                      {/* Rating Badge */}
                      {movie.rating && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-amber-400 text-[11px] font-bold flex items-center gap-1">
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
                        className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                          isFav
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                            : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
                      </button>

                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                    className="px-5 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-600/20 transition-all cursor-pointer"
                  >
                    <span>Cargar más (+50 películas)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {filteredMovies.length > visibleCount + 50 && (
                    <button
                      onClick={handleLoadAll}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all cursor-pointer border border-zinc-700"
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
                {selectedMovieForDetail.logo ? (
                  <img
                    src={selectedMovieForDetail.logo}
                    alt={selectedMovieForDetail.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <Film className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Details info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 text-[10px] font-bold">
                      PELÍCULA VOD
                    </span>
                    {selectedMovieForDetail.rating && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {selectedMovieForDetail.rating}
                      </span>
                    )}
                    {selectedMovieForDetail.releaseDate && (
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {selectedMovieForDetail.releaseDate}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-extrabold text-white mb-2">
                    {selectedMovieForDetail.name}
                  </h2>

                  {selectedMovieForDetail.genre && (
                    <p className="text-xs text-zinc-400 mb-3 font-medium">
                      {selectedMovieForDetail.genre}
                    </p>
                  )}

                  <p className="text-xs leading-relaxed text-zinc-300 mb-4 max-h-36 overflow-y-auto">
                    {selectedMovieForDetail.plot ||
                      'Disfruta de esta película en alta calidad a través de tu lista IPTV / Xtream Codes en Codigo Master.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      onPlayMovie(selectedMovieForDetail);
                      setSelectedMovieForDetail(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/30 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Reproducir Película</span>
                  </button>

                  <button
                    onClick={() => onToggleFavorite(selectedMovieForDetail)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      favorites.includes(selectedMovieForDetail.id)
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
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
