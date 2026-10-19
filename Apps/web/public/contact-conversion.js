(function () {
  if (window.__luxuryGoogleAdsConfigured) return;
  window.__luxuryGoogleAdsConfigured = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function (...args) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', 'AW-18266097278');
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

  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18266097278';
    document.head.appendChild(script);
  }

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (/^https?:\/\/(?:www\.)?wa\.me(?:\/|$)/i.test(href)) {
      window.gtag_report_conversion();
    }
  });
})();
