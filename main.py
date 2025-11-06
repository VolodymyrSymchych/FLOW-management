#!/usr/bin/env python3
"""
Project Scope Analyzer - CLI Application

Analyzes project documentation to identify scope issues, risks, and ambiguities.
"""
import os
import sys
from pathlib import Path
from datetime import datetime
import typer
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from dotenv import load_dotenv

from config import ProjectMetadata, AnalyzerConfig
from analyzer import ProjectScopeAnalyzer


# Load environment variables
load_dotenv()

app = typer.Typer(help="Project Scope Analyzer - AI-powered project scope analysis")
console = Console()


@app.command()
def analyze(
    document_path: str = typer.Argument(..., help="Path to the project document to analyze"),
    project_name: str = typer.Option("Unknown Project", "--name", "-n", help="Project name"),
    project_type: str = typer.Option("software development", "--type", "-t", help="Project type"),
    industry: str = typer.Option("technology", "--industry", "-i", help="Industry"),
    team_size: str = typer.Option("not specified", "--team-size", "-s", help="Team size"),
    timeline: str = typer.Option("not specified", "--timeline", "-d", help="Project timeline"),
    output: str = typer.Option(None, "--output", "-o", help="Output file path (optional)"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Verbose output"),
    quick: bool = typer.Option(False, "--quick", "-q", help="Quick analysis (main analysis only)"),
):
    """
    Analyze a project scope document and generate a comprehensive report.
    """
    
    # Display banner
    console.print(Panel.fit(
        "[bold cyan]Project Scope Analyzer[/bold cyan]\n"
        "[dim]AI-powered project scope analysis and risk detection[/dim]",
        border_style="cyan"
    ))
    
    # Load document
    try:
        doc_path = Path(document_path)
        if not doc_path.exists():
            console.print(f"[red]Error: Document not found: {document_path}[/red]")
            sys.exit(1)
        
        with open(doc_path, 'r', encoding='utf-8') as f:
            document = f.read()
        
        console.print(f"[green]✓[/green] Loaded document: {doc_path.name}")
        console.print(f"[dim]Document size: {len(document)} characters[/dim]\n")
        
    except Exception as e:
        console.print(f"[red]Error loading document: {str(e)}[/red]")
        sys.exit(1)
    
    # Setup configuration
    metadata = ProjectMetadata(
        project_name=project_name,
        project_type=project_type,
        industry=industry,
        team_size=team_size,
        timeline=timeline
    )
    
    config = AnalyzerConfig(
        verbose=verbose,
        run_requirements_quality=not quick,
        run_risk_assessment=not quick,
        run_technical_complexity=not quick,
        run_scope_creep_detection=not quick,
        run_stakeholder_questions=not quick,
        run_assumption_extraction=not quick,
    )
    
    # Run analysis
    try:
        analyzer = ProjectScopeAnalyzer(config)
        
        console.print("[bold]Starting analysis...[/bold]\n")
        results = analyzer.analyze(document, metadata)
        
        console.print("\n[bold]Generating comprehensive report...[/bold]\n")
        report = analyzer.generate_report(results)
        
        # Extract key metrics
        score = analyzer.extract_score(results.get('main_analysis', ''))
        risk_level = analyzer.calculate_risk_level(results)
        
        # Display summary
        console.print("\n")
        console.print(Panel(
            f"[bold]Analysis Complete[/bold]\n\n"
            f"Scope Clarity Score: [cyan]{score or 'N/A'}/100[/cyan]\n"
            f"Overall Risk Level: [{'red' if risk_level == 'CRITICAL' else 'yellow' if risk_level == 'HIGH' else 'green'}]{risk_level}[/]\n"
            f"Analysis stages completed: [green]{len(results)}[/green]",
            border_style="green"
        ))
        
        # Save report
        if output:
            output_path = Path(output)
        else:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_dir = Path("reports")
            output_dir.mkdir(exist_ok=True)
            output_path = output_dir / f"scope_analysis_{timestamp}.md"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"# Project Scope Analysis Report\n\n")
            f.write(f"**Project:** {project_name}\n")
            f.write(f"**Analysis Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**Scope Clarity Score:** {score or 'N/A'}/100\n")
            f.write(f"**Overall Risk Level:** {risk_level}\n\n")
            f.write("---\n\n")
            f.write(report)
        
        console.print(f"\n[green]✓[/green] Report saved to: [cyan]{output_path}[/cyan]")
        
        # Display preview
        if not verbose:
            console.print("\n[bold]Report Preview:[/bold]\n")
            preview = report[:1000] + "..." if len(report) > 1000 else report
            console.print(Markdown(preview))
        else:
            console.print("\n[bold]Full Report:[/bold]\n")
            console.print(Markdown(report))
        
    except Exception as e:
        console.print(f"\n[red]Error during analysis: {str(e)}[/red]")
        if verbose:
            import traceback
            console.print(traceback.format_exc())
        sys.exit(1)


@app.command()
def info():
    """Display information about the analyzer"""
    console.print(Panel(
        "[bold cyan]Project Scope Analyzer[/bold cyan]\n\n"
        "[bold]Version:[/bold] 1.0.0\n"
        "[bold]Description:[/bold] AI-powered project scope analysis tool\n\n"
        "[bold]Analysis Capabilities:[/bold]\n"
        "  • Main Scope Analysis\n"
        "  • Requirements Quality Check (INVEST)\n"
        "  • Risk Assessment\n"
        "  • Technical Complexity Analysis\n"
        "  • Scope Creep Detection\n"
        "  • Stakeholder Questions Generation\n"
        "  • Assumption Extraction\n\n"
        "[bold]Requirements:[/bold]\n"
        "  • ANTHROPIC_API_KEY environment variable\n"
        "  • Python 3.8+\n\n"
        "[bold]Usage:[/bold]\n"
        "  python main.py analyze <document_path> [options]\n"
        "  python main.py analyze --help",
        border_style="cyan"
    ))


if __name__ == "__main__":
    app()

