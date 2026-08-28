import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Settings,
  Heart,
  Radio,
  Tv,
  Layers,
  Sparkles,
  AlertTriangle,
  Info,
  Maximize2,
} from 'lucide-react';
import { ChannelItem, UserSettings } from '../../types/iptv';

interface VideoPlayerProps {
  channel: ChannelItem | null;
  settings: UserSettings;
  isFavorite: boolean;
  onToggleFavorite: (channel: ChannelItem) => void;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
  onClose?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  settings,
  isFavorite,
  onToggleFavorite,
  onNextChannel,
  onPrevChannel,
  onClose,
  onProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(settings.volume ?? 1);
  const [isMuted, setIsMuted] = useState<boolean>(settings.muted ?? false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'auto' | '16:9' | '4:3' | 'fill' | 'contain'>(
    settings.defaultAspectRatio || 'auto'
  );
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  // Tracks & Qualities
  const [levels, setLevels] = useState<{ id: number; name: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 is Auto
  const [audioTracks, setAudioTracks] = useState<{ id: number; name: string }[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0);
  const [isProxyUsed, setIsProxyUsed] = useState<boolean>(settings.useProxy);

  // Determine stream URL with proxy fallback
  const getStreamUrl = (targetUrl: string, useProxy: boolean): string => {
    if (!targetUrl) return '';
    if (useProxy) {
      return `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    }
    return targetUrl;
  };

  // Video Load & HLS Init
  useEffect(() => {
    if (!channel || !channel.url) return;

    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setHasError(null);
    setLevels([]);
    setAudioTracks([]);

    const streamUrl = getStreamUrl(channel.url, isProxyUsed);

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream =
      channel.url.toLowerCase().includes('.m3u8') ||
      channel.url.toLowerCase().includes('/live/') ||
      channel.streamType === 'live';

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: settings.bufferLength || 30,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        const mappedLevels = data.levels.map((lvl, index) => ({
          id: index,
          name: lvl.height ? `${lvl.height}p` : `Calidad ${index + 1}`,
        }));
        setLevels(mappedLevels);

        if (settings.autoPlay) {
          video.play().catch(() => setIsPlaying(false));
        }
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        const tracks = data.audioTracks.map((track) => ({
          id: track.id,
          name: track.name || track.lang || `Pista ${track.id + 1}`,
        }));
        setAudioTracks(tracks);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try toggling proxy once on network error
              if (!isProxyUsed) {
                console.warn('Network error, retrying with CORS proxy...');
                setIsProxyUsed(true);
              } else {
                setHasError('Error de red o transmisión no disponible.');
                hls.destroy();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              setHasError('No se pudo reproducir la transmisión.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHlsStream) {
      // Native Safari / H5 direct playback
      video.src = streamUrl;
      video.load();
      if (settings.autoPlay) {
        video.play().catch(() => setIsPlaying(false));
      }
      setIsLoading(false);
    } else {
      setHasError('Formato no soportado por este navegador.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel?.id, channel?.url, isProxyUsed]);

  // Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress) {
        onProgress(video.currentTime, video.duration || 0);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
    };
    const onError = () => {
      if (!isProxyUsed) {
        setIsProxyUsed(true);
      } else {
        setHasError('Error al reproducir el flujo multimedia.');
      }
      setIsLoading(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
    };
  }, [onProgress, isProxyUsed]);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Controls auto-hide on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
      }
    }, 3500);
  };

  // Playback handlers
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleLevelChange = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
    }
    setShowSettingsMenu(false);
  };

  const handleAudioTrackChange = (trackId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudioTrack(trackId);
    }
    setShowSettingsMenu(false);
  };

  // Keyboard navigation & Android TV remote
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'ArrowRight':
          if (channel?.streamType !== 'live' && videoRef.current) {
            e.preventDefault();
            videoRef.current.currentTime += 10;
          }
          break;
        case 'ArrowLeft':
          if (channel?.streamType !== 'live' && videoRef.current) {
            e.preventDefault();
            videoRef.current.currentTime -= 10;
          }
          break;
        case 'PageUp':
          if (onPrevChannel) {
            e.preventDefault();
            onPrevChannel();
          }
          break;
        case 'PageDown':
          if (onNextChannel) {
            e.preventDefault();
            onNextChannel();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isMuted, channel]);

  // Format time for VOD
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '00:00';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Video aspect ratio CSS class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video object-cover';
      case '4:3':
        return 'aspect-[4/3] object-contain';
      case 'fill':
        return 'w-full h-full object-fill';
      case 'contain':
        return 'w-full h-full object-contain';
      case 'auto':
      default:
        return 'w-full h-full object-contain';
    }
  };

  if (!channel) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80 rounded-2xl border border-zinc-900 p-8 text-center min-h-[360px]">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900/90 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 shadow-xl shadow-indigo-500/5">
          <Tv className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Ningún canal seleccionado</h3>
        <p className="text-xs text-zinc-400 max-w-sm">
          Selecciona un canal de la lista en vivo, película o serie para comenzar a reproducir.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group select-none min-h-[300px] max-h-[85vh]"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        onClick={togglePlay}
        className={`${getAspectRatioClass()} max-h-full cursor-pointer`}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs z-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin mb-3 shadow-lg shadow-indigo-500/20" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200 uppercase bg-zinc-950/70 px-3 py-1 rounded-full border border-zinc-800">
            Conectando Transmisión...
          </span>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md z-20 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3 text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">Error de Reproducción</h4>
          <p className="text-xs text-zinc-400 mb-4 max-w-md">{hasError}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setHasError(null);
                setIsProxyUsed(!isProxyUsed);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar con {isProxyUsed ? 'Conexión Directa' : 'Proxy CORS'}</span>
            </button>
            {onNextChannel && (
              <button
                onClick={onNextChannel}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Siguiente Canal
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Overlay: Channel Info & Fast Actions */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-20 flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-10 h-10 object-contain rounded-lg bg-zinc-900/80 border border-white/10 p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Tv className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md">
                {channel.name}
              </h2>
              {channel.streamType === 'live' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  EN VIVO
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 drop-shadow-sm">{channel.group}</p>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(channel)}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
            }`}
            title={isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
          </button>

          {/* Close button if modal or popout */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-all cursor-pointer"
              title="Cerrar reproductor"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 z-20 space-y-2.5 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* VOD / Series Seek Bar */}
        {channel.streamType !== 'live' && duration > 0 && (
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
            />
            <div className="flex justify-between text-[11px] font-medium text-zinc-400 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Main Controls Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 text-white">
          {/* Left Playback & Volume Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prev Channel */}
            {onPrevChannel && (
              <button
                onClick={onPrevChannel}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title="Canal anterior (Page Up)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="p-2 sm:p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Next Channel */}
            {onNextChannel && (
              <button
                onClick={onNextChannel}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title="Siguiente canal (Page Down)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Volume & Mute */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title={isMuted ? 'Activar sonido (M)' : 'Silenciar (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-14 sm:w-20 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hidden sm:block"
              />
            </div>
          </div>

          {/* Right Tools Group: Ratio, PiP, Settings, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Aspect Ratio Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  const ratios: ('auto' | '16:9' | '4:3' | 'fill' | 'contain')[] = [
                    'auto',
                    '16:9',
                    '4:3',
                    'fill',
                    'contain',
                  ];
                  const nextIndex = (ratios.indexOf(aspectRatio) + 1) % ratios.length;
                  setAspectRatio(ratios[nextIndex]);
                }}
                className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-semibold tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                title="Cambiar formato de pantalla"
              >
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="uppercase text-[10px]">{aspectRatio}</span>
              </button>
            </div>

            {/* Picture-in-Picture */}
            <button
              onClick={togglePiP}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer hidden sm:flex"
              title="Modo Picture-in-Picture (Ventana flotante)"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Audio & Quality Settings Menu */}
            {(levels.length > 0 || audioTracks.length > 0) && (
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                    showSettingsMenu ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title="Calidad y Pistas de Audio"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute bottom-12 right-0 w-48 bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-zinc-800 p-3 shadow-2xl space-y-3 z-30 text-xs">
                    {/* Quality */}
                    {levels.length > 0 && (
                      <div>
                        <div className="font-semibold text-zinc-400 mb-1.5 uppercase text-[10px] tracking-wider">
                          Calidad de Video
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleLevelChange(-1)}
                            className={`w-full text-left px-2 py-1 rounded-lg ${
                              currentLevel === -1
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            Automática (Recomendada)
                          </button>
                          {levels.map((lvl) => (
                            <button
                              key={lvl.id}
                              onClick={() => handleLevelChange(lvl.id)}
                              className={`w-full text-left px-2 py-1 rounded-lg ${
                                currentLevel === lvl.id
                                  ? 'bg-indigo-600 text-white font-bold'
                                  : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              {lvl.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio */}
                    {audioTracks.length > 1 && (
                      <div className="border-t border-zinc-800 pt-2">
                        <div className="font-semibold text-zinc-400 mb-1.5 uppercase text-[10px] tracking-wider">
                          Pistas de Audio
                        </div>
                        <div className="space-y-1">
                          {audioTracks.map((trk) => (
                            <button
                              key={trk.id}
                              onClick={() => handleAudioTrackChange(trk.id)}
                              className={`w-full text-left px-2 py-1 rounded-lg ${
                                currentAudioTrack === trk.id
                                  ? 'bg-indigo-600 text-white font-bold'
                                  : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              {trk.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              title={isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
