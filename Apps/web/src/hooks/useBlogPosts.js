import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

export const useBlogPosts = (category = null) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterString = category ? `category = "${category}"` : '';
        const records = await pb.collection('blogPosts').getFullList({
          filter: filterString,
          sort: '-publishDate',
          $autoCancel: false,
        });
        setPosts(records);
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