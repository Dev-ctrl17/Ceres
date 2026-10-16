let loadingPromise;

function prepareGoogleAdsTracking() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function (...args) {
    window.dataLayer.push(args);
  };
  window.gtag_report_conversion = function (url) {
    const callback = function () {
      if (typeof url !== 'undefined') {
        window.location = url;
      }
    };
    window.gtag('event', 'conversion', {
      send_to: 'AW-18266097278/1kG1CKyFgJ8dEP6M-oVE',
      event_callback: callback,
    });
    return false;
  };
  if (window.__luxuryGoogleAdsConfigured) return;
  window.__luxuryGoogleAdsConfigured = true;
  window.gtag('js', new Date());
  window.gtag('config', 'AW-18266097278');
}

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

  prepareGoogleAdsTracking();
  loadingPromise = new Promise((resolve) => {
    const gtmId = import.meta.env.VITE_GTM_CONTAINER_ID;
    window.dataLayer = window.dataLayer || [];
    window.clarity = window.clarity || function (...args) {
      (window.clarity.q = window.clarity.q || []).push(args);
    };

    if (gtmId) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      appendScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`, 'gtm');
    } else appendScript('https://www.googletagmanager.com/gtag/js?id=AW-18266097278', 'google-ads');
    appendScript('https://www.clarity.ms/tag/xtjqoi5zdy', 'clarity');
    appendScript('https://elfsightcdn.com/platform.js', 'elfsight');
    resolve();
  });

  return loadingPromise;
}

export function scheduleThirdParties() {
  if (typeof window === 'undefined') return undefined;
  if (window.__PRERENDERING__) return undefined;
  prepareGoogleAdsTracking();
  if (!window.__luxuryContactConversionListenerAttached) {
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (/^(?:tel:|mailto:)|(?:^|\/\/)(?:[\w-]+\.)*wa\.me(?:\/|$)/i.test(href)) {
        window.gtag_report_conversion();
      }
    });
    window.__luxuryContactConversionListenerAttached = true;
  }
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