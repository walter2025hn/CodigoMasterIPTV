import React, { useState } from 'react';
import { Heart, Play, Trash2, Tv, Film, Clapperboard } from 'lucide-react';
import { ChannelItem, FavoriteItem, StreamType } from '../../types/iptv';

interface FavoritesViewProps {
  favorites: FavoriteItem[];
  onPlayItem: (item: ChannelItem) => void;
  onRemoveFavorite: (channel: ChannelItem) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onPlayItem,
  onRemoveFavorite,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = favorites.filter((f) => {
    if (filterType === 'all') return true;
    return f.streamType === filterType;
  });

  return (
    <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 lg:p-6 flex flex-col overflow-hidden m-3 lg:m-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart className="w-5 h-5 fill-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Canales & Contenido Favorito</h3>
            <p className="text-xs text-zinc-400">
              Accede rápidamente a tus transmisiones, películas y series guardadas ({favorites.length})
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-rose-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todos ({favorites.length})
          </button>
          <button
            onClick={() => setFilterType('live')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'live'
                ? 'bg-rose-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            En Vivo
          </button>
          <button
            onClick={() => setFilterType('movie')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'movie'
                ? 'bg-rose-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Películas
          </button>
          <button
            onClick={() => setFilterType('series')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'series'
                ? 'bg-rose-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Series
          </button>
        </div>
      </div>

      {/* Grid or Empty */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
          <Heart className="w-12 h-12 mb-3 stroke-1 text-zinc-600" />
          <p className="text-base font-bold text-zinc-300">Aún no tienes favoritos guardados</p>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            Haz clic en el icono de corazón en cualquier canal, película o serie para tener acceso instantáneo aquí.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((fav) => {
            const channelItem: ChannelItem = {
              id: fav.id,
              name: fav.name,
              logo: fav.logo,
              group: fav.group,
              url: fav.url,
              streamType: fav.streamType,
              sourceId: fav.sourceId,
              streamId: fav.streamId,
              containerExtension: fav.containerExtension,
            };

            const IconType =
              fav.streamType === 'movie'
                ? Film
                : fav.streamType === 'series'
                ? Clapperboard
                : Tv;

            return (
              <div
                key={fav.id}
                onClick={() => onPlayItem(channelItem)}
                className="group relative bg-zinc-950/80 border border-zinc-800/80 hover:border-rose-500/50 rounded-xl p-3 flex items-center justify-between hover:bg-zinc-900/80 transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden p-1">
                    {fav.logo ? (
                      <img
                        src={fav.logo}
                        alt={fav.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <IconType className="w-5 h-5 text-zinc-500 absolute" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-rose-300 truncate">
                      {fav.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">{fav.group}</p>
                    <span className="text-[10px] font-semibold text-rose-400 uppercase">
                      {fav.streamType === 'live'
                        ? 'En Vivo'
                        : fav.streamType === 'movie'
                        ? 'Película'
                        : 'Serie'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(channelItem);
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 rounded-lg bg-rose-600/20 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
