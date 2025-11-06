# 🎯 Project Scope Analyzer

> AI-powered project scope analysis tool that identifies ambiguities, risks, and scope creep before they derail your project.

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Overview

Project Scope Analyzer uses advanced AI (Claude by Anthropic) to analyze project documentation and provide comprehensive insights:

- **Scope Clarity Scoring** - Get an objective 0-100 score on how well-defined your project scope is
- **Risk Detection** - Identify technical, timeline, resource, and stakeholder risks
- **Ambiguity Flagging** - Find vague requirements that could cause confusion
- **Scope Creep Detection** - Catch features that could balloon out of control
- **Requirements Quality Analysis** - INVEST criteria evaluation for each requirement
- **Technical Complexity Assessment** - Uncover hidden complexity in "simple" features
- **Stakeholder Questions** - Generate targeted questions for different stakeholder groups
- **Assumption Extraction** - Surface implicit assumptions that need validation

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. **Clone or download this repository**

```bash
cd "Project Scope Analyzer"
```

2. **Create virtual environment**

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Set up API key**

Create a `.env` file in the project root:

```bash
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
```

Or set it as an environment variable:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

### Basic Usage

```bash
python main.py analyze path/to/your/project_document.md
```

## 📖 Usage Examples

### Standard Analysis

Analyze a project document with all analysis stages:

```bash
python main.py analyze examples/good_scope_example.md \
  --name "Customer Portal" \
  --type "web app" \
  --industry "financial services" \
  --team-size "5 developers" \
  --timeline "12 weeks"
```

### Quick Analysis

Run only the main analysis (faster, less detailed):

```bash
python main.py analyze examples/poor_scope_example.md --quick
```

### Custom Output Location

Save the report to a specific location:

```bash
python main.py analyze my_project.md --output reports/my_analysis.md
```

### Verbose Mode

See detailed progress information:

```bash
python main.py analyze my_project.md --verbose
```

## 📊 Analysis Stages

The analyzer runs multiple analysis stages (can be toggled in config):

### 1. **Main Analysis**
- Overall scope clarity score (0-100)
- Missing critical elements
- Ambiguous requirements with risk levels
- Scope creep risks
- Hidden complexity
- Conflicting requirements
- Top 10 clarifying questions
- Recommended MVP/Phase breakdown
- Estimation confidence assessment

### 2. **Requirements Quality Check**
- INVEST criteria analysis for each requirement
- Independence, Negotiability, Value, Estimability, Size, Testability
- Overall quality score
- Improvement recommendations

### 3. **Risk Assessment**
- Technical risks
- Scope risks
- Resource risks
- Timeline risks
- Stakeholder risks
- Risk matrix with likelihood and impact
- Mitigation strategies

### 4. **Technical Complexity Analysis**
- Apparent vs. actual complexity
- Hidden technical challenges
- Infrastructure requirements
- Optimistic/realistic/pessimistic time estimates
- Dependency mapping

### 5. **Scope Creep Detection**
- Red flag phrases ("just a small addition", "while we're at it")
- Vague feature boundaries
- Open-ended requirements
- Boundary recommendations

### 6. **Stakeholder Questions**
- Questions for Product Owner
- Questions for End Users
- Questions for Technical Lead
- Questions for QA/Testing
- Questions for DevOps
- Questions for Security/Compliance

### 7. **Assumption Extraction**
- Technology assumptions
- Team assumptions
- Business assumptions
- Data assumptions
- Process assumptions
- Risk if assumptions are wrong
- Validation recommendations

## 📁 Project Structure

```
Project Scope Analyzer/
├── main.py                 # CLI application entry point
├── analyzer.py             # Core analysis engine
├── prompts.py              # AI prompt templates
├── config.py               # Configuration models
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── examples/              # Example project documents
│   ├── good_scope_example.md
│   ├── poor_scope_example.md
│   └── medium_scope_example.md
└── reports/               # Generated reports (auto-created)
```

## 🎯 Example Output

After analysis, you'll receive:

```markdown
# Project Scope Analysis Report

**Scope Clarity Score:** 85/100
**Overall Risk Level:** MEDIUM
**Analysis Date:** 2024-11-05 14:30:00

## Executive Summary

Your project scope is well-defined with clear objectives and success metrics.
However, there are 3 critical areas requiring attention before development begins...

## 🚨 Critical Issues

1. **Database scalability not specified** - HIGH RISK
   - Impact: Could fail under load
   - Recommendation: Define performance requirements and load testing criteria

2. **Third-party API rate limits unknown** - MEDIUM RISK
   - Impact: Could cause service interruptions
   - Recommendation: Confirm rate limits with vendor, implement circuit breakers

## 📊 Detailed Analysis

### Missing Elements
- ❌ Error handling strategy not defined
- ❌ Monitoring and alerting requirements missing
- ✅ Success metrics well-defined
- ✅ Timeline clearly specified

[... detailed analysis continues ...]
```

## ⚙️ Configuration

You can customize the analysis in `config.py` or by modifying `AnalyzerConfig`:

```python
config = AnalyzerConfig(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    temperature=0.7,
    run_requirements_quality=True,
    run_risk_assessment=True,
    verbose=True
)
```

## 📝 Supported Document Formats

Currently supports:
- Markdown (`.md`)
- Plain text (`.txt`)

Coming soon:
- Microsoft Word (`.docx`)
- PDF (`.pdf`)
- HTML

## 🎓 Best Practices

### For Best Results:

1. **Provide Complete Context**
   - Include project name, type, industry, team size, timeline
   - More context = better analysis

2. **Use Structured Documents**
   - Clear sections and headings
   - Bullet points for requirements
   - See `examples/good_scope_example.md`

3. **Run Early and Often**
   - Analyze during initial planning phase
   - Re-analyze after major scope changes
   - Use findings to improve documentation

4. **Act on Findings**
   - Address critical issues before starting development
   - Use generated questions in stakeholder meetings
   - Incorporate recommendations into scope documents

### Document Quality Tips:

✅ **Good Scope Document:**
- Clear objectives and success metrics
- Specific, testable requirements
- Defined constraints and assumptions
- Explicit out-of-scope items
- Identified dependencies and risks

❌ **Poor Scope Document:**
- Vague goals ("make it better", "user-friendly")
- Open-ended features ("flexible system", "scalable platform")
- No constraints or timeline
- No success metrics
- Feature lists without acceptance criteria

## 🧪 Testing with Examples

Test the analyzer with provided examples:

```bash
# Should score 80-95 (excellent scope)
python main.py analyze examples/good_scope_example.md

# Should score 20-45 (poor scope, many issues)
python main.py analyze examples/poor_scope_example.md

# Should score 50-75 (needs improvement)
python main.py analyze examples/medium_scope_example.md
```

## 🔧 Troubleshooting

### API Key Issues

```
Error: API key not found
```
- Ensure `.env` file exists with `ANTHROPIC_API_KEY`
- Or set environment variable: `export ANTHROPIC_API_KEY=your_key`

### Import Errors

```
ModuleNotFoundError: No module named 'anthropic'
```
- Ensure virtual environment is activated
- Run: `pip install -r requirements.txt`

### Rate Limits

If you hit API rate limits:
- Use `--quick` mode for faster analysis
- Reduce `max_tokens` in config
- Wait a moment before retrying

## 💡 Use Cases

### For Project Managers
- Validate scope clarity before project kickoff
- Generate risk registers automatically
- Create comprehensive question lists for stakeholders
- Identify scope creep early

### For Business Analysts
- Improve requirements quality (INVEST criteria)
- Find ambiguous or conflicting requirements
- Generate user stories from requirements
- Validate assumptions

### For Technical Leads
- Assess technical complexity and risks
- Identify infrastructure needs
- Estimate effort with confidence levels
- Plan technical phases and dependencies

### For Stakeholders
- Understand project risks and dependencies
- See what questions need answers
- Validate that scope matches expectations
- Make informed go/no-go decisions

## 🛣️ Roadmap

- [ ] Document format support (DOCX, PDF)
- [ ] User story generation from requirements
- [ ] Visual risk matrix generation
- [ ] HTML report output
- [ ] Comparison mode (analyze multiple versions)
- [ ] Custom prompt templates
- [ ] Integration with Jira/Azure DevOps
- [ ] Team collaboration features
- [ ] Historical analysis tracking

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional analysis prompts
- Better score calculation algorithms
- Support for more document formats
- Integration with project management tools
- Improved report formatting

## 📧 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Check existing examples for guidance
- Review the AI prompts in `prompts.py` to understand analysis criteria

## 🙏 Acknowledgments

- Built with [Anthropic Claude](https://www.anthropic.com/)
- CLI powered by [Typer](https://typer.tiangolo.com/)
- Beautiful terminal output by [Rich](https://rich.readthedocs.io/)

---

**Made with ❤️ for better project scoping**

*Stop scope creep before it starts!*

