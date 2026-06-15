import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

export const useAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const records = await pb.collection('agents').getFullList({
          sort: '-rating',
          $autoCancel: false,
        });
        setAgents(records);
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