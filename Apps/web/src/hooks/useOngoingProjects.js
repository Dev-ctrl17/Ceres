import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import { rewriteMediaContent } from '@/lib/mediaUrls.js';
import { isUUID } from '@/lib/slug.js';

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
        setProjects(rewriteMediaContent(data || [], 'ongoing-project-images'));
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

// Fetch a single ongoing project by id — used by the project details page.
export const useOngoingProject = (identifier) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!identifier) return;

    const fetchProject = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const query = supabase
          .from('ongoing_projects')
          .select('*');
        const { data, error } = await query
          .eq(isUUID(identifier) ? 'id' : 'slug', identifier)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setNotFound(true);
          setProject(null);
        } else {
          setProject(rewriteMediaContent(data, 'ongoing-project-images'));
        }
      } catch (err) {
        console.error('useOngoingProject error:', err);
        setProject(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [identifier]);

  return { project, loading, notFound };
};