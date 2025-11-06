import { MoreVertical, Users } from 'lucide-react';
import { cn, getRiskColor } from '@/lib/utils';

interface ProjectCardProps {
  id: number;
  name: string;
  team?: string[];
  status?: string;
  risk_level?: string;
  score?: number;
  onClick?: () => void;
}

export function ProjectCard({ id, name, team, status, risk_level, score, onClick }: ProjectCardProps) {
  return (
    <div
      className="bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{name}</h4>
            {team && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {team.length} Members
              </p>
            )}
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {team && (
        <div className="flex items-center -space-x-2 mb-3">
          {team.slice(0, 5).map((member, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-card-dark bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold"
            >
              {member}
            </div>
          ))}
          {team.length > 5 && (
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-card-dark bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
              +{team.length - 5}
            </div>
          )}
        </div>
      )}

      {score !== undefined && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Scope Clarity</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{score}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full',
                score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
              )}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      )}

      {risk_level && (
        <div className="flex items-center justify-between mt-3">
          <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getRiskColor(risk_level))}>
            {risk_level}
          </span>
          {status && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {status}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
