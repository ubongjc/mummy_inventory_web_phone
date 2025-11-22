# Wholesale Supplier Discovery System - Setup Guide

## 📦 Dependencies

Install the required packages:

```bash
npm install bull cheerio resend node-cron
npm install --save-dev @types/bull @types/cheerio @types/node-cron
```

### Package Breakdown:

| Package | Purpose | Required |
|---------|---------|----------|
| `bull` | Background job queue (uses Redis) | ✅ Yes |
| `cheerio` | HTML parsing for web scraping | ✅ Yes |
| `resend` | Email notifications | ⚠️ Optional |
| `node-cron` | Automated scheduling (1st & 15th) | ✅ Yes |

---

## 🔧 Setup Instructions

### 1. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows:**
```bash
# Use Windows Subsystem for Linux (WSL) or Docker
docker run -d -p 6379:6379 redis:latest
```

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

---

### 2. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - **Places API (New)**
   - **Geocoding API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key
6. **Restrict the API key** (recommended):
   - API restrictions → Select "Places API" and "Geocoding API"
   - Application restrictions → Set to your server's IP

**Add to `.env`:**
```env
GOOGLE_PLACES_API_KEY="AIzaSyC..."
```

**Pricing:** Google provides $200/month free credit. Typical costs:
- Text Search: $32 per 1000 requests
- Place Details: $17 per 1000 requests
- **Estimated cost for 500 suppliers:** ~$25-50/month

---

### 3. Configure Email Notifications (Optional)

**Using Resend (Recommended):**

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Get API key from [resend.com/api-keys](https://resend.com/api-keys)
4. Add to `.env`:

```env
RESEND_API_KEY="re_..."
ADMIN_EMAIL="admin@yourdomain.com"
FROM_EMAIL="noreply@yourdomain.com"
```

**Resend Pricing:** 3,000 emails/month free, then $20/month for 50k emails

---

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

**Required variables:**
```env
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://localhost:6379"

# Google Places API
GOOGLE_PLACES_API_KEY="AIzaSyC..."
```

**Optional variables:**
```env
# Email notifications
RESEND_API_KEY="re_..."
ADMIN_EMAIL="admin@yourdomain.com"
FROM_EMAIL="noreply@yourdomain.com"
```

---

### 5. Run Database Migration

```bash
npx prisma migrate dev --name add_wholesale_suppliers
```

Or if migration is already created:
```bash
npx prisma migrate deploy
```

---

### 6. Start the Application

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

---

## 🚀 Usage

### Manual Refresh (Admin Dashboard)

1. Go to `/wholesale-suppliers/admin`
2. Click **"Start Manual Refresh"**
3. Monitor progress in the Refresh tab

### Programmatic Refresh

```typescript
import { queueRefreshJob } from '@/app/lib/wholesale/jobs/queue';

// Queue a refresh job
const { jobId, runId } = await queueRefreshJob({
  sources: ['maps', 'directory'],
  states: ['Lagos', 'FCT', 'Rivers'], // Optional
  fullCrawl: false,
  triggeredBy: 'admin-user-id',
});

console.log(`Job queued: ${jobId}`);
```

### Check Job Status

```typescript
import { getJobStatus } from '@/app/lib/wholesale/jobs/queue';

const status = await getJobStatus(jobId);
console.log(status);
// {
//   state: 'completed',
//   progress: 100,
//   result: { ... }
// }
```

---

## 📅 Automated Refresh

The system automatically runs twice monthly:
- **1st of month at 04:00 Africa/Lagos**
- **15th of month at 04:00 Africa/Lagos**

To enable automated refresh, ensure the app is running continuously (use PM2, Docker, or a process manager).

**Using PM2:**
```bash
npm install -g pm2
pm2 start npm --name "rental-app" -- start
pm2 save
pm2 startup
```

---

## 🎯 Testing

### Test Email Notifications

```typescript
import { sendTestEmail } from '@/app/lib/wholesale/notifications/email';

await sendTestEmail();
// Check ADMIN_EMAIL inbox
```

### Test Scraper

```typescript
import { GoogleMapsScraper } from '@/app/lib/wholesale/scrapers/google-maps';

const scraper = new GoogleMapsScraper();
const result = await scraper.scrape({
  states: ['Lagos'],
});

console.log(result);
```

### Test Job Queue

```bash
# In one terminal, start the app
npm run dev

# In another terminal, trigger a refresh
curl -X POST http://localhost:3000/api/wholesale/admin/refresh \
  -H "Content-Type: application/json" \
  -d '{"manual_refresh": true, "sources": ["maps"]}'
```

---

## 📊 Monitoring

### Check Queue Stats

```typescript
import { getQueueStats } from '@/app/lib/wholesale/jobs/queue';

const stats = await getQueueStats();
console.log(stats);
// { waiting: 0, active: 1, completed: 5, failed: 0 }
```

### View Job Logs

Check the application logs for:
- `[Queue]` - Job queue events
- `[GoogleMapsScraper]` - Scraping progress
- `[BusinessListScraper]` - Scraping progress
- `[Orchestrator]` - Overall progress
- `[Email]` - Email notifications

---

## 🐛 Troubleshooting

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Ensure Redis is running:
```bash
redis-cli ping
# or start Redis:
redis-server
```

### Google Places API Error
```
Error: Google Places API error: REQUEST_DENIED
```
**Solutions:**
1. Check API key is valid
2. Ensure Places API (New) is enabled
3. Check billing is enabled in Google Cloud Console
4. Verify API key restrictions aren't too strict

### No Suppliers Found
**Reasons:**
1. API key not configured
2. Search queries too specific
3. Network/firewall blocking Google APIs

**Debug:**
```bash
# Check if Google API is accessible
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=event+equipment+Lagos&key=YOUR_API_KEY"
```

---

## 💰 Cost Estimation

### Monthly Costs (500 suppliers, 2x refreshes/month)

| Service | Cost |
|---------|------|
| Google Places API | $25-50/month |
| Redis (self-hosted) | Free |
| Resend (optional) | Free (< 3k emails) |
| **Total** | **$25-50/month** |

### Cost Optimization:

1. **Cache aggressively** - Only refresh stale suppliers
2. **Target specific states** - Don't scrape all 37 states
3. **Use incremental crawls** - Full crawl only monthly
4. **Batch API calls** - Respect rate limits

---

## 📈 Scaling

### For High Volume (1000+ suppliers):

1. **Use a managed Redis** (AWS ElastiCache, Redis Cloud)
2. **Implement rate limiting** on Google API calls
3. **Add more scrapers** (Jiji.ng, Finelib, Instagram)
4. **Use caching** (Redis cache for API responses)
5. **Implement webhooks** instead of polling

---

## 🔒 Security

1. **Never commit API keys** - Use `.env` file
2. **Restrict API keys** - Set IP restrictions
3. **Use HTTPS** in production
4. **Rate limit endpoints** - Prevent abuse
5. **Validate input** - Sanitize all user inputs

---

## 📝 Next Steps

1. ✅ Set up Redis
2. ✅ Get Google Places API key
3. ✅ Run database migration
4. ✅ Configure environment variables
5. ✅ Test manual refresh
6. ✅ Verify email notifications
7. ✅ Monitor first automated refresh (1st or 15th)
8. ✅ Review data quality in admin dashboard
9. ✅ Approve pending suppliers
10. ✅ Export data (JSONL/CSV)

---

**Need help?** Check the main README or create an issue on GitHub.
