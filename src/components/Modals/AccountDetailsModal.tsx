import React from 'react';
import {
  Server,
  User,
  Calendar,
  Users,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Radio,
} from 'lucide-react';
import { PlaylistSource } from '../../types/iptv';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: PlaylistSource | null;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  isOpen,
  onClose,
  source,
}) => {
  if (!isOpen || !source) return null;

  const userInfo = source.accountInfo?.user_info;
  const serverInfo = source.accountInfo?.server_info;

  const formatExpiry = (timestamp?: string) => {
    if (!timestamp || timestamp === 'null' || timestamp === '') return 'Ilimitada / Sin Vencimiento';
    const num = parseInt(timestamp, 10);
    if (isNaN(num) || num <= 0) return 'Ilimitada';
    return new Date(num * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired =
    userInfo?.exp_date &&
    parseInt(userInfo.exp_date, 10) > 0 &&
    parseInt(userInfo.exp_date, 10) * 1000 < Date.now();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Detalles de la Cuenta Xtream</h3>
              <p className="text-xs text-zinc-400">{source.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isExpired
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isExpired ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span className="font-bold">
                Estado: {userInfo?.status ? userInfo.status.toUpperCase() : 'ACTIVO'}
              </span>
            </div>

            <span className="text-[11px] font-mono">
              {userInfo?.is_trial === '1' ? 'Prueba Gratuita (Trial)' : 'Cuenta Oficial'}
            </span>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Usuario</span>
              </div>
              <p className="font-bold text-white font-mono text-sm">
                {userInfo?.username || source.username || 'No disponible'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Vencimiento</span>
              </div>
              <p className="font-bold text-white text-xs">
                {formatExpiry(userInfo?.exp_date)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Conexiones</span>
              </div>
              <p className="font-bold text-white text-sm">
                {userInfo?.active_cons || '0'} / {userInfo?.max_connections || '1'} activas
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Servidor</span>
              </div>
              <p className="font-bold text-white text-xs font-mono truncate">
                {serverInfo?.url || source.serverUrl || 'Conectado'}
              </p>
            </div>
          </div>

          {/* Server Info if available */}
          {serverInfo && (
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1.5 text-zinc-400">
              <div className="flex justify-between">
                <span>Zona Horaria del Servidor:</span>
                <span className="text-white font-medium">{serverInfo.timezone || 'UTC'}</span>
              </div>
              <div className="flex justify-between">
                <span>Protocolo:</span>
                <span className="text-white font-medium uppercase">{serverInfo.server_protocol || 'HTTP'}</span>
              </div>
              <div className="flex justify-between">
                <span>Hora Servidor:</span>
                <span className="text-white font-medium">{serverInfo.time_now || 'Sincronizada'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
