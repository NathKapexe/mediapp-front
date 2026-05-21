/* ================================================================
   app.js — MediChain App del Paciente
   Lógica de navegación, UI interactiva y simulación de funciones.

   IMPORTANTE: Todo este código simula el comportamiento de la app.
   En producción se reemplazará por llamadas a una API REST/GraphQL
   con autenticación JWT y manejo de estado (React Native / Flutter).

   ÍNDICE:
   1.  Inicialización y splash
   2.  Login
   3.  Navegación entre screens
   4.  Bottom sheet (paneles deslizables)
   5.  Sub-tabs (dentro de una sección)
   6.  Colapsables
   7.  Calendario mini
   8.  Filtro de documentos
   9.  Token de acceso
   10. Notificaciones — marcar como leída
   11. Actualización de hora en status bar
   12. Header dinámico
================================================================ */


/* ================================================================
   1. INICIALIZACIÓN
   Al cargar la página, el splash se muestra brevemente (CSS lo
   maneja con animation), luego se muestra la pantalla de login.
================================================================ */
window.addEventListener('load', () => {
  // El splash tiene CSS animation de .8s → luego mostramos login
  setTimeout(() => {
    showLoginScreen();
  }, 900);

  // Actualizar reloj cada 30 segundos
  updateClock();
  setInterval(updateClock, 30000);
});


/* ================================================================
   2. LOGIN
================================================================ */

/** Muestra la pantalla de login después del splash */
function showLoginScreen() {
  document.getElementById('screen-login').classList.remove('hidden');
}

/**
 * Valida las credenciales demo y entra a la app.
 * En producción: POST /api/auth/login → JWT → localStorage
 */
function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value.trim();

  if (email === 'maria@correo.com' && pass === '12345') {
    // Animar salida del login
    const loginEl = document.getElementById('screen-login');
    loginEl.style.transition = 'opacity .4s, transform .4s';
    loginEl.style.opacity    = '0';
    loginEl.style.transform  = 'translateY(-20px)';

    setTimeout(() => {
      loginEl.classList.add('hidden');
      document.getElementById('app-shell').classList.remove('hidden');
      // Asegurarse de que el home esté activo
      navigate('home');
    }, 400);

  } else {
    // Shake animation en la card
    const card = document.querySelector('.login-card');
    card.style.animation = 'none';
    card.offsetHeight; // Forzar reflow
    card.style.animation = 'shake .35s ease';
    alert('Credenciales incorrectas.\nUsa: maria@correo.com / 12345');
  }
}

// Permitir login con Enter
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.getElementById('screen-login').classList.contains('hidden')) {
    doLogin();
  }
});


/* ================================================================
   3. NAVEGACIÓN ENTRE SCREENS
   Cada "pantalla" es un .app-screen con un id específico.
   La función navigate() activa la correcta y actualiza el header
   y la bottom nav.
================================================================ */

/**
 * Mapa de configuración de cada pantalla:
 * title       → Texto del header
 * headerAction → Función del botón derecho del header (null = oculto)
 * actionIcon  → Ícono del botón derecho
 * backTo      → Pantalla a la que regresa el botón "‹" (null = sin back btn)
 * navId       → id del botón en la bottom nav (null = no resaltar ninguno)
 */
const SCREENS = {
  home:            { title: 'Inicio',         actionIcon: '🔔', actionFn: () => navigate('notificaciones'), backTo: null,      navId: 'bn-home' },
  perfil:          { title: 'Mi Perfil',      actionIcon: '⚙️', actionFn: () => alert('Configuración — próximamente'), backTo: null, navId: 'bn-perfil' },
  documentos:      { title: 'Mis Estudios',   actionIcon: '＋',  actionFn: () => openSheet('sheet-upload'),  backTo: null,      navId: null },
  doctores:        { title: 'Mis Doctores',   actionIcon: '＋',  actionFn: () => openSheet('sheet-add-doctor'), backTo: null,   navId: null },
  citas:           { title: 'Citas',          actionIcon: '＋',  actionFn: () => openSheet('sheet-new-appt'), backTo: null,     navId: 'bn-citas' },
  medicamentos:    { title: 'Medicamentos',   actionIcon: '＋',  actionFn: () => openSheet('sheet-add-med'),  backTo: null,     navId: 'bn-medicamentos' },
  analisis:        { title: 'Próximos Estudios', actionIcon: '＋', actionFn: () => openSheet('sheet-add-study'), backTo: null,  navId: null },
  vacunas:         { title: 'Vacunas',        actionIcon: '＋',  actionFn: () => openSheet('sheet-add-vaccine'), backTo: null,  navId: null },
  notificaciones:  { title: 'Notificaciones', actionIcon: '✓',   actionFn: markAllRead, backTo: 'home',                         navId: null },
  token:           { title: 'Token de Acceso', actionIcon: '❓', actionFn: showTokenHelp, backTo: 'home',                       navId: null },
};

/** Pantalla actual y pila de navegación */
let currentScreen = 'home';
const navHistory  = [];

/**
 * Navega a la pantalla indicada.
 * @param {string} screenName - clave en SCREENS
 */
function navigate(screenName) {
  if (!SCREENS[screenName]) {
    console.warn('Pantalla no encontrada:', screenName);
    return;
  }

  // Guardar en historial si es una pantalla nueva
  if (currentScreen !== screenName) {
    navHistory.push(currentScreen);
  }

  currentScreen = screenName;

  // Ocultar todas las screens
  document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));

  // Mostrar la screen objetivo
  const target = document.getElementById('screen-' + screenName);
  if (target) target.classList.add('active');

  // Actualizar header
  updateHeader(screenName);

  // Actualizar bottom nav
  updateBottomNav(screenName);
}

/** Vuelve a la pantalla anterior o a home por defecto */
function goBack() {
  const prev = navHistory.pop() || 'home';
  navigate(prev);
}

/** Actualiza el título y botones del header */
function updateHeader(screenName) {
  const cfg = SCREENS[screenName];
  const titleEl   = document.getElementById('header-title');
  const backBtn   = document.getElementById('btn-back');
  const actionBtn = document.getElementById('header-action');

  titleEl.textContent = cfg.title;

  // Botón back: visible si la screen tiene backTo O si hay historial
  if (cfg.backTo || navHistory.length > 0) {
    backBtn.classList.remove('hidden');
  } else {
    backBtn.classList.add('hidden');
  }

  // Botón de acción derecha
  if (cfg.actionFn) {
    actionBtn.style.display = '';
    actionBtn.textContent   = cfg.actionIcon || '⚙️';
    // Guardar la función en el botón (se llama desde headerAction())
    actionBtn._fn = cfg.actionFn;
  } else {
    actionBtn.style.display = 'none';
  }
}

/** Ejecuta la acción del botón derecho del header */
function headerAction() {
  const btn = document.getElementById('header-action');
  if (btn._fn) btn._fn();
}

/** Marca el ítem activo en la bottom nav */
function updateBottomNav(screenName) {
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  const cfg = SCREENS[screenName];
  if (cfg.navId) {
    const navBtn = document.getElementById(cfg.navId);
    if (navBtn) navBtn.classList.add('active');
  }
}


/* ================================================================
   4. BOTTOM SHEETS
   Los sheets se deslizandesde abajo. Se abren con openSheet(id)
   y se cierran con closeAllSheets() o al tocar el overlay.
================================================================ */

/**
 * Abre un bottom sheet por su id.
 * @param {string} sheetId - id del elemento .bottom-sheet
 */
function openSheet(sheetId) {
  closeAllSheets(); // Solo un sheet abierto a la vez
  const sheet   = document.getElementById(sheetId);
  const overlay = document.getElementById('sheet-overlay');
  if (!sheet) return;

  overlay.classList.add('open');
  sheet.classList.add('open');

  // En pantallas anchas, el overlay y el sheet respetan el max-width
  // (manejado en CSS, pero reseteamos el transform aquí para sheets abiertos)
  if (window.innerWidth >= 500) {
    sheet.style.left      = '50%';
    sheet.style.transform = 'translateX(-50%) translateY(0)';
    sheet.style.maxWidth  = '430px';
  }
}

/** Cierra todos los sheets abiertos */
function closeAllSheets() {
  document.querySelectorAll('.bottom-sheet').forEach(s => {
    s.classList.remove('open');
    // Restaurar transform para la animación de cierre
    if (window.innerWidth >= 500) {
      s.style.transform = 'translateX(-50%) translateY(100%)';
    }
  });
  document.getElementById('sheet-overlay').classList.remove('open');
}


/* ================================================================
   5. SUB-TABS
   Pestañas internas dentro de una sección (ej. Citas: Calendario
   | Lista | Historial).
================================================================ */

/**
 * Muestra un sub-tab dentro de una sección.
 * @param {string} section   - prefijo del id del contenedor (ej. 'citas')
 * @param {string} tabId     - sufijo del id del sub-tab (ej. 'calendario')
 * @param {HTMLElement} btn  - botón clickeado (para el estado .active)
 */
function showSubTab(section, tabId, btn) {
  // Ocultar todos los sub-screens de esta sección
  // NOTA: Buscamos todos los sub-screens que empiecen con el prefijo de la sección
  document.querySelectorAll(`[id^="${section}-"]`).forEach(el => {
    el.classList.remove('active');
  });

  // Mostrar el sub-tab objetivo
  const target = document.getElementById(`${section}-${tabId}`);
  if (target) target.classList.add('active');

  // Actualizar estado de los botones dentro del mismo .sub-tabs
  const tabsContainer = btn.closest('.sub-tabs');
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.st').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}


/* ================================================================
   6. COLAPSABLES
   Cards con panel expandible/contraíble (ej. Contactos de emergencia).
================================================================ */

/**
 * Alterna el estado open/cerrado de una card colapsable.
 * @param {string} id - id del elemento .collapsible-card
 */
function toggleCollapse(id) {
  const card = document.getElementById(id);
  if (card) card.classList.toggle('open');
}


/* ================================================================
   7. CALENDARIO MINI
   Genera dinámicamente la cuadrícula del mes actual y marca
   los días con citas.
================================================================ */

/** Días del mes que tienen cita programada (simulado) */
const APPT_DAYS = [16, 20]; // Mayo 2026

/** Día seleccionado en el calendario */
let selectedCalDay = 16;

/** Genera el calendario mini con el mes actual */
function buildCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  // Usar el año/mes actual (demo fijo en Mayo 2026)
  const year  = 2026;
  const month = 4; // 0-indexed: 4 = Mayo

  const firstDay   = new Date(year, month, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today      = 16; // Demo: "hoy" es el 16 Mayo

  grid.innerHTML = '';

  // Celdas vacías para alinear el primer día
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'mc-day empty';
    grid.appendChild(empty);
  }

  // Días del mes
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'mc-day';
    cell.textContent = d;

    if (d === today) cell.classList.add('today');
    if (APPT_DAYS.includes(d)) cell.classList.add('has-appt');
    if (d === selectedCalDay) cell.classList.add('selected');

    cell.addEventListener('click', () => selectCalDay(d, cell));
    grid.appendChild(cell);
  }
}

/**
 * Selecciona un día en el calendario y actualiza la vista de citas.
 * @param {number} day
 * @param {HTMLElement} cell
 */
function selectCalDay(day, cell) {
  selectedCalDay = day;

  // Quitar .selected de todos
  document.querySelectorAll('.mc-day').forEach(c => c.classList.remove('selected'));
  cell.classList.add('selected');

  // Actualizar el label y la lista de citas del día
  const label = document.getElementById('selected-day-label');
  const list  = document.getElementById('day-appointments');

  label.textContent = `Citas del ${day} de Mayo`;

  // Buscar citas del día (demo: solo día 16 y 20 tienen citas)
  if (APPT_DAYS.includes(day)) {
    const citasDia = {
      16: `<div class="appt-item upcoming">
              <div class="ai-time">09:00</div>
              <div class="ai-info"><b>Dr. Roberto Morales</b><p>Revisión general · Consultorio 3</p></div>
              <span class="ai-status ok">Confirmada</span>
           </div>`,
      20: `<div class="appt-item upcoming">
              <div class="ai-time">11:00</div>
              <div class="ai-info"><b>Dr. Roberto Morales</b><p>Revisión post-laboratorio</p></div>
              <span class="ai-status warn">Por confirmar</span>
           </div>`
    };
    list.innerHTML = citasDia[day] || '<p class="text-muted" style="font-size:.85rem;padding:.5rem 0">Sin citas este día.</p>';
  } else {
    list.innerHTML = '<p style="font-size:.85rem;color:var(--text-muted);padding:.5rem 0">Sin citas este día.</p>';
  }
}


/* ================================================================
   8. FILTRO DE DOCUMENTOS
   Muestra/oculta documentos según el tipo seleccionado.
================================================================ */

/**
 * Filtra los .doc-item por su data-type.
 * @param {string} type  - 'all' | 'lab' | 'imagen' | 'receta'
 * @param {HTMLElement} btn - botón del filtro clickeado
 */
function filterDocs(type, btn) {
  // Actualizar estado de los botones de filtro
  document.querySelectorAll('.dft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Mostrar/ocultar items
  document.querySelectorAll('.doc-item').forEach(item => {
    if (type === 'all' || item.dataset.type === type) {
      item.style.display = '';
      item.style.animation = 'screenIn .2s ease';
    } else {
      item.style.display = 'none';
    }
  });
}


/* ================================================================
   9. TOKEN DE ACCESO MÉDICO
================================================================ */

/** Estado del token */
let tokenActive = true; // Demo: token activo por defecto

/**
 * Genera un nuevo token de acceso.
 * En producción: POST /api/token/generate con los permisos
 * seleccionados → el backend retorna el código y la vigencia.
 */
function generateToken() {
  const doctor = document.getElementById('tk-doctor').value;
  const date   = document.getElementById('tk-date').value;
  const start  = document.getElementById('tk-start').value;
  const end    = document.getElementById('tk-end').value;

  if (!date || !start || !end) {
    alert('Por favor completa fecha, hora de inicio y hora de fin.');
    return;
  }

  // Generar código aleatorio simulado (ej. MCH-4392-Y8ZX)
  const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1  = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2  = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const code   = `MCH-${part1}-${part2}`;

  // Formatear fecha legible
  const [y, m, d] = date.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const dateStr = `${parseInt(d)} ${meses[parseInt(m)-1]} ${y} · ${end} h`;

  // Mostrar estado activo
  tokenActive = true;
  showTokenActive(code, dateStr, doctor);

  // Cerrar la sección de generación con un feedback visual
  alert(`✅ Token generado exitosamente.\n\nCódigo: ${code}\nDoctor: ${doctor}\nVálido hasta: ${dateStr}\n\nEl doctor podrá ver tu información médica durante la cita.`);
}

/**
 * Muestra la UI del token activo.
 */
function showTokenActive(code, expires, doctor) {
  document.getElementById('token-state-inactive').classList.add('hidden');
  document.getElementById('token-state-active').classList.remove('hidden');
  document.getElementById('token-display').textContent = code;
  document.getElementById('token-expires').textContent = expires;
  if (doctor) {
    document.querySelector('.token-doctor').innerHTML = `Asignado a: <b>${doctor}</b>`;
  }
}

/**
 * Revoca el token actual antes de que expire.
 * En producción: DELETE /api/token/:id → invalida en el backend.
 */
function revokeToken() {
  if (!confirm('¿Revocar el token? El doctor ya no podrá acceder a tu información.')) return;

  tokenActive = false;
  document.getElementById('token-state-active').classList.add('hidden');
  document.getElementById('token-state-inactive').classList.remove('hidden');
  alert('🔒 Token revocado. Tu información médica está protegida.');
}

/** Muestra ayuda sobre qué es el token */
function showTokenHelp() {
  alert(
    '🔑 ¿Qué es el Token de Acceso?\n\n' +
    'Es un código temporal que permite a tu médico ver únicamente tu información médica (estudios, vacunas, historial) durante el tiempo de tu cita.\n\n' +
    '• Se activa para el día y hora de tu consulta.\n' +
    '• Expira automáticamente al terminar la cita.\n' +
    '• Tú decides qué información compartes.\n' +
    '• Puedes revocarlo en cualquier momento.'
  );
}

/**
 * Simula el progreso del token (barra de vida).
 * En producción esto se calcularía con la hora actual vs. la hora de expiración.
 */
function updateTokenProgress() {
  const bar = document.getElementById('tp-bar');
  if (!bar || !tokenActive) return;

  // Demo: la barra baja 1% cada 30 segundos
  const current = parseFloat(bar.style.width) || 72;
  const newVal  = Math.max(0, current - 0.05);
  bar.style.width = newVal + '%';

  // Token expirado automáticamente
  if (newVal <= 0) {
    revokeToken();
  }
}

// Actualizar barra de token cada 30 segundos
setInterval(updateTokenProgress, 30000);


/* ================================================================
   10. NOTIFICACIONES
================================================================ */

/**
 * Marca una notificación individual como leída al hacer tap.
 * @param {HTMLElement} el - el .notif-item clickeado
 */
function markRead(el) {
  el.classList.remove('unread');
  // Actualizar badge de notificaciones pendientes (demo)
  const unreadCount = document.querySelectorAll('.notif-item.unread').length;
  // En producción: PATCH /api/notifications/:id/read
}

/** Marca todas las notificaciones como leídas */
function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(n => n.classList.remove('unread'));
  alert('Todas las notificaciones marcadas como leídas.');
}


/* ================================================================
   11. RELOJ EN STATUS BAR
   Actualiza la hora mostrada en la barra de estado simulada.
================================================================ */
function updateClock() {
  const el = document.getElementById('status-time');
  if (!el) return;
  const now = new Date();
  const h   = String(now.getHours()).padStart(2, '0');
  const m   = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m}`;
}


/* ================================================================
   12. INICIALIZACIÓN DE COMPONENTES
   Se ejecuta cuando el app-shell es visible (tras login).
================================================================ */

/**
 * Inicializa componentes que requieren el DOM listo.
 * Llamado tras el login exitoso desde doLogin().
 */
function initApp() {
  buildCalendar();

  // Mostrar token activo por defecto (demo)
  if (tokenActive) {
    showTokenActive('MCH-2849-X7QR', '16 Mayo 2026 · 11:00 h', 'Dr. Roberto Morales Jiménez');
  }
}

// Observar cuándo el app-shell pasa de hidden a visible
const shellObserver = new MutationObserver((mutations) => {
  mutations.forEach(m => {
    if (m.type === 'attributes' && m.attributeName === 'class') {
      const shell = document.getElementById('app-shell');
      if (!shell.classList.contains('hidden')) {
        initApp();
        shellObserver.disconnect(); // Solo ejecutar una vez
      }
    }
  });
});

shellObserver.observe(document.getElementById('app-shell'), { attributes: true });


/* ================================================================
   ANIMACIÓN SHAKE (para el form de login con error)
================================================================ */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-6px); }
    80%       { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);