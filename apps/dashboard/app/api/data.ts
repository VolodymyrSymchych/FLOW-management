// In-memory data store (replace with database in production)

export interface Project {
  id: number;
  name: string;
  type: string;
  industry: string;
  team_size: string;
  timeline: string;
  score: number;
  risk_level: string;
  created_at: string;
  status: string;
}

export interface Analysis {
  results: Record<string, string>;
  report: string;
  metadata: any;
}

export const projects: Project[] = [
  {
    id: 1,
    name: 'Customer Portal Redesign',
    type: 'web application',
    industry: 'financial services',
    team_size: '8 developers',
    timeline: '16 weeks',
    score: 85,
    risk_level: 'LOW',
    created_at: new Date().toISOString(),
    status: 'completed'
  },
  {
    id: 2,
    name: 'Mobile Banking App',
    type: 'mobile application',
    industry: 'banking',
    team_size: '5 developers',
    timeline: '12 weeks',
    score: 72,
    risk_level: 'MEDIUM',
    created_at: new Date().toISOString(),
    status: 'in_progress'
  },
  {
    id: 3,
    name: 'Analytics Dashboard',
    type: 'data analytics',
    industry: 'technology',
    team_size: '4 developers',
    timeline: '8 weeks',
    score: 91,
    risk_level: 'LOW',
    created_at: new Date().toISOString(),
    status: 'completed'
  },
  {
    id: 4,
    name: 'E-commerce Platform',
    type: 'web application',
    industry: 'retail',
    team_size: '10 developers',
    timeline: '24 weeks',
    score: 45,
    risk_level: 'HIGH',
    created_at: new Date().toISOString(),
    status: 'in_progress'
  }
];

export const analyses: Record<number, Analysis> = {
  1: {
    results: {
      main_analysis: 'Excellent scope definition with clear objectives and success criteria. Minor ambiguities in error handling requirements.',
      requirements_quality: 'All requirements meet INVEST criteria. Strong testability and clear value propositions.',
      risk_assessment: 'Low technical risk. Well-understood technology stack. Minor timeline risk due to third-party API dependencies.',
      technical_complexity: 'Moderate complexity. Standard web application patterns with proven architecture.',
      scope_creep: 'Well-defined boundaries. No red flag phrases detected. Clear out-of-scope items listed.',
      stakeholder_questions: 'Generated 15 clarifying questions across product, technical, and business domains.',
      assumptions: 'Identified 8 key assumptions around user behavior, infrastructure, and third-party integrations.'
    },
    report: `# Project Scope Analysis Report

## Executive Summary
Scope Clarity Score: 85/100
Overall Risk Level: LOW

This project demonstrates strong scope definition with clear objectives, well-defined requirements, and realistic timelines. Minor improvements needed in error handling specifications.

## Key Findings

### Strengths
- Clear success metrics and KPIs defined
- Well-structured requirements following INVEST principles
- Realistic timeline with appropriate milestones
- Strong technical feasibility

### Areas for Improvement
- Error handling strategy needs more detail
- API rate limit handling not specified
- Monitoring and alerting requirements missing

### Recommendations
1. Define comprehensive error handling patterns
2. Clarify third-party API integration details
3. Add performance benchmarks and SLAs
4. Include disaster recovery procedures

## Risk Assessment
- Technical Risk: LOW
- Schedule Risk: LOW
- Resource Risk: LOW
- Scope Risk: MEDIUM

## Next Steps
- Schedule clarification meeting with stakeholders
- Finalize technical architecture document
- Define monitoring and alerting strategy`,
    metadata: {}
  },
  2: {
    results: {
      main_analysis: 'Good scope with some ambiguities. Several requirements need clarification before development.',
      requirements_quality: 'Most requirements are clear but some lack acceptance criteria.',
      risk_assessment: 'Medium risk due to mobile platform considerations and performance requirements.',
      technical_complexity: 'High complexity due to offline functionality and data synchronization.',
      scope_creep: 'Some vague features detected. Recommend defining clear boundaries for MVP.',
      stakeholder_questions: 'Generated 20 critical questions requiring immediate answers.',
      assumptions: 'Multiple assumptions about user behavior and technical capabilities need validation.'
    },
    report: `# Project Scope Analysis Report

## Executive Summary
Scope Clarity Score: 72/100
Overall Risk Level: MEDIUM

The project has a solid foundation but requires clarification in several key areas before proceeding to development.

## Key Findings

### Concerns
- Offline functionality requirements are vague
- Data synchronization strategy not defined
- Performance requirements need quantification
- Several "nice to have" features mixed with core requirements

### Recommendations
1. Define clear MVP scope
2. Specify offline capabilities in detail
3. Create detailed data synchronization strategy
4. Separate core features from enhancements

## Risk Assessment
- Technical Risk: MEDIUM
- Schedule Risk: MEDIUM
- Resource Risk: LOW
- Scope Risk: HIGH`,
    metadata: {}
  },
  3: {
    results: {
      main_analysis: 'Exemplary scope definition. One of the clearest project scopes analyzed.',
      requirements_quality: 'Outstanding. All requirements are specific, measurable, and testable.',
      risk_assessment: 'Minimal risk. Well-planned with appropriate contingencies.',
      technical_complexity: 'Moderate complexity with proven technology choices.',
      scope_creep: 'Excellent boundary definition. Clear phase breakdown.',
      stakeholder_questions: 'Few questions needed - scope is very clear.',
      assumptions: 'All major assumptions identified and documented with validation plans.'
    },
    report: `# Project Scope Analysis Report

## Executive Summary
Scope Clarity Score: 91/100
Overall Risk Level: LOW

Exceptional scope definition with clear objectives, well-defined requirements, and comprehensive planning.

## Key Findings

### Strengths
- Crystal clear objectives and success criteria
- Excellent requirement quality (INVEST compliant)
- Comprehensive risk mitigation strategies
- Well-defined phases and deliverables
- Strong technical documentation

### Minor Improvements
- Consider adding more edge case handling
- Document browser compatibility requirements

## Risk Assessment
- Technical Risk: LOW
- Schedule Risk: LOW
- Resource Risk: LOW
- Scope Risk: LOW

This project is ready to proceed to development.`,
    metadata: {}
  },
  4: {
    results: {
      main_analysis: 'Significant scope issues detected. Multiple critical ambiguities and missing requirements.',
      requirements_quality: 'Poor. Many requirements are vague, not measurable, or lack acceptance criteria.',
      risk_assessment: 'HIGH risk project. Timeline is unrealistic given the scope and team size.',
      technical_complexity: 'Very high complexity with many unknowns and unproven technologies.',
      scope_creep: 'CRITICAL: Multiple red flags for scope creep. Many open-ended requirements.',
      stakeholder_questions: 'Generated 35+ critical questions that must be answered.',
      assumptions: 'Dangerous assumptions about technology, team capabilities, and timelines.'
    },
    report: `# Project Scope Analysis Report

## Executive Summary
Scope Clarity Score: 45/100
Overall Risk Level: HIGH

⚠️ This project scope requires significant refinement before proceeding to development.

## Critical Issues

### Major Concerns
- Vague and unmeasurable requirements
- Unrealistic timeline for scope and complexity
- Multiple unproven technology choices
- No clear MVP definition
- Scope creep risks throughout document
- Missing critical technical specifications

### Immediate Actions Required
1. STOP and refine scope before proceeding
2. Define clear, measurable requirements
3. Break project into smaller phases
4. Validate technical approach with POCs
5. Add 50-100% buffer to timeline
6. Define explicit MVP scope
7. Remove "nice to have" features from initial scope

## Risk Assessment
- Technical Risk: CRITICAL
- Schedule Risk: CRITICAL
- Resource Risk: HIGH
- Scope Risk: CRITICAL

❌ DO NOT proceed to development without addressing these issues.

## Recommendation
Pause project and schedule scope refinement workshop with all stakeholders.`,
    metadata: {}
  }
};

let nextId = 5;

export function addProject(project: Omit<Project, 'id' | 'created_at'>): Project {
  const newProject = {
    ...project,
    id: nextId++,
    created_at: new Date().toISOString()
  };
  projects.push(newProject);
  return newProject;
}

export function addAnalysis(projectId: number, analysis: Analysis) {
  analyses[projectId] = analysis;
}
