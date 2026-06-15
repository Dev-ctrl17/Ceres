import { useState, useEffect } from 'react';
import { blogPostsApi } from '@/lib/supabaseService';

export const useBlogPosts = (category = null) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await blogPostsApi.getAll(category);
        if (fetchError) throw new Error(fetchError.message);
        setPosts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  return { posts, loading, error };
};