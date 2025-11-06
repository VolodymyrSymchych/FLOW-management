# Dashboard Setup Guide

This guide will help you set up the Project Scope Analyzer Dashboard with light and dark themes.

## Architecture

The dashboard consists of two parts:
1. **Flask Backend API** (`api.py`) - Wraps the Python analyzer
2. **Next.js Frontend** (`dashboard/`) - Modern React dashboard with TypeScript and Tailwind CSS

## Prerequisites

- Python 3.8+
- Node.js 18+ and npm
- Anthropic API key

## Quick Start

### 1. Backend Setup

```bash
# From the project root directory
cd "Project Scope Analyzer"

# Install Python dependencies (if not already done)
pip install -r requirements.txt

# Set your API key
export ANTHROPIC_API_KEY=your_api_key_here

# Start the Flask backend
python api.py
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to the dashboard directory
cd "Project Scope Analyzer/dashboard"

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start the development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## Features

### 🎨 Dual Theme Support
- **Light Theme**: Clean, professional look for daytime use
- **Dark Theme**: Easy on the eyes for nighttime work
- Toggle between themes with the button in the header
- System theme detection

### 📊 Dashboard Overview
- **Real-time Statistics**: Projects in progress, completion rate, total projects
- **Project Cards**: Visual representation of each analyzed project
- **Calendar View**: Timeline visualization of project milestones
- **Progress Tracking**: Monitor ongoing analyses
- **Upcoming Tasks**: Stay on top of deadlines

### 🔍 Project Analysis
- **Upload Documents**: Drag & drop or paste project scope documents
- **Comprehensive Analysis**: 7+ analysis stages including:
  - Main scope analysis
  - Requirements quality check (INVEST criteria)
  - Risk assessment
  - Technical complexity analysis
  - Scope creep detection
  - Stakeholder questions
  - Assumption extraction
- **Visual Scoring**: Circular progress indicator for scope clarity score
- **Risk Level Badges**: Color-coded risk indicators
- **Downloadable Reports**: Export analysis results as Markdown

### 👥 Team Collaboration (Coming Soon)
- Share projects with team members
- Comment on analysis results
- Real-time collaboration

## Dashboard Pages

### 1. Overview (`/`)
- Statistics dashboard
- Recent projects
- Calendar view
- Progress indicators

### 2. Projects (`/projects`)
- All projects list
- Search and filter
- Quick actions

### 3. New Analysis (`/projects/new`)
- Upload or paste document
- Configure project metadata
- Start analysis

### 4. Project Detail (`/projects/[id]`)
- Scope clarity score visualization
- Analysis stage breakdown
- Full report view
- Project metadata
- Download options

## API Endpoints

The Flask backend provides these endpoints:

```
GET  /api/health                    - Health check
GET  /api/stats                     - Dashboard statistics
GET  /api/projects                  - List all projects
GET  /api/projects/:id              - Get project details
POST /api/analyze                   - Analyze a project
POST /api/upload                    - Upload a document
GET  /api/projects/:id/progress     - Get analysis progress
```

## Theme Configuration

The theme system uses `next-themes` and Tailwind CSS dark mode. Colors are defined in `tailwind.config.js`:

```javascript
colors: {
  primary: { /* Red accent colors */ },
  background: {
    light: '#f8f9fb',
    dark: '#0f1419',
  },
  card: {
    light: '#ffffff',
    dark: '#1a1f2e',
  },
  sidebar: {
    light: '#2d3142',
    dark: '#141824',
  }
}
```

## Customization

### Changing Colors

Edit `dashboard/tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Change these values
        500: '#ef4444', // Main accent color
        600: '#dc2626', // Hover state
      }
    }
  }
}
```

### Adding New Analysis Stages

1. Update `api.py` to include new analysis stage
2. Update the analyzer configuration in `config.py`
3. The dashboard will automatically display new stages

### Custom Sidebar Navigation

Edit `dashboard/components/Sidebar.tsx`:

```typescript
const navigation = [
  { name: 'Your Page', href: '/your-page', icon: YourIcon },
  // Add more items
];
```

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'flask'`
```bash
pip install flask flask-cors
```

**Problem**: API key not found
```bash
export ANTHROPIC_API_KEY=your_key_here
```

### Frontend Issues

**Problem**: `Module not found` errors
```bash
cd dashboard
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Cannot connect to backend
- Ensure Flask is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Problem**: Theme not switching
- Clear browser cache
- Check browser console for errors

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Flask: Automatically reloads on code changes
- Next.js: Fast refresh updates components instantly

### Debugging
- Backend logs appear in the Flask terminal
- Frontend logs in browser console (F12)

### Database Integration
Currently uses in-memory storage. For production:
1. Choose a database (PostgreSQL, MongoDB, etc.)
2. Update `api.py` to use database models
3. Add database connection configuration

## Production Deployment

### Backend
```bash
# Use a production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api:app
```

### Frontend
```bash
cd dashboard
npm run build
npm start
```

Or deploy to Vercel/Netlify:
```bash
vercel deploy
# or
netlify deploy
```

## Project Structure

```
Project Scope Analyzer/
├── api.py                      # Flask backend
├── analyzer.py                 # Core analysis engine
├── config.py                   # Configuration
├── prompts.py                  # AI prompts
├── requirements.txt            # Python dependencies
├── dashboard/                  # Next.js frontend
│   ├── app/                    # Pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Overview page
│   │   ├── projects/          # Project pages
│   │   │   ├── page.tsx       # Projects list
│   │   │   ├── new/           # New analysis
│   │   │   └── [id]/          # Project detail
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ThemeProvider.tsx  # Theme context
│   │   ├── ThemeToggle.tsx    # Theme switcher
│   │   ├── Sidebar.tsx        # Navigation
│   │   ├── Header.tsx         # Top bar
│   │   ├── StatsCard.tsx      # Statistics
│   │   ├── ProjectCard.tsx    # Project cards
│   │   ├── CalendarView.tsx   # Calendar
│   │   ├── ProgressSection.tsx # Progress bars
│   │   └── UpcomingTasks.tsx  # Task list
│   ├── lib/                   # Utilities
│   │   ├── api.ts            # API client
│   │   └── utils.ts          # Helper functions
│   ├── package.json          # Dependencies
│   ├── tailwind.config.js    # Tailwind config
│   ├── tsconfig.json         # TypeScript config
│   └── next.config.js        # Next.js config
└── DASHBOARD_SETUP.md        # This file
```

## Next Steps

1. **Add Authentication**: Implement user login/signup
2. **Database Integration**: Replace in-memory storage
3. **Real-time Updates**: WebSocket support for live analysis progress
4. **Export Options**: PDF, Word, CSV export formats
5. **Team Features**: Collaboration and sharing
6. **Analytics**: Usage tracking and insights

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review the [USAGE_GUIDE.md](USAGE_GUIDE.md)
- Open an issue on GitHub

---

**Happy Analyzing!** 🎯
