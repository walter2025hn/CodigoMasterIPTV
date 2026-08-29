import React from 'react';
import { ChannelItem, UserSettings } from '../../types/iptv';
import { VideoPlayer } from './VideoPlayer';
import { X, ChevronLeft, Heart, Film, Clapperboard, Tv } from 'lucide-react';

interface PlayerOverlayModalProps {
  channel: ChannelItem | null;
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  isFavorite: boolean;
  onToggleFavorite: (channel: ChannelItem) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

export const PlayerOverlayModal: React.FC<PlayerOverlayModalProps> = ({
  channel,
  isOpen,
  onClose,
  settings,
  isFavorite,
  onToggleFavorite,
  onNext,
  onPrev,
  onProgress,
}) => {
  if (!isOpen || !channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden animate-fadeIn">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>

          <div className="flex items-center gap-2">
            {channel.streamType === 'movie' && (
              <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 text-[10px] font-bold uppercase">
                Película
              </span>
            )}
            {channel.streamType === 'series' && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold uppercase">
                Serie
              </span>
            )}
            {channel.streamType === 'live' && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                En Vivo
              </span>
            )}
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {channel.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(channel)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Favorito"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Cerrar reproductor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Stage */}
      <div className="flex-1 w-full h-full p-0 sm:p-4 flex items-center justify-center overflow-hidden bg-black">
        <div className="w-full h-full sm:max-w-6xl sm:max-h-[85vh] sm:rounded-2xl overflow-hidden shadow-2xl bg-black sm:border sm:border-zinc-800/80">
          <VideoPlayer
            channel={channel}
            settings={settings}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onNextChannel={onNext}
            onPrevChannel={onPrev}
            onClose={onClose}
            onProgress={onProgress}
          />
        </div>
      </div>
    </div>
  );
};
