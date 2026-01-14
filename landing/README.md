# 🚀 Landing Page - Project Scope Analyzer

Beautiful, modern landing page for collecting waitlist emails before launch.

## Features

- ✨ **Glassmorphism Design** - Modern, premium aesthetic matching dashboard
- 📧 **Waitlist Form** - Email collection with validation
- 🎨 **Responsive** - Works perfectly on mobile and desktop
- ⚡ **Fast** - Lightweight, no framework dependencies
- 🎯 **SEO Optimized** - Proper meta tags and semantic HTML
- 🎁 **Early Bird Offer** - 50% off for first 3 months

## Sections

1. **Hero** - Value proposition + waitlist form
2. **Features** - 6 key features with icons
3. **Pricing** - 3 pricing tiers (Free, Pro, Business)
4. **FAQ** - 5 common questions
5. **CTA** - Final call-to-action
6. **Footer** - Links and copyright

## Setup

### 1. Database Migration

The waitlist table needs to be created in your database:

```sql
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

Or use Drizzle migration:

```bash
cd services/notification-service
npm run db:generate
npm run db:migrate
```

### 2. Start Notification Service

The waitlist API endpoint is in notification-service:

```bash
cd services/notification-service
npm run dev
```

API will be available at: `http://localhost:3007/api/waitlist`

### 3. Serve Landing Page

#### Option A: Simple HTTP Server (Development)

```bash
cd landing
python3 -m http.server 8000
# or
npx serve .
```

Visit: `http://localhost:8000`

#### Option B: Deploy to Vercel (Production)

```bash
cd landing
vercel
```

### 4. Update API Endpoint

In `index.html`, update the fetch URL to your production API:

```javascript
// Development
const response = await fetch('http://localhost:3007/api/waitlist', {

// Production
const response = await fetch('https://your-api.com/api/waitlist', {
```

## API Endpoints

### POST /api/waitlist

Add email to waitlist.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (201):**
```json
{
  "message": "Successfully added to waitlist",
  "email": "user@example.com"
}
```

**Response (409):**
```json
{
  "error": "Email already on waitlist"
}
```

### GET /api/waitlist/count

Get total waitlist count.

**Response:**
```json
{
  "count": 42
}
```

## Email Notifications

When someone joins the waitlist, they automatically receive a welcome email via Resend:

- ✅ Welcome message
- 🎁 Early bird offer details
- 📅 Launch date
- 💌 What to expect next

## Customization

### Colors

Update CSS variables in `<style>` section:

```css
:root {
    --primary: 189 100% 55%;      /* Cyan */
    --secondary: 263 85% 65%;     /* Purple */
    --success: 142 76% 36%;       /* Green */
}
```

### Content

Edit HTML directly:
- Hero title and description
- Features (6 cards)
- Pricing tiers
- FAQ questions
- Footer links

### Images

Add logo or hero image:

```html
<img src="/logo.png" alt="Logo" />
```

## Analytics

### Google Analytics

Add before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Mixpanel

Add before `</head>`:

```html
<!-- Mixpanel -->
<script type="text/javascript">
  (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
  for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?
  MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
  
  mixpanel.init('YOUR_TOKEN');
</script>
```

Then track events:

```javascript
// In form submission
mixpanel.track('Waitlist Signup', {
  'email': email,
  'source': 'landing_page'
});
```

## Testing

### Manual Testing

1. Open landing page
2. Enter email: `test@example.com`
3. Click "Join Waitlist"
4. Should see success message
5. Check email for welcome message
6. Try same email again - should see error

### API Testing

```bash
# Add to waitlist
curl -X POST http://localhost:3007/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Get count
curl http://localhost:3007/api/waitlist/count
```

## Deployment

### Vercel (Recommended)

1. Create `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-api.com/api/:path*" }
  ]
}
```

2. Deploy:

```bash
vercel --prod
```

### Netlify

1. Create `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-api.com/api/:splat"
  status = 200
```

2. Deploy:

```bash
netlify deploy --prod
```

### Custom Domain

After deployment, add custom domain:
- `www.projectscope.ai`
- `projectscope.ai`

## Next Steps

1. **Add Analytics** - Google Analytics + Mixpanel
2. **SEO Optimization** - Add meta tags, sitemap
3. **Social Sharing** - Open Graph images
4. **A/B Testing** - Test different copy/CTAs
5. **Blog** - Add blog for content marketing
6. **Demo Video** - Add product demo video

## Metrics to Track

- 📊 **Page Views** - Total visitors
- 📧 **Conversion Rate** - Visitors → Waitlist signups
- 🎯 **Traffic Sources** - Where visitors come from
- ⏱️ **Time on Page** - Engagement metric
- 📱 **Device Split** - Mobile vs Desktop
- 🌍 **Geography** - Where users are located

## Support

Questions? Issues?
- Email: hello@projectscope.ai
- GitHub: [Create Issue](https://github.com/your-repo/issues)

---

**Built with ❤️ for Project Scope Analyzer**
