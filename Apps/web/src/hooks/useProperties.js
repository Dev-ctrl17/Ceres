import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';

export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
        const pageSize = 24;
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.purpose && filters.purpose !== 'all') {
          query = query.eq('purpose', filters.purpose);
        }
        if (filters.propertyType && filters.propertyType !== 'all') {
          // Use partial match instead of exact match so combined types
          // like "Terrace Duplex" still show up when filtering by "Duplex"
          // or "Terrace" individually.
          query = query.ilike('property_type', `%${filters.propertyType}%`);
        }
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.bedrooms && filters.bedrooms !== 'all') {
          query = query.gte('bedrooms', parseInt(filters.bedrooms));
        }

        const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
        if (error) throw error;
        setProperties(data || []);
        setTotal(count || 0);
      } catch (err) {
        console.error('useProperties error:', err);
        setProperties([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [
    filters.status,
    filters.purpose,
    filters.propertyType,
    filters.location,
    filters.bedrooms,
    filters.page,
  ]);

  return { properties, loading, total };
};