import React, { useState } from 'react';
import {
  Heart,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  Phone,
  Video,
  Sparkles,
  DollarSign,
  Share2,
} from 'lucide-react';

interface SupportCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CREATOR_LINKS = [
  {
    id: 'paypal',
    title: 'PayPal (Donación / Apoyo)',
    subtitle: 'Apoya el desarrollo continuo de la app',
    shortUrl: 'paypal.me/WalterAntunez2012',
    fullUrl: 'https://paypal.me/WalterAntunez2012',
    accentColor: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-500/40',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    badge: 'Donar',
    icon: DollarSign,
  },
  {
    id: 'whatsapp_group',
    title: 'Comunidad WhatsApp',
    subtitle: 'Únete al grupo oficial para listas y soporte',
    shortUrl: 'chat.whatsapp.com/DPZKNaFurHWI2Yb8CTVeJj',
    fullUrl: 'https://chat.whatsapp.com/DPZKNaFurHWI2Yb8CTVeJj?s=cl&p=a&mlu=4',
    accentColor: 'from-emerald-600 to-teal-600',
    borderColor: 'border-emerald-500/40',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    badge: 'Grupo Oficial',
    icon: MessageCircle,
  },
  {
    id: 'whatsapp_direct',
    title: 'WhatsApp Contacto Directo',
    subtitle: 'Escríbeme para consultas y soporte personal (+504 8947-6293)',
    shortUrl: 'wa.me/50489476293',
    fullUrl: 'https://wa.me/50489476293',
    accentColor: 'from-green-600 to-emerald-600',
    borderColor: 'border-green-500/40',
    iconBg: 'bg-green-500/10 text-green-400 border-green-500/20',
    badge: 'Contacto',
    icon: Phone,
  },
  {
    id: 'tiktok',
    title: 'TikTok Oficial',
    subtitle: 'Tutoriales, novedades y contenido @codigomaster504',
    shortUrl: 'tiktok.com/@codigomaster504',
    fullUrl: 'https://www.tiktok.com/@codigomaster504',
    accentColor: 'from-rose-600 to-pink-600',
    borderColor: 'border-rose-500/40',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    badge: 'Seguir',
    icon: Video,
  },
];

export const SupportCreatorModal: React.FC<SupportCreatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Ambient Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 flex items-start justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <Heart className="w-6 h-6 fill-rose-500/30 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Apoya al Creador
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Comunidad
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Walter Antúnez • Código Master 504
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Links Content List */}
        <div className="p-5 sm:p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              ¡Gracias por usar la app! Tu apoyo nos ayuda a seguir actualizando canales, mejorando el reproductor y agregando nuevas funciones.
            </span>
          </p>

          <div className="space-y-3">
            {CREATOR_LINKS.map((link) => {
              const Icon = link.icon;
              const isCopied = copiedId === link.id;

              return (
                <div
                  key={link.id}
                  className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-3.5 transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${link.iconBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {link.title}
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-zinc-800 text-zinc-300">
                            {link.badge}
                          </span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">{link.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Clean Shortened Link Bar with Direct Action & Copy */}
                  <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3 py-2 mt-2 gap-2">
                    <span className="font-mono text-xs text-indigo-300 truncate select-all">
                      {link.shortUrl}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(link.id, link.fullUrl)}
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer flex items-center gap-1"
                        title="Copiar enlace"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-bold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">Copiar</span>
                          </>
                        )}
                      </button>

                      <a
                        href={link.fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Comparte con amigos y familiares</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
