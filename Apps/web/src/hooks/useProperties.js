import { useState, useCallback } from 'react';
import { propertiesApi } from '@/lib/supabaseService';

export const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await propertiesApi.getAll(filters);
      if (fetchError) throw new Error(fetchError.message);
      setProperties(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPropertyById = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await propertiesApi.getById(id);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProperty = useCallback(async (formData) => {
    setLoading(true);
    try {
      const record = await propertiesApi.create(formData);
      setProperties(prev => [record, ...prev]);
      return record;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProperty = useCallback(async (id, formData) => {
    setLoading(true);
    try {
      const record = await propertiesApi.update(id, formData);
      setProperties(prev => prev.map(p => p.id === id ? record : p));
      return record;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProperty = useCallback(async (id) => {
    setLoading(true);
    try {
      await propertiesApi.delete(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    properties, 
    loading, 
    error, 
    fetchProperties, 
    fetchPropertyById, 
    createProperty, 
    updateProperty, 
    deleteProperty 
  };
};