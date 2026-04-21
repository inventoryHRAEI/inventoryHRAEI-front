// Script de diagnóstico para capturar qué causa recargas
// Ejecutar en la consola del navegador: copy/paste este contenido

console.log('%c=== INIT DEBUG RELOADS ===', 'color: red; font-size: 14px; font-weight: bold');

// Interceptar location.reload
const originalReload = window.location.reload.bind(window.location);
window.location.reload = function() {
  console.error('%c❌ RELOAD LLAMADO DESDE:', 'color: red; font-size: 12px; font-weight: bold');
  console.trace();
  return originalReload.apply(this, arguments);
};

// Interceptar location.href
let originalHref = '';
Object.defineProperty(window.location, 'href', {
  get: function() {
    return originalHref;
  },
  set: function(value) {
    console.error('%c❌ LOCATION.HREF CAMBIÓ A:', 'color: red; font-size: 12px; font-weight: bold', value);
    console.trace();
    originalHref = value;
    window.location.replace(value);
  }
});

// Capturar eventos de navegación
window.addEventListener('beforeunload', (e) => {
  console.warn('%c⚠️ beforeunload:', 'color: orange; font-size: 12px; font-weight: bold', e);
});

// Interceptar fetch para ver requests 401
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args).then((res) => {
    if (res.status === 401 || res.status === 400) {
      console.warn(
        `%c⚠️ ${res.status} en ${args[0]}`,
        'color: orange; font-size: 11px; font-weight: bold'
      );
      console.trace();
    }
    return res;
  });
};

// Monitorear eventos de storage
window.addEventListener('storage', (e) => {
  console.log('%c📦 Storage evento:', 'color: blue; font-size: 11px', {
    key: e.key,
    oldValue: e.oldValue,
    newValue: e.newValue
  });
});

// Monitorear eventos de sesión
window.addEventListener('session:updated', () => {
  console.log('%c🔄 session:updated disparado', 'color: purple; font-size: 11px; font-weight: bold');
  console.trace();
});

console.log('%c=== DEBUG READY ===', 'color: green; font-size: 14px; font-weight: bold');
