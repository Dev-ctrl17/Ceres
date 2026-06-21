import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';

export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('properties')
          .select('*')
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

        const { data, error } = await query;
        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error('useProperties error:', err);
        setProperties([]);
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
  ]);

  return { properties, loading };
};