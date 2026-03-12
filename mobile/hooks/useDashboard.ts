import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/lib/project-service';

export function useDashboard() {
  const { token, selectedTeamId } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!token) {
      setStats(null);
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [statsResult, projectsResult] = await Promise.all([
        projectService.getStats(token),
        projectService.getProjects(token, selectedTeamId),
      ]);

      if (statsResult.error) {
        throw new Error(statsResult.error);
      }

      if (projectsResult.error) {
        throw new Error(projectsResult.error);
      }

      setStats(statsResult.stats || null);
      setProjects(projectsResult.projects || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, selectedTeamId]);

  const refresh = async () => {
    await fetchDashboardData();
  };

  const highRiskCount = projects.filter(
    (p) => p.riskLevel === 'high' || p.risk_level === 'high'
  ).length;

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
