import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projectService } from '@/lib/project-service';
import { storage } from '@/server/storage';
import { invalidateOnUpdate, invalidateAllProjectCaches } from '@/lib/cache-invalidation';

// Helper to safely convert to ISO string
const toISOString = (date: any) => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  try {
    return new Date(date).toISOString();
  } catch {
    return undefined;
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Try project-service first
    const projectServiceUrl = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;
    
    if (projectServiceUrl) {
      console.log('🔗 Using project-service microservice:', projectServiceUrl);
      const result = await projectService.getProject(projectId);
      
      if (result.project) {
        console.log('✅ Got project from microservice:', result.project.id);
        
        // Parse analysis data if it exists
        let analysis = {
          results: {},
          report: 'Analysis not available',
          metadata: {}
        };

        if (result.project.analysisData) {
          try {
            const parsed = typeof result.project.analysisData === 'string' 
              ? JSON.parse(result.project.analysisData)
              : result.project.analysisData;
            analysis = {
              results: parsed.results || {},
              report: parsed.report || result.project.document || 'Analysis not available',
              metadata: parsed.metadata || {}
            };
          } catch (e) {
            analysis.report = result.project.document || 'Analysis not available';
          }
        } else if (result.project.document) {
          analysis.report = result.project.document;
        }

        // Format project data to match expected interface
        const projectData = {
          id: result.project.id,
          name: result.project.name,
          type: result.project.type || '',
          industry: result.project.industry || '',
          team_size: result.project.teamSize || '',
          timeline: result.project.timeline || '',
          score: result.project.score || 0,
          risk_level: result.project.riskLevel || 'LOW',
          created_at: toISOString(result.project.createdAt) || new Date().toISOString(),
          status: result.project.status || 'in_progress',
          budget: result.project.budget,
          start_date: toISOString(result.project.startDate),
          end_date: toISOString(result.project.endDate),
        };

        return NextResponse.json({
          project: projectData,
          analysis
        });
      }
      
      // If microservice returned error, log it
      if (result.error) {
        console.warn('⚠️ Project service error, falling back to local storage:', result.error);
      }
    } else {
      console.log('⚠️ NEXT_PUBLIC_PROJECT_SERVICE_URL not set, using local storage');
    }

    // Fallback to local storage
    console.log('📦 Using local database storage (fallback)');
    
    // Get project from database
    const project = await storage.getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify user has access to this project
    const hasAccess = await storage.userHasProjectAccess(session.userId, projectId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse analysis data if it exists
    let analysis = {
    results: {},
    report: 'Analysis not available',
    metadata: {}
  };

    if (project.analysisData) {
      try {
        const parsed = JSON.parse(project.analysisData);
        analysis = {
          results: parsed.results || {},
          report: parsed.report || project.document || 'Analysis not available',
          metadata: parsed.metadata || {}
        };
      } catch (e) {
        // If parsing fails, use document as report
        analysis.report = project.document || 'Analysis not available';
      }
    } else if (project.document) {
      analysis.report = project.document;
    }

    // Get project teams
    const projectTeams = await storage.getProjectTeams(projectId);
    const teamId = projectTeams.length > 0 ? projectTeams[0].id : undefined;

    // Format project data to match expected interface
    const projectData = {
      id: project.id,
      name: project.name,
      type: project.type || '',
      industry: project.industry || '',
      team_size: project.teamSize || '',
      timeline: project.timeline || '',
      score: project.score || 0,
      risk_level: project.riskLevel || 'LOW',
      created_at: toISOString(project.createdAt) || new Date().toISOString(),
      status: project.status || 'in_progress',
      budget: project.budget,
      start_date: toISOString(project.startDate),
      end_date: toISOString(project.endDate),
      team_id: teamId,
    };

  return NextResponse.json({
      project: projectData,
    analysis
  });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, type, industry, team_size, timeline, status, budget, start_date, end_date, team_id } = body;

    // Try project-service first
    const result = await projectService.updateProject(projectId, {
      name,
      type,
      industry,
      teamSize: team_size,
      timeline,
      status,
      budget: budget ? parseInt(budget) : undefined,
      startDate: start_date ? new Date(start_date).toISOString() : undefined,
      endDate: end_date ? new Date(end_date).toISOString() : undefined,
    });

    if (result.project) {
      // Update team assignment if team_id changed (fallback to local storage for now)
      if (team_id !== undefined) {
        try {
          const currentTeams = await storage.getProjectTeams(projectId);
          if (team_id === null) {
            for (const team of currentTeams) {
              await storage.removeProjectFromTeam(team.id, projectId);
            }
          } else {
            const teamIdNum = parseInt(team_id);
            const isAlreadyAssigned = currentTeams.some(t => t.id === teamIdNum);
            if (!isAlreadyAssigned) {
              for (const team of currentTeams) {
                await storage.removeProjectFromTeam(team.id, projectId);
              }
              await storage.addProjectToTeam(teamIdNum, projectId);
            }
          }
        } catch (error) {
          console.warn('Failed to update team assignment:', error);
        }
      }

      // Invalidate caches after updating project
      await invalidateOnUpdate('project', projectId, session.userId, { teamId: team_id });

      return NextResponse.json({
        success: true,
        message: 'Project updated successfully',
        project: result.project
      });
    }

    // Fallback to local storage
    if (result.error) {
      console.warn('Project service error, falling back to local storage:', result.error);
    }

    // Verify project exists and user has access
    const project = await storage.getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const hasAccess = await storage.userHasProjectAccess(session.userId, projectId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update project
    const updatedProject = await storage.updateProject(projectId, {
      name,
      type,
      industry,
      teamSize: team_size,
      timeline,
      status,
      budget: budget ? parseInt(budget) : undefined,
      startDate: start_date ? new Date(start_date) : undefined,
      endDate: end_date ? new Date(end_date) : undefined,
    });

    // Update team assignment if team_id changed
    if (team_id !== undefined) {
      // Get current teams for this project
      const currentTeams = await storage.getProjectTeams(projectId);

      if (team_id === null) {
        // Remove all team associations
        for (const team of currentTeams) {
          await storage.removeProjectFromTeam(team.id, projectId);
        }
      } else {
        const teamIdNum = parseInt(team_id);
        const isAlreadyAssigned = currentTeams.some(t => t.id === teamIdNum);

        if (!isAlreadyAssigned) {
          // Remove all existing team associations
          for (const team of currentTeams) {
            await storage.removeProjectFromTeam(team.id, projectId);
          }
          // Add new team association
          await storage.addProjectToTeam(teamIdNum, projectId);
        }
      }
    }

    // Invalidate caches after updating project
    await invalidateOnUpdate('project', projectId, session.userId, { teamId: team_id });

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = parseInt(params.id);

    // Try project-service first
    const result = await projectService.deleteProject(projectId);

    if (!result.error) {
      // Invalidate all project-related caches after deletion
      await invalidateAllProjectCaches(projectId, session.userId);

      return NextResponse.json({ success: true, message: 'Project deleted successfully' });
    }

    // Fallback to local storage
    if (result.error) {
      console.warn('Project service error, falling back to local storage:', result.error);
    }

    // Verify project exists
    const project = await storage.getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Soft delete the project
    await storage.deleteProject(projectId);

    // Invalidate all project-related caches after deletion
    await invalidateAllProjectCaches(projectId, session.userId);

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
