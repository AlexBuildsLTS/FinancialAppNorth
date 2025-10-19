export function initDevErrorHandlers() {
  if (typeof window === 'undefined') return;
  window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
    // keep default behavior but also log stack/message clearly
    console.error('UnhandledPromiseRejection:', ev.reason);
  });
  window.addEventListener('error', (ev: ErrorEvent) => {
    console.error('Global error:', ev.error ?? ev.message, ev);
  });
}
