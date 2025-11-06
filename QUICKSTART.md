# 🚀 Quick Start Guide

Get up and running with Project Scope Analyzer in 5 minutes!

## Step 1: Setup (2 minutes)

```bash
# Run the setup script
./setup.sh
```

This will:
- Create a virtual environment
- Install all dependencies
- Create a `.env` file
- Set up the reports directory

## Step 2: Add Your API Key (1 minute)

1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Open `.env` file
3. Replace `your_api_key_here` with your actual key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

## Step 3: Run Your First Analysis (2 minutes)

### Option A: Quick Test
```bash
# Activate virtual environment (if not already)
source venv/bin/activate

# Run a quick analysis on an example
python main.py analyze examples/good_scope_example.md --quick
```

### Option B: Full Analysis
```bash
python main.py analyze examples/good_scope_example.md \
  --name "Customer Portal" \
  --type "web app" \
  --team-size "5 developers" \
  --timeline "12 weeks"
```

### Option C: Test All Examples
```bash
./run_example.sh
```

## Step 4: Analyze Your Own Document

```bash
python main.py analyze path/to/your/document.md \
  --name "Your Project Name" \
  --type "web app" \
  --industry "your industry" \
  --team-size "X developers" \
  --timeline "X weeks"
```

## What You'll Get

After analysis completes, you'll see:

1. **Console Output:**
   - Scope Clarity Score (0-100)
   - Overall Risk Level
   - Number of analysis stages completed

2. **Markdown Report:**
   - Saved in `reports/` directory
   - Comprehensive analysis with:
     - Critical issues
     - Missing elements
     - Risk assessment
     - Stakeholder questions
     - Recommendations

## Understanding Your Results

### Scope Clarity Score

- **90-100**: ✅ Excellent - Ready to start
- **75-89**: ✅ Good - Minor clarifications needed  
- **60-74**: ⚠️ Fair - Some work needed
- **40-59**: ⚠️ Poor - Significant refinement required
- **0-39**: 🚨 Critical - Major scope problems

### Risk Level

- **LOW**: ✅ Proceed with confidence
- **MEDIUM**: ⚠️ Proceed with caution
- **HIGH**: 🚨 Address issues first
- **CRITICAL**: 🛑 Not ready to start

## Common Commands

```bash
# Quick analysis (faster, less detailed)
python main.py analyze document.md --quick

# Verbose mode (see progress)
python main.py analyze document.md --verbose

# Custom output location
python main.py analyze document.md --output my_report.md

# Show tool information
python main.py info

# Show help
python main.py --help
```

## Troubleshooting

### "API key not found"
- Make sure `.env` file exists
- Check that your API key is correctly set in `.env`

### "ModuleNotFoundError"
- Activate virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### "Command not found: python"
- Try `python3` instead of `python`

## Next Steps

1. ✅ Analyze your actual project documentation
2. 📊 Review the generated report
3. ❓ Use the generated questions in stakeholder meetings
4. 📝 Update your documentation based on findings
5. 🔄 Re-analyze after making changes

## Need More Help?

- **Full Documentation**: See `README.md`
- **Detailed Guide**: See `USAGE_GUIDE.md`
- **Example Documents**: Check `examples/` directory
- **Configuration**: Review `config.py`

---

**Ready? Let's analyze some scopes!** 🎯

