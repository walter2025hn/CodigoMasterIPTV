import React, { useState } from 'react';
import {
  Tv,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize,
  Heart,
  Layers,
  Settings,
  Sparkles,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ChannelItem, PerformanceProfile, VideoQualityPreset } from '../../types/iptv';
import { Cpu, Gauge, Sliders } from 'lucide-react';
import { DateTimeWidget } from '../Common/DateTimeWidget';

interface VirtualRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChannel: ChannelItem | null;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
  onToggleMute: () => void;
  isMuted: boolean;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onToggleFullscreen: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  onSelectChannelNumber?: (num: number) => void;
  onCycleAspectRatio?: () => void;
  onToggleCategories?: () => void;
  performanceMode?: PerformanceProfile;
  onChangePerformanceMode?: (mode: PerformanceProfile) => void;
  currentQuality?: VideoQualityPreset;
  onChangeQuality?: (quality: VideoQualityPreset) => void;
}

export const VirtualRemoteModal: React.FC<VirtualRemoteModalProps> = ({
  isOpen,
  onClose,
  currentChannel,
  onNextChannel,
  onPrevChannel,
  onTogglePlay,
  isPlaying,
  onToggleMute,
  isMuted,
  onVolumeUp,
  onVolumeDown,
  onToggleFullscreen,
  onToggleFavorite,
  isFavorite,
  onSelectChannelNumber,
  onCycleAspectRatio,
  onToggleCategories,
  performanceMode = 'medium',
  onChangePerformanceMode,
  currentQuality = 'auto',
  onChangeQuality,
}) => {
  const [numInput, setNumInput] = useState<string>('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    const next = numInput + digit;
    setNumInput(next);
    if (onSelectChannelNumber) {
      const num = parseInt(next, 10);
      if (!isNaN(num)) {
        setTimeout(() => {
          onSelectChannelNumber(num);
          setNumInput('');
        }, 800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-zinc-700/80 rounded-3xl p-5 shadow-2xl flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-200 text-zinc-200">
        {/* Top Remote Header */}
        <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">CONTROL REMOTO TV</h4>
              <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                {currentChannel ? currentChannel.name : 'Listo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DateTimeWidget variant="compact" className="text-[10px]" />
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Number Input OSD */}
        {numInput && (
          <div className="w-full mb-3 bg-indigo-600/20 border border-indigo-500/40 py-1.5 px-3 rounded-xl text-center">
            <span className="text-xs text-indigo-300 font-bold">Ir a Canal: </span>
            <span className="text-sm font-black text-white">{numInput}</span>
          </div>
        )}

        {/* Quick Power Mode Selector in Remote */}
        {onChangePerformanceMode && (
          <div className="w-full mb-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 pl-1.5 text-zinc-400">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-semibold">Potencia:</span>
            </div>
            <div className="flex items-center gap-1">
              {(['potato', 'low', 'medium', 'high'] as const).map((m) => {
                const isActive = performanceMode === m;
                const label =
                  m === 'potato'
                    ? '🥔'
                    : m === 'low'
                    ? 'Bajo'
                    : m === 'medium'
                    ? 'Medio'
                    : 'Alto';
                return (
                  <button
                    key={m}
                    onClick={() => onChangePerformanceMode(m)}
                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? m === 'potato'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : m === 'low'
                          ? 'bg-emerald-600 text-white'
                          : m === 'medium'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                    title={
                      m === 'potato'
                        ? 'Modo Patata (500MB RAM)'
                        : m === 'low'
                        ? 'Modo Bajo (1GB RAM)'
                        : m === 'medium'
                        ? 'Modo Medio (Estándar)'
                        : 'Modo Alto (Máxima Calidad)'
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Video Quality Selector in Remote (480p to 4K) */}
        {onChangeQuality && (
          <div className="w-full mb-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 pl-1.5 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-semibold">Calidad:</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {(['auto', '480p', '720p', '1080p', '2k', '4k'] as const).map((q) => {
                const isActive = currentQuality === q;
                const label = q === 'auto' ? 'Auto' : q.toUpperCase();
                return (
                  <button
                    key={q}
                    onClick={() => onChangeQuality(q)}
                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all cursor-pointer ${
                      isActive
                        ? q === '4k'
                          ? 'bg-amber-500 text-black shadow-sm'
                          : q === '2k'
                          ? 'bg-purple-500 text-white shadow-sm'
                          : q === '1080p'
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Control Bar: Power, Mute, Fullscreen */}
        <div className="w-full grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={onToggleMute}
            className={`py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[9px] font-semibold">MUTE</span>
          </button>

          <button
            onClick={onTogglePlay}
            className="py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold border border-indigo-400/30 flex flex-col items-center justify-center gap-1 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span className="text-[9px] font-bold">{isPlaying ? 'PAUSA' : 'PLAY'}</span>
          </button>

          <button
            onClick={onToggleFullscreen}
            className="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Maximize className="w-4 h-4" />
            <span className="text-[9px] font-semibold">PANTALLA</span>
          </button>
        </div>

        {/* Big Circular D-Pad Controller */}
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-zinc-900 border-4 border-zinc-800 shadow-2xl flex items-center justify-center mb-4">
          {/* UP Button (CH +) */}
          <button
            onClick={onNextChannel}
            className="absolute top-2 w-14 h-12 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-t-full transition-colors cursor-pointer active:scale-95"
            title="Siguiente Canal (CH +)"
          >
            <ChevronUp className="w-7 h-7" />
          </button>

          {/* DOWN Button (CH -) */}
          <button
            onClick={onPrevChannel}
            className="absolute bottom-2 w-14 h-12 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-b-full transition-colors cursor-pointer active:scale-95"
            title="Canal Anterior (CH -)"
          >
            <ChevronDown className="w-7 h-7" />
          </button>

          {/* LEFT Button (VOL -) */}
          <button
            onClick={onVolumeDown}
            className="absolute left-2 w-12 h-14 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-l-full transition-colors cursor-pointer active:scale-95"
            title="Bajar Volumen (VOL -)"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* RIGHT Button (VOL +) */}
          <button
            onClick={onVolumeUp}
            className="absolute right-2 w-12 h-14 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-r-full transition-colors cursor-pointer active:scale-95"
            title="Subir Volumen (VOL +)"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* CENTER OK BUTTON */}
          <button
            onClick={onTogglePlay}
            className="w-18 h-18 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 hover:from-indigo-600 hover:to-indigo-400 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-indigo-600/40 border-2 border-indigo-400/40 cursor-pointer active:scale-95 transition-transform"
          >
            OK
          </button>
        </div>

        {/* Color TV Buttons (Red, Green, Yellow, Blue) */}
        <div className="w-full grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={onToggleFavorite}
            className={`py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-rose-950/60 border-rose-700/50 text-rose-300 hover:bg-rose-900/80'
            }`}
            title="Botón Rojo: Favorito"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>FAV</span>
          </button>

          <button
            onClick={onToggleCategories}
            className="py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/80 text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer"
            title="Botón Verde: Categorías"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>GUÍA</span>
          </button>

          <button
            onClick={onCycleAspectRatio}
            className="py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-300 hover:bg-amber-900/80 text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer"
            title="Botón Amarillo: Formato / Zoom"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>ZOOM</span>
          </button>

          <button
            onClick={onClose}
            className="py-1.5 rounded-lg bg-blue-950/60 border border-blue-700/50 text-blue-300 hover:bg-blue-900/80 text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer"
            title="Botón Azul: Salir"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>SALIR</span>
          </button>
        </div>

        {/* Direct Numeric Keypad (0-9) */}
        <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-2.5">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => setNumInput('')}
              className="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-[10px] font-semibold cursor-pointer"
            >
              BORRAR
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              0
            </button>
            <button
              onClick={() => {
                if (numInput && onSelectChannelNumber) {
                  onSelectChannelNumber(parseInt(numInput, 10));
                  setNumInput('');
                }
              }}
              className="py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold cursor-pointer"
            >
              ENTRAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
