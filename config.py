"""
Configuration for Project Scope Analyzer
"""
from pydantic import BaseModel, Field
from typing import Optional


class ProjectMetadata(BaseModel):
    """Metadata about the project being analyzed"""
    project_name: str = Field(default="Unknown Project")
    project_type: str = Field(default="software development")
    industry: str = Field(default="technology")
    team_size: str = Field(default="not specified")
    timeline: str = Field(default="not specified")


class AnalyzerConfig(BaseModel):
    """Configuration for the analyzer"""
    api_key: Optional[str] = None
    model: str = Field(default="claude-sonnet-4-20250514")
    max_tokens: int = Field(default=4096)
    temperature: float = Field(default=0.7)
    
    # Analysis stages to run
    run_main_analysis: bool = True
    run_requirements_quality: bool = True
    run_risk_assessment: bool = True
    run_technical_complexity: bool = True
    run_scope_creep_detection: bool = True
    run_stakeholder_questions: bool = True
    run_assumption_extraction: bool = True
    
    # Output settings
    verbose: bool = False
    save_to_file: bool = True
    output_format: str = "markdown"  # markdown, json, html

