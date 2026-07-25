import supabase from './supabaseClient';

// ============================================================
// VISITOR TRACKING API
// ============================================================

export const visitorTrackingApi = {
  // --- Overview Stats ---
  async getOverview() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [todayRes, weekRes, monthRes, liveRes] = await Promise.all([
      supabase.from('visitors').select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart),
      supabase.from('visitors').select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString()),
      supabase.from('visitors').select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString()),
      supabase.from('live_visitors').select('*', { count: 'exact', head: true })
        .gte('last_activity', new Date(Date.now() - 300000).toISOString())
    ]);

    return {
      today: todayRes.count || 0,
      week: weekRes.count || 0,
      month: monthRes.count || 0,
      liveNow: liveRes.count || 0
    };
  },

  // --- Page Analytics ---
  async getPageAnalytics(limit = 20) {
    const { data, error } = await supabase.rpc('get_page_analytics', { limit_count: limit });
    if (error) {
      // Fallback: manual query
      const { data: fallback, error: fallbackError } = await supabase
        .from('page_views')
        .select('page_url, page_title, count, time_on_page, is_bounce')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (fallbackError) throw fallbackError;

      // Aggregate manually
      const agg = {};
      fallback.forEach(pv => {
        if (!agg[pv.page_url]) {
          agg[pv.page_url] = {
            page_url: pv.page_url,
            page_title: pv.page_title,
            total_views: 0,
            unique_sessions: new Set(),
            total_time: 0,
            bounces: 0,
            entries: 0
          };
        }
        agg[pv.page_url].total_views++;
        agg[pv.page_url].total_time += (pv.time_on_page || 0);
        if (pv.is_bounce) agg[pv.page_url].bounces++;
      });

      return Object.values(agg)
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, limit);
    }
    return data || [];
  },

  // --- Recent Visitors ---
  async getRecentVisitors(limit = 50, offset = 0, search = '') {
    let query = supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `country.ilike.%${search}%,city.ilike.%${search}%,browser.ilike.%${search}%,os.ilike.%${search}%,device_type.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // --- Get Total Visitor Count ---
  async getVisitorCount(search = '') {
    let query = supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (search) {
      query = query.or(
        `country.ilike.%${search}%,city.ilike.%${search}%,browser.ilike.%${search}%,os.ilike.%${search}%,device_type.ilike.%${search}%`
      );
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  // --- Live Visitors Detail ---
  async getLiveVisitors() {
    const { data, error } = await supabase
      .from('live_visitors')
      .select('*')
      .gte('last_activity', new Date(Date.now() - 300000).toISOString())
      .order('last_activity', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // --- Get Visitors by Country ---
  async getVisitorsByCountry() {
    const { data, error } = await supabase
      .from('visitors')
      .select('country')
      .not('country', 'is', null);

    if (error) throw error;

    const countryMap = {};
    (data || []).forEach(v => {
      const c = v.country || 'Unknown';
      countryMap[c] = (countryMap[c] || 0) + 1;
    });

    return Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  },

  // --- Get Device Breakdown ---
  async getDeviceBreakdown() {
    const { data, error } = await supabase
      .from('visitors')
      .select('device_type');

    if (error) throw error;

    const deviceMap = {};
    (data || []).forEach(v => {
      const d = v.device_type || 'Unknown';
      deviceMap[d] = (deviceMap[d] || 0) + 1;
    });

    return Object.entries(deviceMap)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);
  },

  // --- Get Browser Breakdown ---
  async getBrowserBreakdown() {
    const { data, error } = await supabase
      .from('visitors')
      .select('browser');

    if (error) throw error;

    const browserMap = {};
    (data || []).forEach(v => {
      const b = v.browser || 'Unknown';
      browserMap[b] = (browserMap[b] || 0) + 1;
    });

    return Object.entries(browserMap)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
  },

  // --- Export Visitors to CSV ---
  async exportToCSV(filters = {}) {
    let query = supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }
    if (filters.device) {
      query = query.eq('device_type', filters.device);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) return null;

    const headers = [
      'Session ID', 'IP Address', 'Country', 'City', 'Device',
      'Browser', 'OS', 'Referrer', 'Landing Page',
      'UTM Source', 'UTM Medium', 'UTM Campaign',
      'First Visit', 'Last Visit', 'Visit Count', 'Created At'
    ];

    const rows = data.map(v => [
      v.session_id,
      v.ip_address,
      v.country || '',
      v.city || '',
      v.device_type || '',
      v.browser || '',
      v.os || '',
      v.referrer || '',
      v.landing_page || '',
      v.utm_source || '',
      v.utm_medium || '',
      v.utm_campaign || '',
      v.first_visit || '',
      v.last_visit || '',
      v.visit_count || 1,
      v.created_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }
};