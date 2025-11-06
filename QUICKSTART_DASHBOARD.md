# Quick Start - Dashboard

Get the Project Scope Analyzer Dashboard running in 5 minutes.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed
- Anthropic API key

## Step 1: Set API Key

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

## Step 2: Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd dashboard
npm install
cd ..
```

## Step 3: Start Dashboard

### Option A: Use the startup script (Recommended)

```bash
./start_dashboard.sh
```

### Option B: Start manually

```bash
# Terminal 1 - Backend
python api.py

# Terminal 2 - Frontend
cd dashboard
npm run dev
```

## Step 4: Open Dashboard

Open your browser to: **http://localhost:3000**

## First Steps

1. **Toggle Theme**: Click the sun/moon icon in the header
2. **Create Analysis**: Click "New Analysis" button
3. **Upload Document**: Drag & drop a .md or .txt file, or paste content
4. **Fill Project Info**: Add name, type, industry, team size, timeline
5. **Start Analysis**: Click "Start Analysis" button
6. **View Results**: See scope clarity score and detailed report

## Test with Example

```bash
# Create a test analysis
python main.py analyze examples/good_scope_example.md

# Then view it in the dashboard at http://localhost:3000
```

## Troubleshooting

**Can't connect to backend?**
- Ensure Flask is running on port 5000
- Check `http://localhost:5000/api/health`

**Theme not switching?**
- Clear browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

**Missing dependencies?**
```bash
# Backend
pip install flask flask-cors

# Frontend
cd dashboard && npm install
```

## What's Included

✅ Light & Dark themes
✅ Project dashboard with stats
✅ Real-time progress tracking
✅ Project analysis with AI
✅ Visual score display
✅ Risk level indicators
✅ Downloadable reports
✅ Responsive design

## Next Steps

- Read [DASHBOARD_SETUP.md](DASHBOARD_SETUP.md) for detailed documentation
- Check [DASHBOARD_FEATURES.md](DASHBOARD_FEATURES.md) for feature overview
- Review [USAGE_GUIDE.md](USAGE_GUIDE.md) for analysis tips

---

**Happy analyzing!** 🎯
