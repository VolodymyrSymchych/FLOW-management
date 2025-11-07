# 🚀 Deployment Guide - Project Scope Analyzer

## Recommended Stack for Production

### **Option 1: Vercel (Easiest - Recommended for Next.js)**

Perfect for your Next.js app! Free tier available.

#### Steps:

1. **Push your code to GitHub** ✅ (Already done!)

2. **Sign up at Vercel:**
   - Go to https://vercel.com
   - Sign in with your GitHub account

3. **Import your repository:**
   - Click "Add New Project"
   - Select your GitHub repository: `VolodymyrSymchych/PR-scope`
   - Click "Import"

4. **Configure Environment Variables:**
   ```
   DATABASE_URL=your_neon_postgres_url
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   RESEND_API_KEY=your_resend_key (optional)
   ```

5. **Set Root Directory:**
   - Set root directory to: `dashboard`

6. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app will be live at: `https://your-project-name.vercel.app`

#### Pros:
✅ Automatic deployments on git push
✅ Free SSL certificates
✅ Global CDN
✅ Serverless functions included
✅ Perfect for Next.js
✅ Free tier: 100GB bandwidth/month

---

### **Option 2: Vercel + Neon (Full Stack - Best Performance)**

You're already using Neon for Postgres! This combo is perfect.

**Database (Neon):** ✅ Already set up!
- Your connection string: Already in `.env.local`
- Neon dashboard: https://console.neon.tech

**Frontend (Vercel):**
- Follow Option 1 steps above
- Already configured to work with Neon

#### Total Cost: **FREE**
- Neon Free Tier: 3GB storage
- Vercel Free Tier: Unlimited projects

---

### **Option 3: Railway (All-in-One)**

Simple deployment platform with database included.

#### Steps:

1. **Sign up:** https://railway.app
2. **Create new project from GitHub**
3. **Add Postgres database** (or connect to Neon)
4. **Set environment variables**
5. **Deploy**

#### Cost:
- $5/month (no free tier, but very affordable)
- Includes: Postgres, hosting, SSL

---

### **Option 4: DigitalOcean App Platform**

Good balance of control and simplicity.

#### Steps:

1. **Sign up:** https://www.digitalocean.com/products/app-platform
2. **Create app from GitHub**
3. **Add managed Postgres database**
4. **Configure environment variables**
5. **Deploy**

#### Cost:
- ~$12/month (app + database)
- More control, good performance

---

### **Option 5: Self-Hosted (VPS)**

Full control, more complex setup.

**Providers:**
- DigitalOcean Droplet: $6/month
- Linode: $5/month
- AWS EC2: ~$5-10/month
- Hetzner: €4.5/month (cheapest)

**Stack:**
- Ubuntu 22.04 LTS
- Nginx (reverse proxy)
- PM2 (process manager)
- PostgreSQL (local or Neon)
- Let's Encrypt (free SSL)

#### Quick Setup Script:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repo
git clone https://github.com/VolodymyrSymchych/PR-scope.git
cd PR-scope/dashboard

# Install dependencies
npm install

# Set environment variables
cat > .env.local << EOF
DATABASE_URL=your_neon_url
JWT_SECRET=your_secret
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
EOF

# Build
npm run build

# Start with PM2
pm2 start npm --name "scope-analyzer" -- start
pm2 save
pm2 startup
```

---

## 🎯 **My Recommendation for You:**

### **Vercel (Frontend) + Neon (Database)**

**Why?**
1. ✅ You're already using Neon
2. ✅ Vercel is built for Next.js
3. ✅ Both have generous free tiers
4. ✅ Automatic deployments
5. ✅ No server management
6. ✅ Production-ready in 5 minutes

---

## 📋 Pre-Deployment Checklist

### 1. **Update Environment Variables**

Replace test keys with production keys:

```bash
# Stripe - Get from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...  # NOT sk_test_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # NOT pk_test_

# Update your app URL
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### 2. **Stripe Webhooks**

In production, set up webhooks:
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`
4. Copy webhook secret to env: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 3. **Database Migration**

Your Neon database is already set up, but verify:
```bash
cd dashboard
npx drizzle-kit push:pg
```

### 4. **Security Updates**

```bash
# Generate new JWT secret
JWT_SECRET=$(openssl rand -base64 32)
```

### 5. **Build Test**

```bash
cd dashboard
npm run build
```

---

## 🚀 Quick Start with Vercel (5 Minutes)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd "/Users/symchychpc/RiderProjects/Project Scope Analyzer/dashboard"
   vercel
   ```

4. **Add Environment Variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add STRIPE_SECRET_KEY
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   vercel env add NEXT_PUBLIC_BASE_URL
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## 🔒 Domain Setup (Optional)

### With Vercel:

1. **Buy domain** (Namecheap, Google Domains, etc.)
2. **In Vercel Dashboard:**
   - Settings → Domains
   - Add your domain
   - Follow DNS instructions
3. **SSL:** Automatic!

---

## 📊 Monitoring

### Vercel Analytics (Built-in):
- Page views
- Performance metrics
- Error tracking

### External Options:
- **Sentry** (errors): https://sentry.io
- **LogRocket** (session replay): https://logrocket.com
- **Posthog** (analytics): https://posthog.com

---

## 💰 Cost Breakdown

### Free Option (Recommended):
- **Vercel Free Tier:** $0
- **Neon Free Tier:** $0
- **Domain (optional):** ~$12/year
- **Total:** $0-1/month

### Paid Option (Scaled):
- **Vercel Pro:** $20/month
- **Neon Pro:** $19/month
- **Stripe fees:** 2.9% + 30¢ per transaction
- **Total:** ~$40/month + transaction fees

---

## 🆘 Need Help?

Common issues and solutions:

**Build Errors:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Environment Variables Not Working:**
- Make sure `NEXT_PUBLIC_` prefix is used for client-side vars
- Restart Vercel deployment after adding vars

**Database Connection Errors:**
- Verify Neon connection string
- Check if IP whitelist is enabled (disable for Vercel)

---

## 📚 Useful Links

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Stripe Deployment:** https://stripe.com/docs/development/deployment
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

**Ready to deploy? Start with Vercel - it's the easiest! 🚀**

