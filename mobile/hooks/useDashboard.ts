import { useState, useEffect } from 'react';
import { api, Stats, Project } from '@/services/api';

export function useDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, projectsData] = await Promise.all([
        api.getStats(),
        api.getProjects(),
      ]);

      setStats(statsData);
      setProjects(projectsData.projects);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refresh = async () => {
    await fetchDashboardData();
  };

  // Calculate high risk projects count
  const highRiskCount = projects.filter(
    (p) => p.riskLevel === 'high' || p.risk_level === 'high'
  ).length;

  // Calculate active projects count
  const activeProjectsCount = projects.filter(
    (p) => p.status === 'in_progress' || p.status === 'active'
  ).length;

  return {
    stats,
    projects,
    loading,
    error,
    refresh,
    highRiskCount,
    activeProjectsCount,
  };
}
