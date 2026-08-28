# Codigo Master IPTV

Reproductor IPTV profesional de alto rendimiento diseñado para listas M3U/M3U8 y servidores Xtream Codes API, optimizado tanto para navegador web como para compilación nativa en APK de Android (Smartphones, Tablets y Android TV / TV Box).

---

## 🌟 Características Principales

- **Soporte Xtream Codes API**: Conexión directa mediante Servidor/Host, Usuario y Contraseña con verificación de suscripción, fecha de expiración y conexiones activas.
- **Soporte Listas M3U y M3U8**: Carga por URL remota o archivo `.m3u` local con parseo optimizado de atributos `tvg-id`, `tvg-name`, `tvg-logo` y `group-title`.
- **Organización Automática de Contenido**:
  - **En Vivo (Live TV)**: Canales organizados por categorías con buscador instantáneo y cambio rápido.
  - **Películas (VOD)**: Catálogo con pósters, sinopsis, género, puntuación y año.
  - **Series**: Explorador con selección de temporadas y capítulos independientes.
- **Reproductor Multimedia Avanzado (HLS.js)**:
  - Selector de relación de aspecto (`Auto`, `16:9`, `4:3`, `Fill`, `Contain`).
  - Selector de calidad de transmisión y cambio de pistas de audio.
  - Modo Pantalla Completa y Picture-in-Picture (PiP).
  - Proxy CORS antibloqueo integrado para transmisiones web.
- **Favoritos e Historial**: Guarda canales favoritos y reanuda películas/series donde las dejaste.
- **Navegación para Control Remoto**: Compatible con teclado y mandos D-Pad para Smart TV.

---

## 📱 Compilar APK en GitHub (Automático)

El proyecto incluye el flujo de trabajo `.github/workflows/build-apk.yml` preconfigurado:

1. Sube este repositorio a tu cuenta de GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Codigo Master IPTV"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/codigo-master-iptv.git
   git push -u origin main
   ```
2. En GitHub, ve a la pestaña **Actions**.
3. El workflow **"Build Android APK - Codigo Master IPTV"** compilará el archivo `.apk` automáticamente.
4. Descarga el archivo generado **Codigo-Master-IPTV-Debug-APK** en la sección de **Artifacts** e instálalo en tu dispositivo Android.

---

## 💻 Compilar localmente con Android Studio

```bash
# 1. Compilar aplicación
npm run build

# 2. Sincronizar y abrir en Android Studio
npx cap add android
npx cap sync
npx cap open android
```
