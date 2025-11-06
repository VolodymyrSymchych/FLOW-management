"""
Main Project Scope Analyzer Engine
"""
import os
from typing import Dict, Optional
from anthropic import Anthropic
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from config import ProjectMetadata, AnalyzerConfig
from prompts import PromptTemplates


console = Console()


class ProjectScopeAnalyzer:
    """Main analyzer class that orchestrates the analysis workflow"""
    
    def __init__(self, config: AnalyzerConfig):
        self.config = config
        api_key = config.api_key or os.getenv("ANTHROPIC_API_KEY")
        
        if not api_key:
            raise ValueError(
                "API key not found. Set ANTHROPIC_API_KEY environment variable "
                "or provide it in the config."
            )
        
        self.client = Anthropic(api_key=api_key)
        self.prompts = PromptTemplates()
    
    def _call_claude(self, prompt: str, stage_name: str) -> str:
        """Make a call to Claude API with error handling"""
        if self.config.verbose:
            console.print(f"[cyan]Running {stage_name}...[/cyan]")
        
        try:
            message = self.client.messages.create(
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            return message.content[0].text
            
        except Exception as e:
            console.print(f"[red]Error in {stage_name}: {str(e)}[/red]")
            return f"Error occurred during {stage_name}: {str(e)}"
    
    def analyze(self, document: str, metadata: ProjectMetadata) -> Dict[str, str]:
        """
        Run the complete analysis workflow
        
        Args:
            document: The project documentation to analyze
            metadata: Project metadata (name, type, industry, etc.)
            
        Returns:
            Dictionary containing all analysis results
        """
        results = {}
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            
            # Stage 1: Main Analysis
            if self.config.run_main_analysis:
                task = progress.add_task("Running main analysis...", total=None)
                prompt = self.prompts.main_analysis(
                    metadata.project_name,
                    metadata.project_type,
                    metadata.industry,
                    metadata.team_size,
                    metadata.timeline,
                    document
                )
                results['main_analysis'] = self._call_claude(prompt, "Main Analysis")
                progress.remove_task(task)
                console.print("✓ Main analysis complete", style="green")
            
            # Stage 2: Requirements Quality Check
            if self.config.run_requirements_quality:
                task = progress.add_task("Checking requirements quality...", total=None)
                prompt = self.prompts.requirements_quality(document)
                results['requirements_quality'] = self._call_claude(
                    prompt, "Requirements Quality Check"
                )
                progress.remove_task(task)
                console.print("✓ Requirements quality check complete", style="green")
            
            # Stage 3: Risk Assessment
            if self.config.run_risk_assessment:
                task = progress.add_task("Assessing risks...", total=None)
                prompt = self.prompts.risk_assessment(document)
                results['risk_assessment'] = self._call_claude(prompt, "Risk Assessment")
                progress.remove_task(task)
                console.print("✓ Risk assessment complete", style="green")
            
            # Stage 4: Technical Complexity Analysis
            if self.config.run_technical_complexity:
                task = progress.add_task("Analyzing technical complexity...", total=None)
                prompt = self.prompts.technical_complexity(document)
                results['technical_complexity'] = self._call_claude(
                    prompt, "Technical Complexity Analysis"
                )
                progress.remove_task(task)
                console.print("✓ Technical complexity analysis complete", style="green")
            
            # Stage 5: Scope Creep Detection
            if self.config.run_scope_creep_detection:
                task = progress.add_task("Detecting scope creep risks...", total=None)
                prompt = self.prompts.scope_creep_detector(document)
                results['scope_creep'] = self._call_claude(
                    prompt, "Scope Creep Detection"
                )
                progress.remove_task(task)
                console.print("✓ Scope creep detection complete", style="green")
            
            # Stage 6: Stakeholder Questions
            if self.config.run_stakeholder_questions:
                task = progress.add_task("Generating stakeholder questions...", total=None)
                prompt = self.prompts.stakeholder_questions(document)
                results['stakeholder_questions'] = self._call_claude(
                    prompt, "Stakeholder Questions"
                )
                progress.remove_task(task)
                console.print("✓ Stakeholder questions generated", style="green")
            
            # Stage 7: Assumption Extraction
            if self.config.run_assumption_extraction:
                task = progress.add_task("Extracting assumptions...", total=None)
                prompt = self.prompts.assumption_extractor(document)
                results['assumptions'] = self._call_claude(
                    prompt, "Assumption Extraction"
                )
                progress.remove_task(task)
                console.print("✓ Assumption extraction complete", style="green")
        
        return results
    
    def generate_report(self, results: Dict[str, str]) -> str:
        """
        Generate a formatted final report from all analysis results
        
        Args:
            results: Dictionary of analysis results
            
        Returns:
            Formatted report string
        """
        console.print("\n[cyan]Generating final report...[/cyan]")
        
        # Combine all results
        combined = "\n\n---\n\n".join([
            f"# {key.replace('_', ' ').title()}\n\n{value}"
            for key, value in results.items()
        ])
        
        # Format into final report
        prompt = self.prompts.format_report(
            combined,
            results.get('stakeholder_questions', '')
        )
        
        report = self._call_claude(prompt, "Report Generation")
        
        console.print("✓ Report generation complete", style="green")
        return report
    
    def extract_score(self, main_analysis: str) -> Optional[int]:
        """Extract the scope clarity score from the main analysis"""
        import re
        
        # Look for patterns like "Score: 75/100" or "75/100" or "Score: 75"
        patterns = [
            r'Score:\s*(\d+)/100',
            r'Score:\s*(\d+)',
            r'(\d+)/100',
            r'SCOPE CLARITY SCORE.*?(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, main_analysis, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def calculate_risk_level(self, results: Dict[str, str]) -> str:
        """Calculate overall risk level from analysis results"""
        risk_keywords = {
            'critical': 10,
            'high': 5,
            'medium': 2,
            'low': 1
        }
        
        total_score = 0
        for result in results.values():
            result_lower = result.lower()
            for keyword, score in risk_keywords.items():
                total_score += result_lower.count(keyword) * score
        
        if total_score >= 50:
            return "CRITICAL"
        elif total_score >= 30:
            return "HIGH"
        elif total_score >= 15:
            return "MEDIUM"
        else:
            return "LOW"

