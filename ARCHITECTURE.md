# Project Scope Analyzer - System Architecture

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└────────────────────┬────────────────────────────────────────┘
                     │ CLI Commands
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                     main.py (CLI Layer)                      │
│  - Command parsing (Typer)                                  │
│  - User interaction (Rich)                                   │
│  - Input validation                                          │
│  - Output formatting                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  analyzer.py (Core Engine)                   │
│  - Analysis orchestration                                    │
│  - Multi-stage workflow                                      │
│  - API communication                                         │
│  - Score calculation                                         │
│  - Risk assessment                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌──────────────────┐    ┌──────────────────┐
│   prompts.py     │    │   config.py      │
│  - 7 Analysis    │    │  - Settings      │
│    Prompts       │    │  - Metadata      │
│  - Templates     │    │  - Validation    │
└────────┬─────────┘    └──────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────────┐
│                   Anthropic Claude API                       │
│              (claude-sonnet-4-20250514)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   Analysis Results                           │
│  - Scope score                                               │
│  - Risk assessment                                           │
│  - Recommendations                                           │
│  - Questions                                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  Markdown Report (Output)                    │
│  Saved to: reports/scope_analysis_[timestamp].md            │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Details

### 1. CLI Layer (main.py)

**Responsibilities:**
- Parse command-line arguments
- Load project documents
- Display progress and results
- Save reports to files
- Handle errors gracefully

**Key Functions:**
- `analyze()` - Main command handler
- `info()` - Display tool information

**Dependencies:**
- typer (CLI framework)
- rich (Console output)
- dotenv (Environment variables)

### 2. Analysis Engine (analyzer.py)

**Class: ProjectScopeAnalyzer**

```python
class ProjectScopeAnalyzer:
    def __init__(config: AnalyzerConfig)
    def analyze(document: str, metadata: ProjectMetadata) -> Dict[str, str]
    def generate_report(results: Dict[str, str]) -> str
    def extract_score(main_analysis: str) -> Optional[int]
    def calculate_risk_level(results: Dict[str, str]) -> str
    def _call_claude(prompt: str, stage_name: str) -> str
```

**Responsibilities:**
- Orchestrate 7 analysis stages
- Communicate with Claude API
- Track progress
- Calculate metrics
- Generate final report

**Analysis Stages:**
1. Main Analysis (always runs)
2. Requirements Quality (INVEST)
3. Risk Assessment
4. Technical Complexity
5. Scope Creep Detection
6. Stakeholder Questions
7. Assumption Extraction

### 3. Prompt Templates (prompts.py)

**Class: PromptTemplates**

```python
class PromptTemplates:
    @staticmethod
    def main_analysis(...) -> str
    @staticmethod
    def requirements_quality(document: str) -> str
    @staticmethod
    def risk_assessment(document: str) -> str
    @staticmethod
    def technical_complexity(document: str) -> str
    @staticmethod
    def scope_creep_detector(document: str) -> str
    @staticmethod
    def stakeholder_questions(document: str) -> str
    @staticmethod
    def assumption_extractor(document: str) -> str
    @staticmethod
    def format_report(...) -> str
```

**Prompt Design Principles:**
- Clear role definition ("You are an expert...")
- Specific output format requirements
- Concrete examples where helpful
- Structured section headers
- Actionable recommendations

### 4. Configuration (config.py)

**Models:**

```python
class ProjectMetadata(BaseModel):
    project_name: str
    project_type: str
    industry: str
    team_size: str
    timeline: str

class AnalyzerConfig(BaseModel):
    api_key: Optional[str]
    model: str
    max_tokens: int
    temperature: float
    run_main_analysis: bool
    run_requirements_quality: bool
    # ... other stage flags
    verbose: bool
    save_to_file: bool
    output_format: str
```

## 🔄 Data Flow

### Input Processing

```
User Document (MD/TXT)
    ↓
Read from filesystem
    ↓
Loaded into memory
    ↓
Combined with metadata
    ↓
Passed to analyzer
```

### Analysis Flow

```
For each enabled stage:
    ↓
Load appropriate prompt template
    ↓
Insert document + context
    ↓
Send to Claude API
    ↓
Receive analysis result
    ↓
Store in results dictionary
    ↓
Display progress to user
    
After all stages:
    ↓
Combine all results
    ↓
Generate final report
    ↓
Calculate summary metrics
```

### Output Processing

```
Analysis Results
    ↓
Format as Markdown
    ↓
Add metadata header
    ↓
Save to file
    ↓
Display summary to console
    ↓
Show preview to user
```

## 🎯 Analysis Pipeline

### Stage 1: Main Analysis
**Input:** Full document + metadata  
**Output:** 
- Scope clarity score (0-100)
- Missing critical elements
- Ambiguous requirements
- Scope creep risks
- Hidden complexity
- Conflicting requirements
- Top 10 questions
- Recommended breakdown
- Estimation confidence

**Prompt Size:** ~1500 tokens  
**Expected Output:** ~2000-3000 tokens

### Stage 2: Requirements Quality
**Input:** Full document  
**Output:**
- INVEST analysis per requirement
- Overall INVEST score
- Top 5 requirements needing improvement
- Suggested rewrites

**Prompt Size:** ~800 tokens  
**Expected Output:** ~1500-2500 tokens

### Stage 3: Risk Assessment
**Input:** Full document  
**Output:**
- Risks by category (Technical, Scope, Resource, Timeline, Stakeholder)
- Likelihood and impact ratings
- Priority scores
- Mitigation strategies
- Risk owners

**Prompt Size:** ~900 tokens  
**Expected Output:** ~2000-3000 tokens

### Stage 4: Technical Complexity
**Input:** Full document  
**Output:**
- Feature-by-feature complexity analysis
- Apparent vs actual complexity
- Hidden challenges
- Infrastructure requirements
- Time estimates (optimistic/realistic/pessimistic)

**Prompt Size:** ~900 tokens  
**Expected Output:** ~2000-3500 tokens

### Stage 5: Scope Creep Detection
**Input:** Full document  
**Output:**
- Red flag phrases identified
- Scope creep risk per issue
- Boundary recommendations
- Suggested scope statement

**Prompt Size:** ~700 tokens  
**Expected Output:** ~1500-2000 tokens

### Stage 6: Stakeholder Questions
**Input:** Full document  
**Output:**
- Questions for 6 stakeholder types
- 5-7 questions per stakeholder
- Priority indicators
- "Blocking" flags

**Prompt Size:** ~800 tokens  
**Expected Output:** ~1500-2000 tokens

### Stage 7: Assumption Extraction
**Input:** Full document  
**Output:**
- Assumptions by category
- Explicit vs implicit classification
- Risk ratings
- Validation recommendations

**Prompt Size:** ~900 tokens  
**Expected Output:** ~1500-2500 tokens

### Final Stage: Report Generation
**Input:** All previous results  
**Output:**
- Executive summary
- Consolidated findings
- Prioritized recommendations
- Confidence assessment

**Prompt Size:** ~1000 tokens + all results  
**Expected Output:** ~3000-5000 tokens

## 📊 Scoring Algorithms

### Scope Clarity Score (0-100)

**Extracted from:** Main Analysis  
**Method:** Regex pattern matching in Claude's response

Looks for patterns:
- "Score: 75/100"
- "Scope Clarity Score: 75"
- "75/100"

### Risk Level Calculation

**Input:** All analysis results  
**Method:** Keyword frequency weighting

```python
risk_keywords = {
    'critical': 10,
    'high': 5,
    'medium': 2,
    'low': 1
}

total_score = sum(count(keyword) * weight)

if total_score >= 50: "CRITICAL"
elif total_score >= 30: "HIGH"
elif total_score >= 15: "MEDIUM"
else: "LOW"
```

## 🔧 Configuration Options

### API Configuration
- `api_key`: Anthropic API key
- `model`: Claude model version
- `max_tokens`: Max response length
- `temperature`: Randomness (0.0-1.0)

### Analysis Stage Toggles
- `run_main_analysis`: Always true
- `run_requirements_quality`: Toggle
- `run_risk_assessment`: Toggle
- `run_technical_complexity`: Toggle
- `run_scope_creep_detection`: Toggle
- `run_stakeholder_questions`: Toggle
- `run_assumption_extraction`: Toggle

### Output Options
- `verbose`: Show detailed progress
- `save_to_file`: Save report to file
- `output_format`: markdown | json | html (future)

## 🔒 Security Considerations

### API Key Management
- Stored in `.env` file (git-ignored)
- Never logged or displayed
- Can be environment variable
- No hardcoding in code

### Document Privacy
- Documents processed in memory only
- No persistent storage
- Sent only to Anthropic API
- Not shared or tracked

### Report Security
- Saved locally only
- No cloud uploads
- User controls location
- Can be deleted anytime

## ⚡ Performance Characteristics

### Timing Estimates
- Quick mode (~30 seconds)
  - Main analysis only
  
- Full mode (~2-3 minutes)
  - All 7 stages
  - Dependent on document size

### API Usage
- ~5-10K tokens per analysis stage
- ~40-70K tokens for full analysis
- Cost: ~$0.10-0.30 per full analysis (Claude Sonnet 4)

### Optimizations
- Parallel API calls (future)
- Prompt caching (future)
- Streaming responses (future)

## 🧪 Testing Strategy

### Example Documents
Three test cases with known expectations:

1. **Good Scope**
   - Expected: 80-95 score
   - Expected: LOW-MEDIUM risk
   - Validates: Positive case handling

2. **Poor Scope**
   - Expected: 20-45 score
   - Expected: HIGH-CRITICAL risk
   - Validates: Issue detection

3. **Medium Scope**
   - Expected: 50-75 score
   - Expected: MEDIUM risk
   - Validates: Typical case handling

### Validation Approach
- Manual review of outputs
- Score range verification
- Issue identification accuracy
- Question relevance check

## 🛣️ Extension Points

### Custom Prompts
Add new analysis types in `prompts.py`:

```python
@staticmethod
def my_custom_analysis(document: str) -> str:
    return f"""Your custom prompt here..."""
```

### Custom Stages
Add to `analyzer.py`:

```python
if self.config.run_my_custom_analysis:
    results['my_analysis'] = self._call_claude(
        self.prompts.my_custom_analysis(document),
        "My Custom Analysis"
    )
```

### Output Formats
Extend report generation:

```python
def generate_html_report(results: Dict) -> str:
    # Convert markdown to HTML
    pass

def generate_json_report(results: Dict) -> str:
    # Structure as JSON
    pass
```

### Document Parsers
Add format support:

```python
def parse_docx(file_path: str) -> str:
    # Extract text from DOCX
    pass

def parse_pdf(file_path: str) -> str:
    # Extract text from PDF
    pass
```

## 📚 Dependencies

### Production Dependencies
- `anthropic>=0.18.0` - Claude API client
- `python-dotenv>=1.0.0` - Environment variables
- `pydantic>=2.5.0` - Data validation
- `rich>=13.7.0` - Console output
- `typer>=0.9.0` - CLI framework

### Optional Dependencies
- `python-docx>=1.1.0` - DOCX parsing (future)
- `pypdf>=3.17.0` - PDF parsing (future)
- `markdown>=3.5.0` - Markdown processing (future)

## 🔄 State Management

### Application State
- **Stateless**: Each run is independent
- **No persistence**: Results not stored in DB
- **No caching**: Fresh analysis each time

### Configuration State
- Loaded from `config.py` defaults
- Can be overridden per-run
- Environment variables take precedence

### Session State
- Exists only during execution
- Stored in memory (Python variables)
- Cleared after completion

## 💡 Design Patterns Used

### 1. Template Method Pattern
- `PromptTemplates` class
- Reusable prompt structures
- Easy to modify and extend

### 2. Strategy Pattern
- Different analysis strategies
- Configurable stage execution
- Pluggable analyzers

### 3. Builder Pattern
- Report generation
- Combines multiple analysis results
- Builds cohesive output

### 4. Facade Pattern
- `ProjectScopeAnalyzer` class
- Simple interface to complex subsystem
- Hides API complexity

---

**Last Updated:** November 2024  
**Version:** 1.0.0

