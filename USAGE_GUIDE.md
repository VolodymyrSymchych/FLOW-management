# Project Scope Analyzer - Usage Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Command Line Interface](#command-line-interface)
3. [Understanding the Output](#understanding-the-output)
4. [Best Practices](#best-practices)
5. [Advanced Usage](#advanced-usage)
6. [Interpreting Scores](#interpreting-scores)

## Getting Started

### First Time Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up your API key:
```bash
# Option 1: Create .env file
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Option 2: Export environment variable
export ANTHROPIC_API_KEY=your_key_here
```

3. Test with an example:
```bash
python main.py analyze examples/good_scope_example.md
```

### Quick Test
```bash
# Run the example script to test all three sample documents
./run_example.sh
```

## Command Line Interface

### Basic Command Structure
```bash
python main.py analyze <document_path> [OPTIONS]
```

### Available Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--name` | `-n` | Project name | "Unknown Project" |
| `--type` | `-t` | Project type | "software development" |
| `--industry` | `-i` | Industry | "technology" |
| `--team-size` | `-s` | Team size | "not specified" |
| `--timeline` | `-d` | Timeline | "not specified" |
| `--output` | `-o` | Output file path | Auto-generated |
| `--verbose` | `-v` | Verbose output | False |
| `--quick` | `-q` | Quick mode (main analysis only) | False |

### Common Use Cases

#### 1. Basic Analysis
```bash
python main.py analyze my_project.md
```

#### 2. Full Context Analysis
```bash
python main.py analyze project.md \
  --name "Mobile App Redesign" \
  --type "mobile application" \
  --industry "healthcare" \
  --team-size "8 developers, 2 designers" \
  --timeline "16 weeks"
```

#### 3. Quick Analysis (Faster, Less Detailed)
```bash
python main.py analyze project.md --quick
```

#### 4. Verbose Mode (See Progress)
```bash
python main.py analyze project.md --verbose
```

#### 5. Custom Output Location
```bash
python main.py analyze project.md --output reports/analysis_v2.md
```

#### 6. View Tool Info
```bash
python main.py info
```

## Understanding the Output

### Report Sections

#### 1. **Scope Clarity Score (0-100)**
- **90-100**: Excellent - Ready to start
- **75-89**: Good - Minor clarifications needed
- **60-74**: Fair - Some ambiguities to resolve
- **40-59**: Poor - Significant work needed
- **0-39**: Critical - Major scope problems

#### 2. **Risk Level**
- **LOW**: Well-defined, minimal unknowns
- **MEDIUM**: Some ambiguities, manageable risks
- **HIGH**: Multiple red flags, needs attention
- **CRITICAL**: Major issues, not ready to start

#### 3. **Critical Issues**
Top 3-5 issues that could derail the project:
- Each includes impact and recommendation
- Address these BEFORE starting development

#### 4. **Missing Elements**
Checklist of what's absent from the scope:
- Objectives & goals
- Success metrics
- Technical requirements
- Constraints
- Assumptions
- Dependencies
- Stakeholders
- Acceptance criteria

#### 5. **Ambiguous Requirements**
Vague or unclear statements:
- Exact quote from document
- Why it's problematic
- Risk level
- How to clarify

#### 6. **Hidden Complexity**
Features that seem simple but aren't:
- Apparent vs. actual complexity
- Technical challenges
- Infrastructure needs
- Time estimates (optimistic/realistic/pessimistic)

#### 7. **Risk Assessment**
Categorized risks with mitigation:
- Technical risks
- Scope risks
- Resource risks
- Timeline risks
- Stakeholder risks

#### 8. **Stakeholder Questions**
Targeted questions for:
- Product Owner / Business Sponsor
- End Users
- Technical Lead / Architect
- QA / Testing
- DevOps / Operations
- Security / Compliance

#### 9. **Recommendations**
- Immediate actions
- Scope refinement (MVP, Phase 2, Future)
- Process improvements

#### 10. **Confidence Assessment**
- Readiness to start
- Estimation confidence
- Overall risk level

## Best Practices

### 1. When to Use the Analyzer

✅ **Good Times:**
- During initial project planning
- Before writing detailed requirements
- After receiving stakeholder input
- Before estimation/planning poker
- When scope changes significantly
- Before project kickoff

❌ **Not Ideal:**
- After development has started
- For tiny feature requests
- When scope is already crystal clear
- For routine bug fixes

### 2. Document Preparation

**Before Analysis:**
- [ ] Gather all available project documentation
- [ ] Combine into a single document if multiple sources
- [ ] Include any constraints, assumptions, or context
- [ ] Remove any sensitive/confidential information

**Document Should Include:**
- Project objectives and goals
- Feature descriptions
- User stories or requirements
- Technical constraints
- Timeline and budget info
- Team composition
- Any known risks or concerns

### 3. Acting on Results

**Immediate Actions:**
1. Review critical issues first
2. Address "blocking" items before kickoff
3. Use generated questions in stakeholder meetings
4. Update documentation based on findings

**Short-term:**
1. Improve requirements quality (INVEST criteria)
2. Define clear boundaries for vague features
3. Document assumptions that need validation
4. Create risk mitigation plans

**Long-term:**
1. Use findings to improve requirements process
2. Create templates based on "good" elements
3. Train team on common issues identified
4. Make this analysis a standard step

### 4. Iterative Analysis

**Re-analyze When:**
- Scope changes significantly (>20% change)
- New stakeholders add requirements
- Technical constraints change
- Major risks are discovered
- Before each major phase

**Compare Results:**
- Track score improvements over time
- Ensure previous issues are resolved
- Catch new problems early
- Measure documentation quality improvement

## Advanced Usage

### 1. Programmatic Usage

You can use the analyzer in your own Python scripts:

```python
from analyzer import ProjectScopeAnalyzer
from config import ProjectMetadata, AnalyzerConfig

# Setup
config = AnalyzerConfig(
    api_key="your_api_key",
    verbose=True
)

metadata = ProjectMetadata(
    project_name="My Project",
    project_type="web app",
    industry="fintech",
    team_size="5 developers",
    timeline="10 weeks"
)

# Analyze
analyzer = ProjectScopeAnalyzer(config)
document = open("project.md").read()
results = analyzer.analyze(document, metadata)

# Generate report
report = analyzer.generate_report(results)

# Get metrics
score = analyzer.extract_score(results['main_analysis'])
risk = analyzer.calculate_risk_level(results)

print(f"Score: {score}/100")
print(f"Risk: {risk}")
```

### 2. Custom Configuration

Create custom configurations for different use cases:

```python
# Quick scan configuration
quick_config = AnalyzerConfig(
    run_main_analysis=True,
    run_requirements_quality=False,
    run_risk_assessment=False,
    run_technical_complexity=False,
    run_scope_creep_detection=True,  # Keep this one
    run_stakeholder_questions=False,
    run_assumption_extraction=False,
)

# Deep dive configuration
deep_config = AnalyzerConfig(
    run_main_analysis=True,
    run_requirements_quality=True,
    run_risk_assessment=True,
    run_technical_complexity=True,
    run_scope_creep_detection=True,
    run_stakeholder_questions=True,
    run_assumption_extraction=True,
    max_tokens=8000,  # More detailed analysis
)
```

### 3. Batch Processing

Analyze multiple documents:

```bash
# Create a script
for file in projects/*.md; do
    python main.py analyze "$file" \
        --output "reports/$(basename $file .md)_analysis.md"
done
```

### 4. CI/CD Integration

Add to your CI pipeline to check scope quality:

```yaml
# .github/workflows/scope-check.yml
name: Scope Analysis
on:
  pull_request:
    paths:
      - 'docs/requirements/**'

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Analyze scope
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python main.py analyze docs/requirements/scope.md --output analysis.md
      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: scope-analysis
          path: analysis.md
```

## Interpreting Scores

### Scope Clarity Score Breakdown

**90-100: Excellent**
- All critical elements present
- Clear, specific requirements
- Well-defined constraints
- Measurable success criteria
- Low ambiguity
- Action: Ready to start!

**75-89: Good**
- Most elements present
- Minor ambiguities
- Some assumptions need validation
- Action: Quick stakeholder meeting to clarify 2-3 items

**60-74: Fair**
- Several missing elements
- Some vague requirements
- Assumptions not documented
- Action: 1-2 days of refinement needed

**40-59: Poor**
- Many missing elements
- High ambiguity
- Significant risks
- Action: 1-2 weeks of scope work needed

**0-39: Critical**
- Just a feature list
- No clear objectives
- Vague everything
- Major risks
- Action: Start over with proper requirements gathering

### Risk Level Assessment

**Factors Considered:**
- Number of critical/high risks identified
- Technical complexity vs. team capability
- Timeline realism
- Scope creep indicators
- Missing information
- Ambiguous requirements
- Conflicting constraints

**Risk Level Actions:**

**LOW Risk:**
- Standard project management
- Regular monitoring
- Proceed with confidence

**MEDIUM Risk:**
- Enhanced monitoring
- Mitigation plans for top risks
- Regular stakeholder check-ins
- Acceptable to proceed with caution

**HIGH Risk:**
- Detailed risk mitigation plans
- Frequent status reviews
- Consider scope reduction
- Address risks before starting

**CRITICAL Risk:**
- Stop and address issues
- Not ready to start
- Significant scope work needed
- Stakeholder alignment required

## Tips & Tricks

### 1. Getting Better Analysis
- Provide as much context as possible
- Use the metadata options (--name, --type, etc.)
- Include technical details in the document
- Mention any constraints or known issues

### 2. Improving Scores Over Time
- Use findings to create better templates
- Document lessons learned
- Create a "definition of ready" checklist
- Review good vs. poor examples

### 3. Working with Stakeholders
- Share the report with key stakeholders
- Use the generated questions in meetings
- Highlight critical issues in presentations
- Track which recommendations are implemented

### 4. Common Issues & Solutions

**Issue:** Score seems too low
- Solution: Document probably IS unclear - use findings to improve

**Issue:** Too many questions generated
- Solution: Good! It means clarification is needed - prioritize by "blocking" flag

**Issue:** Analysis takes too long
- Solution: Use --quick mode for initial pass, full analysis for important projects

**Issue:** Recommendations seem generic
- Solution: Provide more project context via metadata options

## Support & Resources

- **Examples:** Check `/examples` directory for sample analyses
- **Prompts:** Review `/prompts.py` to understand analysis criteria
- **Issues:** Document problems or feature requests
- **Improvements:** Suggest new analysis types or prompts

---

**Remember:** The goal isn't a perfect score—it's a clear, actionable scope that sets your project up for success!

