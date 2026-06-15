import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

export const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let filterString = '';
      const conditions = [];

      if (filters.location) conditions.push(`location ~ "${filters.location}"`);
      if (filters.propertyType && filters.propertyType !== 'all') conditions.push(`propertyType = "${filters.propertyType}"`);
      if (filters.bedrooms && filters.bedrooms !== 'all') conditions.push(`bedrooms >= ${filters.bedrooms}`);
      if (filters.status && filters.status !== 'all') conditions.push(`status = "${filters.status}"`);

      if (conditions.length > 0) filterString = conditions.join(' && ');

      const records = await pb.collection('properties').getFullList({
        filter: filterString,
        sort: '-created',
        $autoCancel: false,
      });

      setProperties(records);
      return records;
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
      const record = await pb.collection('properties').getOne(id, { $autoCancel: false });
      return record;
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
      const record = await pb.collection('properties').create(formData, { $autoCancel: false });
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
      const record = await pb.collection('properties').update(id, formData, { $autoCancel: false });
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
      await pb.collection('properties').delete(id, { $autoCancel: false });
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