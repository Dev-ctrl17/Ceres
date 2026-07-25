(function() {
    'use strict';
    // Website Visitor Tracker - v1.0.0
    // Paste this script in your <head> tag
    
    var CONFIG = {
        supabaseUrl: 'https://lrmljudwbzjawafuztwp.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWxqdWR3YnpqYXdhZnV6dHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDEyMjIsImV4cCI6MjA5NzExNzIyMn0.yn4Cz_F0_AFWACJZRNWuu7pY51TnBX3ArKpxeOr1dSA',
        siteName: window.location.hostname,
        heartbeatInterval: 30000,
        sessionTimeout: 1800000
    };

    // Override config from data attributes
    var script = document.currentScript;
    if (script) {
        if (script.dataset.url) CONFIG.supabaseUrl = script.dataset.url;
        if (script.dataset.key) CONFIG.supabaseKey = script.dataset.key;
    }

    // Generate unique session ID
    function generateSessionId() {
        var stored = sessionStorage.getItem('_vt_session');
        if (stored) return stored;
        var id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('_vt_session', id);
        return id;
    }

    // Anonymize IP (remove last octet)
    function anonymizeIP(ip) {
        if (!ip) return '0.0.0.0';
        return ip.split('.').slice(0, 3).join('.') + '.0';
    }

    // Get device info
    function getDeviceInfo() {
        var ua = navigator.userAgent;
        var mobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
        var tablet = /Tablet|iPad/i.test(ua) && !/Mobile/i.test(ua);
        
        return {
            device: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop',
            browser: getBrowser(ua),
            os: getOS(ua)
        };
    }

    function getBrowser(ua) {
        if (ua.includes('Firefox/')) return 'Firefox';
        if (ua.includes('Edg/')) return 'Edge';
        if (ua.includes('Chrome/')) return 'Chrome';
        if (ua.includes('Safari/')) return 'Safari';
        if (ua.includes('OPR/')) return 'Opera';
        return 'Unknown';
    }

    function getOS(ua) {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac OS')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
        return 'Unknown';
    }

    // Get UTM params
    function getUTMParams() {
        var params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || null,
            utm_medium: params.get('utm_medium') || null,
            utm_campaign: params.get('utm_campaign') || null
        };
    }

    // Check if bot
    function isBot() {
        var bots = /bot|crawl|spider|scraper|curl|wget|facebookexternalhit|twitterbot|whatsapp|slack|googlebot/i;
        return bots.test(navigator.userAgent);
    }

    // Cookie consent check
    function hasConsent() {
        return document.cookie.split(';').some(function(c) {
            return c.trim().startsWith('_vt_consent=true');
        });
    }

    // Set consent cookie
    window._vt_acceptCookies = function() {
        document.cookie = '_vt_consent=true; path=/; max-age=' + (365 * 24 * 60 * 60);
        if (window._vt_consentCallback) window._vt_consentCallback();
    };

    // Send data to Supabase
    function sendToAPI(endpoint, data) {
        var url = CONFIG.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/' + endpoint;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': CONFIG.supabaseKey,
                'Authorization': 'Bearer ' + CONFIG.supabaseKey,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
        }).catch(function() {});
    }

    // Track page view
    function trackPageView() {
        if (isBot()) return;
        if (!hasConsent()) return;

        var sessionId = generateSessionId();
        var device = getDeviceInfo();
        var utm = getUTMParams();
        var now = new Date().toISOString();
        var pageUrl = window.location.href;
        var referrer = document.referrer || null;

        // Track visitor
        var visitorData = {
            session_id: sessionId,
            ip_address: '0.0.0.0',
            device_type: device.device,
            browser: device.browser,
            os: device.os,
            referrer: referrer,
            landing_page: pageUrl,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign
        };

        sendToAPI('visitors', visitorData);

        // Track page view
        var pageViewData = {
            session_id: sessionId,
            page_url: pageUrl,
            page_title: document.title,
            referrer: referrer,
            is_bounce: true
        };

        sendToAPI('page_views', pageViewData);

        // Track live visitor
        var liveData = {
            session_id: sessionId,
            current_page: pageUrl,
            last_activity: now
        };

        sendToAPI('live_visitors', liveData);
    }

    // Heartbeat to keep live visitor active
    function startHeartbeat() {
        var sessionId = generateSessionId();
        setInterval(function() {
            if (!hasConsent()) return;
            var liveData = {
                session_id: sessionId,
                current_page: window.location.href,
                last_activity: new Date().toISOString()
            };
            sendToAPI('live_visitors', liveData);
        }, CONFIG.heartbeatInterval);
    }

    // Track time on page
    var pageStartTime = Date.now();
    window.addEventListener('beforeunload', function() {
        if (!hasConsent()) return;
        var timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
        var sessionId = generateSessionId();
        
        // Update page view with time
        var url = CONFIG.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/page_views';
        fetch(url + '?session_id=eq.' + sessionId + '&page_url=eq.' + encodeURIComponent(window.location.href), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': CONFIG.supabaseKey,
                'Authorization': 'Bearer ' + CONFIG.supabaseKey,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                time_on_page: timeOnPage,
                is_bounce: timeOnPage < 30,
                exit_page: true
            })
        }).catch(function() {});

        // Remove from live visitors
        var liveUrl = CONFIG.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/live_visitors';
        fetch(liveUrl + '?session_id=eq.' + sessionId, {
            method: 'DELETE',
            headers: {
                'apikey': CONFIG.supabaseKey,
                'Authorization': 'Bearer ' + CONFIG.supabaseKey
            }
        }).catch(function() {});
    });

    // Initialize
    if (!isBot()) {
        trackPageView();
        startHeartbeat();
    }
})();