import React from 'react';
import {
  ListVideo,
  Plus,
  Server,
  Link,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Tv,
  Film,
  Clapperboard,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { PlaylistSource } from '../../types/iptv';

interface SourcesManagerViewProps {
  sources: PlaylistSource[];
  activeSourceId: string;
  onSelectSource: (id: string) => void;
  onDeleteSource: (id: string) => void;
  onOpenAddModal: () => void;
  onSyncSource: (source: PlaylistSource) => void;
  isLoading: boolean;
}

export const SourcesManagerView: React.FC<SourcesManagerViewProps> = ({
  sources,
  activeSourceId,
  onSelectSource,
  onDeleteSource,
  onOpenAddModal,
  onSyncSource,
  isLoading,
}) => {
  return (
    <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 lg:p-6 flex flex-col overflow-hidden m-3 lg:m-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ListVideo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Administrador de Listas y Servidores</h3>
            <p className="text-xs text-zinc-400">
              Gestiona tus cuentas Xtream Codes y listas M3U / M3U8 ({sources.length} configuradas)
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Nueva Lista / Xtream</span>
        </button>
      </div>

      {/* Sources List Grid */}
      <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sources.map((source) => {
          const isActive = source.id === activeSourceId;
          const isXtream = source.type === 'xtream';

          return (
            <div
              key={source.id}
              tabIndex={0}
              role="button"
              onClick={() => onSelectSource(source.id)}
              onFocus={(e) => {
                e.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSource(source.id);
                }
              }}
              className={`relative bg-zinc-950/90 border rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                isActive
                  ? 'border-indigo-500/60 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              {/* Top Row: Icon, Name, Type Pill, Active Badge */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isXtream
                          ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                          : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                      }`}
                    >
                      {isXtream ? <Server className="w-5 h-5" /> : <Link className="w-5 h-5" />}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{source.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        {source.type.toUpperCase()} {isXtream ? 'Codes API' : 'Playlist'}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVA
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-medium">Inactiva</span>
                  )}
                </div>

                {/* Sub info */}
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60 space-y-1 text-xs">
                  {isXtream ? (
                    <>
                      <div className="flex justify-between text-zinc-400">
                        <span>Servidor:</span>
                        <span className="font-mono text-zinc-200 truncate max-w-[160px]">
                          {source.serverUrl}
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Usuario:</span>
                        <span className="font-mono text-zinc-200">{source.username}</span>
                      </div>
                      {source.accountInfo?.user_info?.exp_date && (
                        <div className="flex justify-between text-zinc-400">
                          <span>Vence:</span>
                          <span className="text-indigo-400 font-medium">
                            {parseInt(source.accountInfo.user_info.exp_date, 10) > 0
                              ? new Date(
                                  parseInt(source.accountInfo.user_info.exp_date, 10) * 1000
                                ).toLocaleDateString()
                              : 'Ilimitada'}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-zinc-400">
                      <span>Origen:</span>
                      <span className="font-mono text-zinc-200 truncate max-w-[180px]">
                        {source.url || 'Archivo local subido'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Counts */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                    <Tv className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-0.5" />
                    <span className="text-[11px] font-bold text-zinc-200 block">
                      {source.channelCount || 0}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase">En Vivo</span>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                    <Film className="w-3.5 h-3.5 text-fuchsia-400 mx-auto mb-0.5" />
                    <span className="text-[11px] font-bold text-zinc-200 block">
                      {source.moviesCount || 0}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase">Películas</span>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                    <Clapperboard className="w-3.5 h-3.5 text-purple-400 mx-auto mb-0.5" />
                    <span className="text-[11px] font-bold text-zinc-200 block">
                      {source.seriesCount || 0}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase">Series</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSyncSource(source);
                  }}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sincronizar canales"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Sincronizar</span>
                </button>

                {source.id !== 'demo-codigo-master' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`¿Eliminar la lista "${source.name}"?`)) {
                        onDeleteSource(source.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Eliminar lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
