"""
Flask API for Project Scope Analyzer Dashboard
"""
import os
import json
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from config import ProjectMetadata, AnalyzerConfig
from analyzer import ProjectScopeAnalyzer

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# In-memory storage for projects (use database in production)
projects = []
analyses = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects"""
    return jsonify({"projects": projects, "total": len(projects)})

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project"""
    project = next((p for p in projects if p['id'] == project_id), None)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    analysis = analyses.get(project_id, {})
    return jsonify({"project": project, "analysis": analysis})

@app.route('/api/analyze', methods=['POST'])
def analyze_project():
    """Analyze a project document"""
    try:
        data = request.json

        # Extract parameters
        document = data.get('document', '')
        project_name = data.get('project_name', 'Unknown Project')
        project_type = data.get('project_type', 'software development')
        industry = data.get('industry', 'technology')
        team_size = data.get('team_size', 'not specified')
        timeline = data.get('timeline', 'not specified')
        quick = data.get('quick', False)

        if not document:
            return jsonify({"error": "Document content is required"}), 400

        # Setup configuration
        metadata = ProjectMetadata(
            project_name=project_name,
            project_type=project_type,
            industry=industry,
            team_size=team_size,
            timeline=timeline
        )

        config = AnalyzerConfig(
            verbose=False,
            run_requirements_quality=not quick,
            run_risk_assessment=not quick,
            run_technical_complexity=not quick,
            run_scope_creep_detection=not quick,
            run_stakeholder_questions=not quick,
            run_assumption_extraction=not quick,
        )

        # Run analysis
        analyzer = ProjectScopeAnalyzer(config)
        results = analyzer.analyze(document, metadata)
        report = analyzer.generate_report(results)

        # Extract metrics
        score = analyzer.extract_score(results.get('main_analysis', ''))
        risk_level = analyzer.calculate_risk_level(results)

        # Create project entry
        project_id = len(projects) + 1
        project = {
            "id": project_id,
            "name": project_name,
            "type": project_type,
            "industry": industry,
            "team_size": team_size,
            "timeline": timeline,
            "score": score,
            "risk_level": risk_level,
            "created_at": datetime.now().isoformat(),
            "status": "completed"
        }

        # Store results
        projects.append(project)
        analyses[project_id] = {
            "results": results,
            "report": report,
            "metadata": metadata.dict()
        }

        return jsonify({
            "success": True,
            "project": project,
            "analysis": {
                "score": score,
                "risk_level": risk_level,
                "report": report,
                "stages_completed": len(results)
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    total_projects = len(projects)
    in_progress = sum(1 for p in projects if p.get('status') == 'in_progress')
    completed = sum(1 for p in projects if p.get('status') == 'completed')

    # Calculate average completion rate (score)
    scores = [p.get('score', 0) for p in projects if p.get('score')]
    avg_score = sum(scores) / len(scores) if scores else 0

    return jsonify({
        "projects_in_progress": in_progress,
        "total_projects": total_projects,
        "completion_rate": int(avg_score),
        "projects_completed": completed
    })

@app.route('/api/upload', methods=['POST'])
def upload_document():
    """Upload a document file for analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Read file content
        content = file.read().decode('utf-8')

        return jsonify({
            "success": True,
            "filename": file.filename,
            "content": content,
            "size": len(content)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>/progress', methods=['GET'])
def get_progress(project_id):
    """Get real-time analysis progress"""
    # This would track progress in a real implementation
    # For now, return mock progress data
    return jsonify({
        "project_id": project_id,
        "stages": [
            {"name": "Main Analysis", "status": "completed", "progress": 100},
            {"name": "Requirements Quality", "status": "completed", "progress": 100},
            {"name": "Risk Assessment", "status": "in_progress", "progress": 60},
            {"name": "Technical Complexity", "status": "pending", "progress": 0}
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
