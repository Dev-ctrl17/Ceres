let loadingPromise;

function appendScript(src, marker) {
  if (document.querySelector(`script[data-third-party="${marker}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.dataset.thirdParty = marker;
  document.head.appendChild(script);
}

export function loadThirdParties() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve) => {
    const gtmId = import.meta.env.VITE_GTM_CONTAINER_ID;
    window.dataLayer = window.dataLayer || [];
    window.clarity = window.clarity || function (...args) {
      (window.clarity.q = window.clarity.q || []).push(args);
    };

    if (gtmId) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      appendScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`, 'gtm');
    }
    appendScript('https://www.clarity.ms/tag/xtjqoi5zdy', 'clarity');
    appendScript('https://elfsightcdn.com/platform.js', 'elfsight');
    resolve();
  });

  return loadingPromise;
}

export function scheduleThirdParties() {
  if (typeof window === 'undefined') return undefined;
  if (window.__PRERENDERING__) return undefined;
  let scheduled = false;
  const events = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
  const cleanup = () => events.forEach((event) => window.removeEventListener(event, load));
  const load = () => {
    if (scheduled) return;
    scheduled = true;
    cleanup();
    loadThirdParties();
  };
  events.forEach((event) => window.addEventListener(event, load, { once: true, passive: true }));
  if ('requestIdleCallback' in window) window.requestIdleCallback(load, { timeout: 4000 });
  else window.setTimeout(load, 4000);
  return cleanup;
}