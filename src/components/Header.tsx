import React from 'react';
import {
  Tv,
  Plus,
  Smartphone,
  Settings,
  Search,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { PlaylistSource } from '../types/iptv';

interface HeaderProps {
  sources: PlaylistSource[];
  activeSource: PlaylistSource | null;
  onSelectSource: (sourceId: string) => void;
  onOpenAddSource: () => void;
  onOpenApkExport: () => void;
  onOpenSettings: () => void;
  onOpenAccountDetails?: () => void;
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
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 border border-indigo-500/30 flex items-center justify-center bg-zinc-900">
              <img
                src="/logo.png"
                alt="Codigo Master IPTV"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback icon if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <Tv className="w-5 h-5 text-indigo-400 absolute" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  CODIGO MASTER
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 tracking-wider">
                  IPTV
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Reproductor M3U & Xtream Codes
              </p>
            </div>
          </div>

          {/* Quick APK Button on Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenApkExport}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
              title="Build APK para Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>APK</span>
            </button>
            <button
              onClick={onOpenAddSource}
              className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 px-1 py-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Active Source Selector & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
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
                className="text-[11px] text-indigo-400 hover:underline px-1"
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

          {/* APK Export Helper Button */}
          <button
            onClick={onOpenApkExport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Exportar proyecto y generar APK con GitHub"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Exportar APK</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
