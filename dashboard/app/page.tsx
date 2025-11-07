'use client';

import { useEffect, useState } from 'react';
import { FolderKanban, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { ProjectCard } from '@/components/ProjectCard';
import { CalendarView } from '@/components/CalendarView';
import { ProgressSection } from '@/components/ProgressSection';
import { UpcomingTasks } from '@/components/UpcomingTasks';
import { api, Project, Stats } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    projects_in_progress: 0,
    total_projects: 0,
    completion_rate: 0,
    projects_completed: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, projectsData] = await Promise.all([
        api.getStats(),
        api.getProjects()
      ]);
      setStats(statsData);
      setProjects(projectsData.projects.slice(0, 4)); // Show only first 4 projects
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Projects In Progress"
          value={stats.projects_in_progress}
          icon={FolderKanban}
          iconBgColor="bg-red-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completion_rate}%`}
          icon={TrendingUp}
          iconBgColor="bg-orange-500"
        />
        <StatsCard
          title="Total Projects"
          value={stats.total_projects}
          icon={CheckCircle}
          iconBgColor="bg-blue-500"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="High Risk Projects"
          value={projects.filter(p => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL').length}
          icon={AlertCircle}
          iconBgColor="bg-yellow-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Projects and Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Projects */}
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Recent Projects
              </h3>
              <button
                onClick={() => router.push('/projects')}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                View All
              </button>
            </div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    team={['JD', 'SK', 'MR', 'AR', 'TC', 'LM']}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No projects yet. Start by analyzing your first project!
                </p>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  New Analysis
                </button>
              </div>
            )}
          </div>

          {/* Calendar */}
          <CalendarView />
        </div>

        {/* Right Column - Progress and Tasks */}
        <div className="space-y-6">
          <ProgressSection />
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
}
