import { useState, useEffect } from 'react';
import axios from 'axios';
import { Project } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.projects || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load projects';
      setError(errorMessage);
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    reload: loadProjects,
  };
}

