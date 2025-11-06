# Project Scope Analyzer - Full TypeScript/Next.js Version

Complete dashboard with AI-powered project scope analysis, now fully in TypeScript!

## Quick Start

```bash
# Install dependencies
npm install

# Optional: Set API key for real AI analysis
export ANTHROPIC_API_KEY=your_key_here

# Start dashboard
npm run dev
```

Open **http://localhost:3000** (or 3001 if 3000 is in use)

## Features

### ✅ Complete Dashboard
- Light/Dark theme toggle
- Overview with statistics
- Project management
- Team collaboration
- Messages & notifications
- Billing & settings

### 🤖 AI-Powered Analysis
- Real-time scope analysis using Claude AI
- 7 comprehensive analysis stages:
  - Main scope clarity assessment
  - Requirements quality (INVEST criteria)
  - Risk assessment
  - Technical complexity analysis
  - Scope creep detection
  - Stakeholder questions
  - Assumption extraction

### 📊 Analysis Features
- Scope clarity score (0-100)
- Risk level indicators
- Detailed reports
- Download as Markdown
- Sample projects included

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, dark mode support
- **AI**: Anthropic Claude API (@anthropic-ai/sdk)
- **Icons**: Lucide React
- **Charts**: Recharts (ready for analytics)

## Project Structure

```
dashboard/
├── app/
│   ├── api/                  # API routes (Next.js)
│   │   ├── analyze/         # AI analysis endpoint
│   │   ├── projects/        # Project management
│   │   ├── stats/           # Dashboard stats
│   │   ├── upload/          # File upload
│   │   └── data.ts          # In-memory data store
│   ├── projects/            # Project pages
│   │   ├── page.tsx        # Projects list
│   │   ├── new/            # New analysis
│   │   └── [id]/           # Project detail
│   ├── messages/            # Messages page
│   ├── team/                # Team management
│   ├── billing/             # Billing page
│   ├── settings/            # Settings page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Overview dashboard
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ThemeProvider.tsx   # Theme context
│   ├── ThemeToggle.tsx     # Theme switcher
│   ├── Sidebar.tsx         # Navigation
│   ├── Header.tsx          # Top bar
│   ├── StatsCard.tsx       # Metrics display
│   ├── ProjectCard.tsx     # Project cards
│   └── ...                 # Other components
├── lib/
│   ├── analyzer.ts         # AI analyzer (TypeScript)
│   ├── prompts.ts          # Analysis prompts
│   ├── api.ts              # API client
│   └── utils.ts            # Utilities
└── package.json
```

## API Endpoints

All endpoints are Next.js API routes (no separate backend needed):

```
GET  /api/health                    - Health check
GET  /api/stats                     - Dashboard statistics
GET  /api/projects                  - List all projects
GET  /api/projects/:id              - Get project details
POST /api/analyze                   - Analyze project (AI)
POST /api/upload                    - Upload document
GET  /api/projects/:id/progress     - Analysis progress
```

## Using AI Analysis

### With API Key (Real Analysis)

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Restart the server
npm run dev
```

Now all analyses will use Claude AI for real insights!

### Without API Key (Mock Mode)

The dashboard works without an API key, using mock data. You'll see:
- Sample projects
- Mock analysis results
- Full UI functionality

Perfect for testing and development.

## Sample Projects

4 sample projects are included with varying scope quality:

1. **Customer Portal Redesign** (Score: 85/100) - Excellent scope
2. **Mobile Banking App** (Score: 72/100) - Good scope
3. **Analytics Dashboard** (Score: 91/100) - Outstanding scope
4. **E-commerce Platform** (Score: 45/100) - Needs work

## Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

Create `.env.local` file:

```bash
# Optional: API key for real AI analysis
ANTHROPIC_API_KEY=your_key_here

# Optional: Custom API URL (default: /api)
# NEXT_PUBLIC_API_URL=/api
```

## How It Works

### Analysis Flow

1. User uploads/pastes project document
2. Fills in metadata (name, type, industry, etc.)
3. Clicks "Start Analysis"
4. System runs 7 analysis stages using Claude AI
5. Generates comprehensive report
6. Displays results with visualizations
7. User can download report as Markdown

### AI Analysis Stages

Each stage uses carefully crafted prompts to analyze different aspects:

1. **Main Analysis**: Overall scope clarity, missing elements, ambiguities
2. **Requirements Quality**: INVEST criteria evaluation
3. **Risk Assessment**: Technical, scope, resource, timeline, stakeholder risks
4. **Technical Complexity**: Hidden challenges, infrastructure needs
5. **Scope Creep**: Red flags, boundary recommendations
6. **Stakeholder Questions**: Targeted questions by role
7. **Assumptions**: Explicit/implicit assumptions with validation plans

### Real-Time Progress

The analyzer provides real-time progress updates as it processes each stage.

## Customization

### Theme Colors

Edit [tailwind.config.js](tailwind.config.js):

```javascript
colors: {
  primary: {
    500: '#ef4444',  // Main accent color
    600: '#dc2626',  // Hover state
  }
}
```

### Analysis Stages

Modify [lib/analyzer.ts](lib/analyzer.ts):

```typescript
const analyzer = new ProjectScopeAnalyzer({
  runMainAnalysis: true,
  runRequirementsQuality: true,
  // Enable/disable stages
});
```

### Prompts

Edit [lib/prompts.ts](lib/prompts.ts) to customize AI prompts.

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Other Platforms

1. Build: `npm run build`
2. Set environment variables
3. Start: `npm start`

## Performance

- **Fast**: Next.js App Router with automatic optimization
- **Efficient**: Code splitting and lazy loading
- **Responsive**: Works on all devices
- **Real-time**: Live progress updates during analysis

## Security

- API key stored securely in environment variables
- No API key needed for UI exploration
- All data stored in-memory (replace with database for production)
- CORS configured for API routes

## Production Considerations

For production use:

1. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Authentication**: Add user login/signup
3. **Rate Limiting**: Protect API endpoints
4. **Caching**: Cache analysis results
5. **Monitoring**: Add error tracking (Sentry, etc.)
6. **Analytics**: Track usage patterns

## Troubleshooting

**Port already in use?**
```bash
# Next.js automatically tries next available port
# Or specify port: npm run dev -- -p 3002
```

**API key not working?**
```bash
# Verify it's set
echo $ANTHROPIC_API_KEY

# Restart server after setting
```

**Build errors?**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## License

MIT

## Credits

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- UI components with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ using TypeScript and Next.js**
