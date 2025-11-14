import { MoreVertical, Users, Trash2 } from 'lucide-react';
import { cn, getRiskColor } from '@/lib/utils';

interface ProjectCardProps {
  id: number;
  name: string;
  team?: string[];
  status?: string;
  risk_level?: string;
  score?: number;
  isOwner?: boolean;
  isTeamProject?: boolean;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function ProjectCard({ id, name, team, status, risk_level, score, isOwner, isTeamProject, onClick, onDelete }: ProjectCardProps) {
  return (
    <div
      className="glass-light glass-hover rounded-xl p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/80 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-text-primary truncate">{name}</h4>
            <div className="flex items-center space-x-2 mt-0.5">
              {isOwner && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  Owner
                </span>
              )}
              {isTeamProject && !isOwner && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Team
                </span>
              )}
              {team && (
                <p className="text-xs text-text-tertiary">
                  {team.length} Members
                </p>
              )}
            </div>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-white/10 rounded transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 active:scale-95"
            title="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300 transition-transform duration-200" />
          </button>
        )}
      </div>

      {team && (
        <div className="flex items-center -space-x-1.5 mb-3">
          {team.slice(0, 5).map((member, idx) => (
            <div
              key={idx}
              className="w-7 h-7 rounded-full border-2 border-white/20 bg-primary flex items-center justify-center text-white text-xs font-semibold"
            >
              {member}
            </div>
          ))}
          {team.length > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-white/20 glass-light flex items-center justify-center text-xs font-semibold text-text-primary">
              +{team.length - 5}
            </div>
          )}
        </div>
      )}

      {score !== undefined && (
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-secondary">Scope Clarity</span>
            <span className="font-semibold text-text-primary">{score}%</span>
          </div>
          <div className="h-2 glass-subtle rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                score >= 80 ? 'bg-success' : score >= 60 ? 'bg-primary' : 'bg-warning'
              )}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      )}

      {risk_level && (
        <div className="flex items-center justify-between mt-2.5">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getRiskColor(risk_level))}>
            {risk_level}
          </span>
          {status && (
            <span className="text-xs text-text-tertiary">
              {status}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
