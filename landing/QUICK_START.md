# 🚀 Quick Start: Landing Page

Get your landing page running in 5 minutes!

## Prerequisites

- Node.js 20+
- PostgreSQL database (already configured)
- Resend API key (already in `.env`)

## Steps

### 1. Create Database Table

```bash
cd services/notification-service

# Generate migration
npm run db:generate

# Run migration
npm run db:migrate
```

This creates the `waitlist` table in your database.

### 2. Start Notification Service

```bash
cd services/notification-service
npm run dev
```

The API will be available at `http://localhost:3007`

### 3. Serve Landing Page

**Option A: Python**
```bash
cd landing
python3 -m http.server 8000
```

**Option B: npx serve**
```bash
cd landing
npx serve .
```

Visit: **http://localhost:8000**

### 4. Test It!

1. Open http://localhost:8000
2. Enter your email
3. Click "Join Waitlist"
4. Check your email inbox! 📧

## Test Script

Run automated tests:

```bash
./scripts/test-landing-page.sh
```

This will:
- ✅ Check if notification service is running
- ✅ Test adding email to waitlist
- ✅ Test duplicate email rejection
- ✅ Test invalid email rejection
- ✅ Get waitlist count

## What's Next?

### Deploy to Production

```bash
cd landing
vercel --prod
```

### Add Analytics

Add Google Analytics ID in `index.html`:
```html
<!-- Replace GA_MEASUREMENT_ID with your actual ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Share on Social Media

1. Twitter/X: "Just launched our waitlist! 🚀"
2. LinkedIn: Professional post about your journey
3. Product Hunt: Prepare for launch day

## Troubleshooting

**Landing page not loading?**
- Check if you're in the `landing` directory
- Try a different port: `python3 -m http.server 8001`

**API not working?**
- Check if notification-service is running: `curl http://localhost:3007/health`
- Check database connection in `.env`
- Check Resend API key in `.env`

**Email not sending?**
- Check Resend API key is valid
- Check spam folder
- Check notification-service logs

## Files Created

- `landing/index.html` - Landing page
- `landing/README.md` - Full documentation
- `services/notification-service/src/routes/waitlist.ts` - API endpoint
- `services/notification-service/src/db/schema.ts` - Database schema
- `scripts/test-landing-page.sh` - Test script

## Support

Questions? Check:
- [`landing/README.md`](./landing/README.md) - Full documentation
- [`walkthrough.md`](../.gemini/antigravity/brain/1ac9ad24-fe3c-493a-a93c-90942105e77b/walkthrough.md) - Implementation walkthrough

---

**Ready to collect emails! 🎉**
