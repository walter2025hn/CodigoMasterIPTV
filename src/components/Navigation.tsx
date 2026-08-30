import React from 'react';
import {
  Tv,
  Film,
  Clapperboard,
  Heart,
  History,
  ListVideo,
  Sparkles,
  ExternalLink,
  DollarSign,
  MessageCircle,
  Phone,
  Video,
} from 'lucide-react';
import { DateTimeWidget } from './Common/DateTimeWidget';

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
  onOpenSupportModal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  counts,
  onOpenSupportModal,
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
          {/* Live Date & Time Widget in Sidebar */}
          <div className="mb-3">
            <DateTimeWidget variant="badge" className="w-full justify-between" />
          </div>

          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
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

        {/* Creator Support Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/30 via-zinc-900/90 to-indigo-950/30 border border-rose-500/20 text-xs shadow-lg shadow-black/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
              <span>Apoya al Creador</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
              Walter A.
            </span>
          </div>

          <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
            Únete a la comunidad, haz tus consultas y apoya el proyecto.
          </p>

          {/* Quick Icon Links with Clean Shortcuts */}
          <div className="grid grid-cols-4 gap-1.5 mb-2.5">
            <a
              href="https://paypal.me/WalterAntunez2012"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 flex flex-col items-center justify-center gap-0.5 transition-all group/btn"
              title="PayPal: paypal.me/WalterAntunez2012"
            >
              <DollarSign className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[9px] font-bold">PayPal</span>
            </a>

            <a
              href="https://chat.whatsapp.com/DPZKNaFurHWI2Yb8CTVeJj?s=cl&p=a&mlu=4"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center gap-0.5 transition-all group/btn"
              title="Grupo WhatsApp Comunidad"
            >
              <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[9px] font-bold">Grupo</span>
            </a>

            <a
              href="https://wa.me/50489476293"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 flex flex-col items-center justify-center gap-0.5 transition-all group/btn"
              title="Chat Directo WhatsApp (+504 8947-6293)"
            >
              <Phone className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[9px] font-bold">Chat</span>
            </a>

            <a
              href="https://www.tiktok.com/@codigomaster504"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 flex flex-col items-center justify-center gap-0.5 transition-all group/btn"
              title="TikTok: @codigomaster504"
            >
              <Video className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[9px] font-bold">TikTok</span>
            </a>
          </div>

          {/* Main Action Button */}
          {onOpenSupportModal ? (
            <button
              onClick={onOpenSupportModal}
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-[11px] transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Ver Todos los Enlaces</span>
            </button>
          ) : (
            <a
              href="https://paypal.me/WalterAntunez2012"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-[11px] transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 text-center"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Donar por PayPal</span>
            </a>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar with Safe Area */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 pb-safe flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
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
