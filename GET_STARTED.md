# 🚀 Get Started with Project Scope Analyzer

## ⚡ 3-Step Quick Start

### Step 1: Run Setup (30 seconds)
```bash
./setup.sh
```

This creates your virtual environment and installs everything you need.

### Step 2: Add Your API Key (30 seconds)
1. Get your key from: https://console.anthropic.com/
2. Open `.env` file
3. Replace `your_api_key_here` with your actual key

### Step 3: Analyze! (2 minutes)
```bash
# Activate environment
source venv/bin/activate

# Run your first analysis
python main.py analyze examples/good_scope_example.md
```

## 🎯 What You Get

After running the analyzer, you'll receive:

### 1. Console Output
```
✓ Loaded document: good_scope_example.md
✓ Main analysis complete
✓ Requirements quality check complete
✓ Risk assessment complete
✓ Technical complexity analysis complete
✓ Scope creep detection complete
✓ Stakeholder questions generated
✓ Assumption extraction complete
✓ Report generation complete

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     Analysis Complete        ┃
┃                              ┃
┃ Scope Clarity Score: 87/100 ┃
┃ Overall Risk Level: MEDIUM  ┃
┃ Analysis stages: 7          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

✓ Report saved to: reports/scope_analysis_20241105_143022.md
```

### 2. Detailed Report
A comprehensive Markdown file with:
- **Executive Summary** - High-level overview
- **Scope Clarity Score** - 0-100 rating with explanation
- **Critical Issues** - Top 3-5 issues that could derail the project
- **Missing Elements** - What's absent from documentation
- **Ambiguous Requirements** - Vague statements that need clarification
- **Hidden Complexity** - Simple features that are actually complex
- **Risk Assessment** - Categorized risks with mitigation strategies
- **Stakeholder Questions** - Targeted questions for each stakeholder type
- **Recommendations** - Immediate actions and phasing suggestions
- **Confidence Assessment** - Readiness and risk evaluation

## 📚 Documentation

Choose your path:

### 🏃 I Want to Start NOW
→ **You're reading it!** Just follow the 3 steps above.

### 📖 I Want the Full Guide
→ **QUICKSTART.md** - 5-minute getting started guide with examples

### 🎓 I Want to Learn Everything
→ **README.md** - Complete documentation with all features

### 🔧 I Want Advanced Usage
→ **USAGE_GUIDE.md** - Detailed guide with best practices

### 🏗️ I Want Architecture Details
→ **ARCHITECTURE.md** - System design and technical details

### 📊 I Want Project Overview
→ **PROJECT_SUMMARY.md** - Project summary and design decisions

## 🎮 Try the Examples

Test with three provided examples:

```bash
# 1. Good scope (should score 80-95)
python main.py analyze examples/good_scope_example.md

# 2. Poor scope (should score 20-45) 
python main.py analyze examples/poor_scope_example.md --quick

# 3. Medium scope (should score 50-75)
python main.py analyze examples/medium_scope_example.md
```

Or run all three at once:
```bash
./run_example.sh
```

## 💡 Common Use Cases

### Scenario 1: Quick Scope Check
**Situation:** Just received project requirements, want quick validation

```bash
python main.py analyze project.md --quick
```

**Time:** ~30 seconds  
**Output:** Main analysis with scope score and critical issues

### Scenario 2: Comprehensive Analysis
**Situation:** Planning major project, need detailed analysis

```bash
python main.py analyze project.md \
  --name "Customer Portal" \
  --type "web application" \
  --industry "finance" \
  --team-size "5 developers" \
  --timeline "12 weeks"
```

**Time:** ~2-3 minutes  
**Output:** Full analysis with all 7 stages

### Scenario 3: Stakeholder Meeting Prep
**Situation:** Need questions to ask stakeholders

```bash
python main.py analyze project.md --verbose
```

**Time:** ~2-3 minutes  
**Output:** Full report + detailed progress + stakeholder questions

### Scenario 4: Risk Assessment
**Situation:** Need to present project risks to leadership

```bash
python main.py analyze project.md --output presentation/risks.md
```

**Time:** ~2-3 minutes  
**Output:** Risk assessment + mitigation strategies

## 🔥 Tips for Best Results

### ✅ DO:
- Provide complete project context
- Include constraints and assumptions  
- Use clear section headings in your document
- Run analysis early in planning phase
- Act on the findings

### ❌ DON'T:
- Submit just a feature list
- Skip important metadata (--name, --type, etc.)
- Ignore critical issues in the report
- Wait until development has started
- Analyze incomplete drafts

## 🎯 Interpreting Your Score

| Score | Meaning | Action |
|-------|---------|--------|
| 90-100 | 🟢 Excellent | Ready to start! |
| 75-89 | 🟢 Good | Quick clarification needed |
| 60-74 | 🟡 Fair | 1-2 days of refinement |
| 40-59 | 🟠 Poor | 1-2 weeks of work needed |
| 0-39 | 🔴 Critical | Start over with proper requirements |

## 🆘 Troubleshooting

### "API key not found"
```bash
# Check if .env exists
ls -la .env

# If not, create it
echo "ANTHROPIC_API_KEY=your_key_here" > .env
```

### "ModuleNotFoundError"
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### "Permission denied: ./setup.sh"
```bash
# Make scripts executable
chmod +x setup.sh run_example.sh
```

## 🎊 What's Next?

After your first analysis:

1. ✅ Review the generated report
2. 📝 Note critical issues and recommendations
3. ❓ Use generated questions in stakeholder meetings
4. 🔄 Update your documentation based on findings
5. 🔁 Re-analyze to see improvement

## 💬 Need Help?

- **Examples:** See `/examples` directory
- **Documentation:** See README.md, QUICKSTART.md, USAGE_GUIDE.md
- **Architecture:** See ARCHITECTURE.md
- **Issues:** Check error messages and troubleshooting section

## 🎓 Learning Path

```
1. GET_STARTED.md (you are here!) 
   ↓ Start using the tool
   
2. QUICKSTART.md 
   ↓ Learn common commands
   
3. USAGE_GUIDE.md 
   ↓ Master best practices
   
4. ARCHITECTURE.md 
   ↓ Understand internals
   
5. PROJECT_SUMMARY.md
   ↓ See design decisions
```

---

## 🚀 Ready? Let's Go!

```bash
# 1. Setup
./setup.sh

# 2. Add API key to .env

# 3. Activate environment
source venv/bin/activate

# 4. Analyze!
python main.py analyze examples/good_scope_example.md

# 5. Check your report in reports/ directory
```

**Welcome to better project scoping!** 🎯

---

*Made with ❤️ to help teams avoid scope disasters*

