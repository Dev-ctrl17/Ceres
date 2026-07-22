import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';

export const useOngoingProjects = (filters = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('ongoing_projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('useOngoingProjects error:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters.status]);

  return { projects, loading };
};