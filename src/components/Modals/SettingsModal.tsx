import React from 'react';
import {
  Settings,
  Shield,
  Volume2,
  Maximize2,
  Tv,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Zap,
  Radio,
  Cpu,
  Gauge,
  Sparkles,
  Layers,
} from 'lucide-react';
import { UserSettings, PerformanceProfile, VideoQualityPreset } from '../../types/iptv';
import { StorageService } from '../../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetToDemo: () => void;
  onReplayIntro?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetToDemo,
  onReplayIntro,
}) => {
  if (!isOpen) return null;

  const currentPerf = settings.performanceMode || 'medium';

  const handleQualityChange = (q: VideoQualityPreset) => {
    const updated: UserSettings = { ...settings, preferredQuality: q };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handlePerformanceChange = (profile: PerformanceProfile) => {
    let suggestedBuffer = settings.bufferLength || 30;
    if (profile === 'low') suggestedBuffer = 15;
    else if (profile === 'medium') suggestedBuffer = 30;
    else if (profile === 'high') suggestedBuffer = 45;

    const updated: UserSettings = {
      ...settings,
      performanceMode: profile,
      bufferLength: suggestedBuffer,
    };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleToggleProxy = () => {
    const updated: UserSettings = { ...settings, useProxy: !settings.useProxy };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleToggleAutoPlay = () => {
    const updated: UserSettings = { ...settings, autoPlay: !settings.autoPlay };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleToggleTvMode = () => {
    const updated: UserSettings = { ...settings, tvRemoteMode: !settings.tvRemoteMode };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleAspectRatioChange = (ratio: 'auto' | '16:9' | '4:3' | 'fill' | 'contain') => {
    const updated: UserSettings = { ...settings, defaultAspectRatio: ratio };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleBufferChange = (seconds: number) => {
    const updated: UserSettings = { ...settings, bufferLength: seconds };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleClearCache = () => {
    if (window.confirm('¿Deseas vaciar el historial y caché temporal? Las listas se mantendrán.')) {
      StorageService.clearHistory();
      alert('Historial y caché limpiados correctamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuración del Reproductor</h3>
              <p className="text-xs text-zinc-400">Rendimiento, reproducción, CORS y modo TV</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* PERFORMANCE PROFILE / POTENCIA DE LA APP */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">Potencia & Rendimiento</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                {currentPerf === 'low' ? 'Bajo' : currentPerf === 'medium' ? 'Medio' : 'Alto'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Ajusta el consumo de memoria RAM, animaciones y búfer de video según la potencia de tu dispositivo.
            </p>

            {/* 3 Options: Bajo, Medio, Alto */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* BAJO */}
              <button
                onClick={() => handlePerformanceChange('low')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  currentPerf === 'low'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                    currentPerf === 'low' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-white">Bajo</span>
                <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">Ahorro RAM</span>
                <span className="text-[9px] text-zinc-500 mt-1 leading-tight">
                  TV Box 1GB & Móviles básicos
                </span>
              </button>

              {/* MEDIO */}
              <button
                onClick={() => handlePerformanceChange('medium')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  currentPerf === 'medium'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-950/50 scale-[1.02]'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                    currentPerf === 'medium' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-white">Medio</span>
                <span className="text-[9px] text-indigo-400 font-semibold mt-0.5">Equilibrado</span>
                <span className="text-[9px] text-zinc-500 mt-1 leading-tight">
                  Smart TVs & Móviles estándar
                </span>
              </button>

              {/* ALTO */}
              <button
                onClick={() => handlePerformanceChange('high')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  currentPerf === 'high'
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-950/50 scale-[1.02]'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                    currentPerf === 'high' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-white">Alto</span>
                <span className="text-[9px] text-purple-400 font-semibold mt-0.5">Máx. Calidad</span>
                <span className="text-[9px] text-zinc-500 mt-1 leading-tight">
                  PC, TV 4K & Móviles potentes
                </span>
              </button>
            </div>

            {onReplayIntro && (
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  Animación de inicio adaptada al perfil actual
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onReplayIntro();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Probar Animación</span>
                </button>
              </div>
            )}
          </div>

          {/* CORS Proxy Option */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-white">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Proxy CORS Antibloqueo</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Permite reproducir canales en navegadores web que bloquean flujos IPTV por cabeceras CORS.
              </p>
            </div>

            <button
              onClick={handleToggleProxy}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                settings.useProxy ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.useProxy ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* AutoPlay Option */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Reproducción Automática</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Inicia la transmisión en vivo inmediatamente al seleccionar un canal.
              </p>
            </div>

            <button
              onClick={handleToggleAutoPlay}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                settings.autoPlay ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.autoPlay ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* TV Remote Navigation Mode */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-white">
                <Tv className="w-4 h-4 text-purple-400" />
                <span>Modo Android TV / Control Remoto</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Optimiza el foco y tamaño de los botones para mandos a distancia.
              </p>
            </div>

            <button
              onClick={handleToggleTvMode}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                settings.tvRemoteMode ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.tvRemoteMode ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Default Aspect Ratio */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>Formato de Pantalla Predeterminado</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {(['auto', '16:9', '4:3', 'fill', 'contain'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleAspectRatioChange(r)}
                  className={`py-1.5 rounded-lg text-center uppercase font-bold text-[10px] transition-all cursor-pointer ${
                    settings.defaultAspectRatio === r
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Default Quality Setting (480p to 4K) */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Calidad de Video Predeterminada</span>
              </div>
              <span className="text-[10px] text-amber-400/90 font-bold uppercase">
                {settings.preferredQuality || 'auto'}
              </span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Selecciona el perfil de resolución preferido para la reproducción de canales y películas (480p a 4K).
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
              {([
                { id: 'auto', label: 'Auto', badge: 'Adaptable' },
                { id: '480p', label: '480p', badge: 'SD' },
                { id: '720p', label: '720p', badge: 'HD' },
                { id: '1080p', label: '1080p', badge: 'FHD' },
                { id: '2k', label: '2K', badge: 'QHD' },
                { id: '4k', label: '4K', badge: 'UHD' },
              ] as const).map((q) => {
                const isSelected = (settings.preferredQuality || 'auto') === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => handleQualityChange(q.id)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-black border-amber-400 font-black shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{q.label}</span>
                    <span className={`text-[8px] font-semibold ${isSelected ? 'text-black/80' : 'text-zinc-500'}`}>
                      {q.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buffer Length */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center font-bold text-white">
              <span>Tamaño de Buffer HLS</span>
              <span className="text-indigo-400 font-mono">{settings.bufferLength || 30}s</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={settings.bufferLength || 30}
              onChange={(e) => handleBufferChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>10s (Baja Latencia / Ahorro)</span>
              <span>30s (Estable)</span>
              <span>60s (Ultra Búfer)</span>
            </div>
          </div>

          {/* Danger zone / Reset */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleClearCache}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Limpiar Historial y Caché Temporal</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Restablecer canales demo de prueba?')) {
                  onResetToDemo();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recargar Canales Demo Gratuitos</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

