import { useState, useEffect } from 'react';
import { propertiesApi } from '../lib/supabaseService';

export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // The getAll method in supabaseService now handles the logic:
        // 1. status = 'Available' by default
        // 2. purpose/property_type/bedrooms filtering
        // 3. location matching via .ilike
        const { data, error: fetchError } = await propertiesApi.getAll(filters);
        
        if (fetchError) throw fetchError;
        setProperties(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [JSON.stringify(filters)]); // Re-fetch only when filter values actually change

  return { properties, loading, error };
};