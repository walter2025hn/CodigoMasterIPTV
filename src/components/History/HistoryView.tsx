import React from 'react';
import { History, Play, Trash2, Clock, Tv, Film, Clapperboard } from 'lucide-react';
import { ChannelItem, HistoryItem } from '../../types/iptv';

interface HistoryViewProps {
  history: HistoryItem[];
  onPlayItem: (item: ChannelItem) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onPlayItem,
  onClearHistory,
}) => {
  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} días`;
  };

  const formatSeconds = (secs?: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 lg:p-6 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden m-3 lg:m-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Historial de Reproducción</h3>
            <p className="text-xs text-zinc-400">
              Canales y contenidos reproducidos recientemente ({history.length})
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar Historial</span>
          </button>
        )}
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
          <History className="w-12 h-12 mb-3 stroke-1 text-zinc-600" />
          <p className="text-base font-bold text-zinc-300">Historial vacío</p>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            Los canales, películas y episodios que reproduzcas aparecerán aquí automáticamente para retomar donde los dejaste.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {history.map((item) => {
            const channelItem: ChannelItem = {
              id: item.id,
              name: item.name,
              logo: item.logo,
              group: item.group,
              url: item.url,
              streamType: item.streamType,
              sourceId: item.sourceId,
              streamId: item.streamId,
            };

            const IconType =
              item.streamType === 'movie'
                ? Film
                : item.streamType === 'series'
                ? Clapperboard
                : Tv;

            const progressPct =
              item.duration && item.currentTime
                ? Math.min(100, Math.round((item.currentTime / item.duration) * 100))
                : 0;

            return (
              <div
                key={`${item.id}-${item.timestamp}`}
                tabIndex={0}
                role="button"
                onClick={() => onPlayItem(channelItem)}
                onFocus={(e) => {
                  e.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPlayItem(channelItem);
                  }
                }}
                className="group relative bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl p-3 flex flex-col justify-between hover:bg-zinc-900/80 transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden p-1">
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <IconType className="w-5 h-5 text-zinc-500 absolute" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">{item.group}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar if movie/series with progress */}
                {progressPct > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800/80">
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                      <span>Progreso: {progressPct}%</span>
                      <span>
                        {formatSeconds(item.currentTime)} / {formatSeconds(item.duration)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
