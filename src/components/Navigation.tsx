import React from 'react';
import {
  Tv,
  Film,
  Clapperboard,
  Heart,
  History,
  ListVideo,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export type MainTab = 'live' | 'movies' | 'series' | 'favorites' | 'history' | 'sources';

interface NavigationProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  counts: {
    live: number;
    movies: number;
    series: number;
    favorites: number;
    history: number;
  };
  onOpenApkModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  counts,
  onOpenApkModal,
}) => {
  const tabs = [
    {
      id: 'live' as MainTab,
      label: 'En Vivo',
      icon: Tv,
      count: counts.live,
      accent: 'text-indigo-400',
      activeBg: 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-indigo-500/10',
    },
    {
      id: 'movies' as MainTab,
      label: 'Películas',
      icon: Film,
      count: counts.movies,
      accent: 'text-fuchsia-400',
      activeBg: 'bg-fuchsia-600/15 border-fuchsia-500/40 text-white shadow-fuchsia-500/10',
    },
    {
      id: 'series' as MainTab,
      label: 'Series',
      icon: Clapperboard,
      count: counts.series,
      accent: 'text-purple-400',
      activeBg: 'bg-purple-600/15 border-purple-500/40 text-white shadow-purple-500/10',
    },
    {
      id: 'favorites' as MainTab,
      label: 'Favoritos',
      icon: Heart,
      count: counts.favorites,
      accent: 'text-rose-400',
      activeBg: 'bg-rose-600/15 border-rose-500/40 text-white shadow-rose-500/10',
    },
    {
      id: 'history' as MainTab,
      label: 'Historial',
      icon: History,
      count: counts.history,
      accent: 'text-amber-400',
      activeBg: 'bg-amber-600/15 border-amber-500/40 text-white shadow-amber-500/10',
    },
    {
      id: 'sources' as MainTab,
      label: 'Mis Listas',
      icon: ListVideo,
      accent: 'text-cyan-400',
      activeBg: 'bg-cyan-600/15 border-cyan-500/40 text-white shadow-cyan-500/10',
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-950/60 border-r border-zinc-900 p-4 shrink-0 justify-between">
        <div className="space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Navegación Principal
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                  isActive
                    ? `${tab.activeBg} border shadow-lg`
                    : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? tab.accent : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  >
                    {tab.count > 999 ? `${(tab.count / 1000).toFixed(1)}k` : tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Banner for APK Build */}
        <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-purple-950/40 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Smartphone className="w-4 h-4" />
            <span>Listo para APK</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
            Sube este código a GitHub para compilar el APK de Android automáticamente.
          </p>
          <button
            onClick={onOpenApkModal}
            className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition-colors shadow-md shadow-indigo-600/20"
          >
            Ver Guía GitHub APK
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? `${tab.accent} font-semibold scale-105` : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
