import React, { useState } from 'react';
import {
  Smartphone,
  Github,
  Check,
  Copy,
  Terminal,
  Download,
  ExternalLink,
  ShieldCheck,
  Tv,
  CheckCircle2,
} from 'lucide-react';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const gitCommands = `# 1. Inicializar repositorio y subir a GitHub
git init
git add .
git commit -m "feat: Codigo Master IPTV con soporte M3U y Xtream Codes"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/codigo-master-iptv.git
git push -u origin main`;

  const localCapacitorCommands = `# 1. Compilar aplicación web
npm run build

# 2. Instalar Capacitor para Android
npm install @capacitor/core @capacitor/android @capacitor/cli

# 3. Inicializar y abrir proyecto en Android Studio
npx cap add android
npx cap sync
npx cap open android`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-950 via-indigo-950/20 to-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black border border-indigo-500/40 overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <img src="/logo.png" alt="Codigo Master IPTV Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Compilar APK (Codigo Master IPTV)</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Configurado
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Tu proyecto ya incluye <code className="text-indigo-300">.github/workflows/build-apk.yml</code> e icono personalizado
              </p>
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
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-300">
          {/* Step 1: Push to GitHub */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                  1
                </span>
                <Github className="w-4 h-4 text-indigo-400" />
                <span>Subir código a tu repositorio de GitHub</span>
              </div>

              <button
                onClick={() => copyToClipboard(gitCommands, 'git')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSection === 'git' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Comandos</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-zinc-950 rounded-lg font-mono text-[11px] text-indigo-300 overflow-x-auto border border-zinc-800/80 leading-relaxed">
              {gitCommands}
            </pre>
          </div>

          {/* Step 2: GitHub Action Automatic Build */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Compilación Automática con GitHub Actions</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Al hacer <code className="text-indigo-300 bg-zinc-900 px-1.5 py-0.5 rounded">git push</code>, GitHub ejecutará automáticamente el archivo de flujo de trabajo <code className="text-indigo-300 bg-zinc-900 px-1.5 py-0.5 rounded">.github/workflows/build-apk.yml</code>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px] pl-1">
              <li>Ve a la pestaña <strong>Actions</strong> en tu repositorio de GitHub.</li>
              <li>Selecciona el workflow <strong>"Build Android APK - Codigo Master IPTV"</strong>.</li>
              <li>Al finalizar (aproximadamente 2-3 minutos), descarga el archivo <strong>"Codigo-Master-IPTV-Debug-APK"</strong> en la sección <strong>Artifacts</strong>.</li>
              <li>Instala el archivo <code className="text-emerald-400">app-debug.apk</code> en tu teléfono Android, Smart TV o TV Box.</li>
            </ul>
          </div>

          {/* Step 3: Local build alternative */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-5 h-5 rounded-full bg-zinc-700 text-white flex items-center justify-center text-xs">
                  3
                </span>
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Opción 2: Compilar localmente con Android Studio</span>
              </div>

              <button
                onClick={() => copyToClipboard(localCapacitorCommands, 'local')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSection === 'local' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Comandos</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-zinc-950 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto border border-zinc-800/80 leading-relaxed">
              {localCapacitorCommands}
            </pre>
          </div>

          {/* TV Remote & APK Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-2.5">
              <Tv className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-white text-xs">Compatible con Smart TV & TV Box</h5>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Navegación adaptada a controles remotos D-Pad, teclado y pantallas táctiles.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-white text-xs">Reproducción de Alta Compatibilidad</h5>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Motor HLS.js integrado que reproduce transmisiones sin bloqueo de CORS.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
