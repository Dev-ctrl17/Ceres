import { useState, useEffect } from 'react';
import { agentsApi } from '@/lib/supabaseService';

export const useAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await agentsApi.getAll();
        if (fetchError) throw new Error(fetchError.message);
        setAgents(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return { agents, loading, error };
};