import React from 'react';
import {
  Tv,
  Plus,
  Settings,
  Search,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  RefreshCw,
  FolderPlus,
  Gauge,
  Cpu,
  Zap,
} from 'lucide-react';
import { PlaylistSource, PerformanceProfile } from '../types/iptv';
import { DateTimeWidget } from './Common/DateTimeWidget';

interface HeaderProps {
  sources: PlaylistSource[];
  activeSource: PlaylistSource | null;
  onSelectSource: (sourceId: string) => void;
  onOpenAddSource: () => void;
  onOpenApkExport?: () => void;
  onOpenSettings: () => void;
  onOpenAccountDetails?: () => void;
  onOpenVirtualRemote?: () => void;
  onReplayIntro?: () => void;
  performanceMode?: PerformanceProfile;
  onChangePerformanceMode?: (mode: PerformanceProfile) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefreshChannels: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sources,
  activeSource,
  onSelectSource,
  onOpenAddSource,
  onOpenApkExport,
  onOpenSettings,
  onOpenAccountDetails,
  onOpenVirtualRemote,
  onReplayIntro,
  performanceMode = 'medium',
  onChangePerformanceMode,
  searchQuery,
  onSearchChange,
  onRefreshChannels,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-6 py-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <button
            onClick={onReplayIntro}
            className="flex items-center gap-3 cursor-pointer group text-left border-0 bg-transparent p-0"
            title="Ver animación de inicio CODIGO MASTER IPTV"
          >
            <div className={`relative w-11 h-11 rounded-xl overflow-hidden shadow-xl border flex items-center justify-center bg-black ring-1 ring-white/10 transition-all ${
              performanceMode === 'high'
                ? 'shadow-indigo-600/40 border-indigo-400 group-hover:shadow-purple-500/50'
                : 'shadow-indigo-600/20 border-indigo-500/40'
            }`}>
              <img
                src="/logo.png"
                alt="Codigo Master IPTV"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  performanceMode !== 'low' ? 'group-hover:scale-110' : ''
                }`}
              />
              {performanceMode === 'high' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/20 pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-white via-zinc-100 to-indigo-200 bg-clip-text text-transparent group-hover:to-indigo-300 transition-colors">
                  CODIGO MASTER
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-500/40 tracking-wider uppercase shadow-sm">
                  IPTV
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                Reproductor M3U & Xtream Codes
              </p>
            </div>
          </button>

          {/* Quick APK Button on Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Quick Performance Switcher Mobile */}
            {onChangePerformanceMode && (
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                {(['potato', 'low', 'medium', 'high'] as const).map((mode) => {
                  const isActive = performanceMode === mode;
                  const label =
                    mode === 'potato'
                      ? '🥔'
                      : mode === 'low'
                      ? 'Bajo'
                      : mode === 'medium'
                      ? 'Medio'
                      : 'Alto';
                  return (
                    <button
                      key={mode}
                      onClick={() => onChangePerformanceMode(mode)}
                      className={`px-1.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? mode === 'potato'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : mode === 'low'
                            ? 'bg-emerald-600 text-white'
                            : mode === 'medium'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-purple-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={
                        mode === 'potato'
                          ? 'Modo Patata (500MB RAM / Ultra Ahorro)'
                          : mode === 'low'
                          ? 'Modo Bajo (1GB RAM)'
                          : mode === 'medium'
                          ? 'Modo Medio (Equilibrado)'
                          : 'Modo Alto (Máxima Calidad)'
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={onOpenAddSource}
              className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
              title="Añadir Lista"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar canales, películas, series..."
            className="w-full pl-9 pr-8 py-2 bg-zinc-900/90 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 px-1 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Active Source Selector, Date/Time & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Live Date & Time Widget (Clock & Calendar) */}
          <DateTimeWidget variant="header" />

          {/* 4 POTENCIA DE LA APP OPTIONS (PATATA | BAJO | MEDIO | ALTO) */}
          {onChangePerformanceMode && (
            <div
              className="hidden lg:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 shadow-inner"
              title="Potencia de la app: Patata (500MB RAM / TV Box ultra básica) | Bajo (1GB RAM) | Medio (Estándar) | Alto (Máxima calidad)"
            >
              <div className="flex items-center gap-1 px-1 text-zinc-400">
                <Gauge className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-semibold text-zinc-400 hidden 2xl:inline">Potencia:</span>
              </div>

              {(['potato', 'low', 'medium', 'high'] as const).map((mode) => {
                const isActive = performanceMode === mode;
                const label =
                  mode === 'potato'
                    ? 'Patata'
                    : mode === 'low'
                    ? 'Bajo'
                    : mode === 'medium'
                    ? 'Medio'
                    : 'Alto';
                return (
                  <button
                    key={mode}
                    onClick={() => onChangePerformanceMode(mode)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? mode === 'potato'
                          ? 'bg-amber-600/90 text-white shadow-sm shadow-amber-500/30'
                          : mode === 'low'
                          ? 'bg-emerald-600/90 text-white shadow-sm shadow-emerald-500/20'
                          : mode === 'medium'
                          ? 'bg-indigo-600/90 text-white shadow-sm shadow-indigo-500/20'
                          : 'bg-purple-600/90 text-white shadow-sm shadow-purple-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                    title={
                      mode === 'potato'
                        ? 'Modo Patata (500MB RAM / Cero efectos / Máximo ahorro)'
                        : mode === 'low'
                        ? 'Modo Bajo (1GB RAM)'
                        : mode === 'medium'
                        ? 'Modo Medio (Equilibrado)'
                        : 'Modo Alto (Máxima Calidad)'
                    }
                  >
                    {mode === 'potato' && <span className="text-xs">🥔</span>}
                    {mode === 'low' && <Cpu className="w-3 h-3" />}
                    {mode === 'medium' && <Zap className="w-3 h-3" />}
                    {mode === 'high' && <Sparkles className="w-3 h-3" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Source Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl px-2.5 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <select
              value={activeSource?.id || ''}
              onChange={(e) => onSelectSource(e.target.value)}
              className="bg-transparent text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              {sources.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-200">
                  {s.name} ({s.type.toUpperCase()})
                </option>
              ))}
            </select>

            {/* Refresh / Sync button */}
            <button
              onClick={onRefreshChannels}
              disabled={isLoading}
              className={`p-1 text-zinc-400 hover:text-zinc-200 transition-transform ${
                isLoading ? 'animate-spin text-indigo-400' : ''
              }`}
              title="Recargar lista"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {activeSource?.type === 'xtream' && onOpenAccountDetails && (
              <button
                onClick={onOpenAccountDetails}
                className="text-[11px] text-indigo-400 hover:underline px-1 cursor-pointer"
                title="Detalles de suscripción Xtream"
              >
                Cuenta
              </button>
            )}
          </div>

          {/* Add List / Xtream button */}
          <button
            onClick={onOpenAddSource}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Añadir Lista</span>
          </button>

          {/* Virtual Remote Control Button */}
          {onOpenVirtualRemote && (
            <button
              onClick={onOpenVirtualRemote}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="Abrir Mando / Control Remoto TV"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mando TV</span>
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

