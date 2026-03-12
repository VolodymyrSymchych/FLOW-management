'use client';

import type { MouseEvent } from 'react';
import { FolderKanban, Trash2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  onDelete?: (e: MouseEvent) => void;
  translations?: Record<string, any>;
}

function getScoreTone(score?: number | null) {
  if (typeof score !== 'number') return 'neutral';
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}

export function ProjectCard({
  id,
  name,
  team,
  status,
  risk_level,
  score,
  isOwner,
  isTeamProject,
  onClick,
  onDelete,
  translations,
}: ProjectCardProps) {
  const locale = useLocale();
  const displayName = translations?.name?.[locale] || name;
  const initials = displayName.substring(0, 2).toUpperCase();
  const teamItems = (team || []).map((member, index) => ({
    id: `${id}-${member}-${index}`,
    label: member,
  }));

  return (
    <Card
      surface="panel"
      density="md"
      data-testid="project-card"
      className={cn(
        'flex h-full cursor-pointer flex-col gap-4 border border-border/70 transition-colors hover:border-accent/30 hover:bg-surface-elevated',
        onClick && 'focus-within:border-accent/30'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-base font-semibold text-text-primary">{displayName}</h4>
              {status ? <StatusBadge status={status}>{status.replace(/_/g, ' ')}</StatusBadge> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
              {isOwner ? <Badge tone="primary" variant="soft" className="normal-case tracking-normal">Owner</Badge> : null}
              {isTeamProject && !isOwner ? <Badge tone="info" variant="soft" className="normal-case tracking-normal">Team</Badge> : null}
              {team?.length ? <span>{team.length} collaborators</span> : <span>Standalone analysis</span>}
            </div>
          </div>
        </div>

        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            tone="danger"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(event);
            }}
            aria-label="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {teamItems.length ? <AvatarGroup items={teamItems} max={5} size="sm" /> : null}

      {typeof score === 'number' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Scope clarity</span>
            <span className="font-semibold text-text-primary">{score}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-danger'
              )}
              style={{ width: `${Math.max(6, Math.min(score, 100))}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-sm text-text-secondary">
          <FolderKanban className="h-4 w-4" />
          Analysis ready for review.
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
        {risk_level ? (
          <div className="space-y-1">
            <p className="app-label text-text-tertiary">Risk level</p>
            <Badge tone={getScoreTone(score) as 'neutral' | 'success' | 'warning' | 'danger'} variant="soft" className="normal-case tracking-normal">
              {risk_level}
            </Badge>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="app-label text-text-tertiary">Risk level</p>
            <span className="text-sm text-text-secondary">Pending</span>
          </div>
        )}
        <div className="text-right">
          <p className="app-label text-text-tertiary">Project ID</p>
          <p className="text-sm font-medium text-text-primary">#{id}</p>
        </div>
      </div>
    </Card>
  );
}
