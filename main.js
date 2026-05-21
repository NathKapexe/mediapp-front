// ================================================================
//  main.js — MediChain Desktop (Electron)
//  Motor principal de la aplicación de escritorio.
//  Carga tu index.html directamente, sin navegador visible.
// ================================================================

const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

// Referencia global a la ventana principal
// (evita que el garbage collector la destruya)
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    // ── Tamaño de la ventana ──────────────────────────────────
    // Tu app es un diseño móvil centrado (max 430px).
    // La ventana imita la proporción de un teléfono en escritorio.
    width:  430,
    height: 900,
    minWidth:  380,
    minHeight: 700,

    // ── Aspecto de la ventana ─────────────────────────────────
    title:           'MediChain',
    backgroundColor: '#0d1b2a',   // Color de fondo mientras carga (igual que --dark)
    resizable:       true,         // Permite redimensionar
    center:          true,         // Centrar en pantalla al abrir

    // ── Barra de título ───────────────────────────────────────
    // 'default' = barra nativa del SO con botones de cerrar/minimizar
    // Cámbialo a 'hidden' si quieres una app completamente sin barra
    titleBarStyle: 'default',

    // ── Seguridad y permisos web ──────────────────────────────
    webPreferences: {
      nodeIntegration:  false,   // Tu JS del sitio NO accede a Node.js
      contextIsolation: true,    // Aislamiento de contexto (más seguro)
      devTools:         false,   // Deshabilitar DevTools en producción
                                 // (cámbialo a true si quieres debuggear)
    },

    // ── Ícono de la app (coloca tu ícono en la misma carpeta) ─
    // Windows: icon.ico  |  Mac: icon.icns  |  Linux: icon.png
    // icon: path.join(__dirname, 'icon.ico'),
  })

  // ── Cargar tu sitio web ────────────────────────────────────
  // Carga el index.html que está en la misma carpeta que main.js
  mainWindow.loadFile('index.html')

  // ── Quitar el menú nativo (Archivo, Editar, Ver…) ──────────
  // Comenta esta línea si quieres conservar el menú del sistema
  Menu.setApplicationMenu(null)

  // ── Eventos de la ventana ──────────────────────────────────
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ── Iniciar app cuando Electron esté listo ────────────────────
app.whenReady().then(() => {
  createWindow()

  // En macOS: reabrir ventana al hacer clic en el ícono del dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// ── Cerrar app cuando todas las ventanas estén cerradas ───────
// En macOS las apps normalmente NO se cierran al cerrar la ventana,
// por eso excluimos darwin (Mac). En Windows/Linux sí cerramos.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})