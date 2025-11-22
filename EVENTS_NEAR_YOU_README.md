# Events Near You - Premium Feature

## Overview

**Events Near You** is a premium feature that helps rental business owners discover local events in Nigeria (weddings, burials, dedications, etc.) that may need their rental services. The system automatically scrapes event information from multiple sources including church websites, event platforms, and newspapers.

## Features

### ✨ Core Capabilities

- **Multi-Source Scraping**: Automatically collects events from:
  - Church websites (Holy Family Festac, St. Jude Yaba, parish bulletins)
  - Event platforms (Eventbrite, AllEvents.in, Tix Africa)
  - Newspapers (Punch Nigeria, The Guardian Nigeria obituaries)

- **Smart Data Normalization**:
  - Parses various date formats into ISO 8601
  - Normalizes Nigerian states and cities
  - Converts phone numbers to E.164 format
  - Generates stable event IDs for deduplication

- **Advanced Search & Filtering**:
  - Search by title, location, venue, contact
  - Filter by event type (11 ceremony types)
  - Filter by state (all 36 states + FCT)
  - Filter by date range
  - Pagination support

- **Rolling Window**: Events are kept for 7 days before yesterday up to any future date, automatically removing old events

- **Data Export**: Export events to CSV or JSONL format

- **Contact Information**: Extracts organizer contacts when available (name, phone, email, organization)

### 📊 Event Types Supported

- Wedding
- Traditional Marriage
- Burial / Funeral
- Memorial Service
- Child Dedication
- Christening
- Naming Ceremony
- Thanksgiving Service
- Anniversary
- Birthday
- Other Ceremonies

## Architecture

### Database Schema

Two main tables:

**NigerianEvent**:
- Stores all event data with normalized fields
- Includes confidence scoring (0-1)
- Indexed on: eventType, dateStart, locationState, sourcePlatform

**EventSourceLog**:
- Tracks scraper runs and performance
- Records events added/updated/removed
- Logs errors and execution time

### Code Structure

```
app/
├── lib/
│   └── events/
│       ├── types.ts                 # TypeScript interfaces
│       ├── normalizer.ts            # Data normalization utilities
│       ├── scraper-manager.ts       # Orchestrates all scrapers
│       └── scrapers/
│           ├── base.ts              # Base scraper interface
│           ├── church-websites.ts   # Church scrapers
│           ├── event-platforms.ts   # Platform scrapers
│           └── newspapers.ts        # Newspaper scrapers
├── api/
│   ├── events/
│   │   ├── route.ts                 # GET events with filters
│   │   ├── scrape/route.ts          # POST manual scrape (admin)
│   │   └── export/route.ts          # GET export to CSV/JSONL
│   └── cron/
│       └── scrape-events/route.ts   # Cron job endpoint
└── events/
    └── page.tsx                     # Frontend UI
prisma/
└── migrations/
    └── 20251122000000_add_nigerian_events_feature/
        └── migration.sql            # Database migration
```

## Setup Instructions

### 1. Apply Database Migration

```bash
# Apply the migration to your database
npx prisma migrate deploy

# Or run in development
npx prisma migrate dev
```

This creates the `NigerianEvent` and `EventSourceLog` tables.

### 2. Install Dependencies

Dependencies have already been added:
- `cheerio` - HTML parsing for web scraping

### 3. Set Up Cron Job

**Option A: Vercel Cron (Recommended for Vercel deployments)**

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-events",
      "schedule": "0 4 * * *"
    }
  ]
}
```

This runs daily at 4:00 AM WAT.

Add to `.env`:
```bash
CRON_SECRET=your-random-secret-here
```

**Option B: External Cron Service (cron-job.org, EasyCron, etc.)**

Set up a daily cron job to hit:
```
GET https://yourdomain.com/api/cron/scrape-events
Authorization: Bearer your-cron-secret
```

### 4. Grant Premium Access

Users need a premium subscription to access Events Near You.

**Via Prisma Studio**:
```bash
npx prisma studio
```
Navigate to `Subscription` table, find user, set `plan = "premium"`, `status = "active"`.

**Via SQL**:
```sql
UPDATE "Subscription"
SET plan = 'premium', status = 'active'
WHERE "userId" = 'user-id-here';
```

## Usage

### For End Users

1. **Access Events Page**:
   - Sign in to the dashboard
   - Click "Events Near You ⭐" in the menu
   - Requires premium subscription

2. **Search & Filter**:
   - Use the search bar for keywords
   - Filter by event type (wedding, burial, etc.)
   - Filter by state (Lagos, Abuja, etc.)
   - Filter by date range

3. **View Event Details**:
   - Event title and type
   - Date and location
   - Contact information (when available)
   - Organizer details
   - Source link

4. **Export Data**:
   - Click "CSV" or "JSONL" to download all events
   - Use for your own analysis or CRM import

### For Administrators

#### Manual Scrape

Trigger a manual scrape (admin only):

```bash
POST /api/events/scrape
```

Or use a tool like curl:
```bash
curl -X POST https://yourdomain.com/api/events/scrape \
  -H "Cookie: your-session-cookie"
```

This runs all scrapers immediately and returns results.

#### View Scraper Logs

Check the `EventSourceLog` table in Prisma Studio to see:
- When scrapers last ran
- How many events were added/updated/removed
- Any errors encountered
- Execution time per source

## Customization

### Adding New Scrapers

1. Create a new scraper class in `app/lib/events/scrapers/`:

```typescript
import { EventScraper } from './base';

export class MyCustomScraper implements EventScraper {
  sourcePlatform = 'My Source';

  async scrape(): Promise<ScraperResult> {
    // Your scraping logic
    return {
      events: [...],
      errors: [...],
      executionTimeMs: ...,
      sourcePlatform: this.sourcePlatform,
    };
  }
}
```

2. Register it in `scraper-manager.ts`:

```typescript
this.scrapers = [
  // ... existing scrapers
  new MyCustomScraper(),
];
```

### Updating Existing Scrapers

Most website structures change over time. Update the CSS selectors in:
- `app/lib/events/scrapers/church-websites.ts`
- `app/lib/events/scrapers/event-platforms.ts`
- `app/lib/events/scrapers/newspapers.ts`

Example:
```typescript
// Update selectors based on actual website
$('.event-item').each((_, element) => {
  const title = $(element).find('.title').text().trim();
  // ... rest of parsing logic
});
```

### Adjusting the Rolling Window

The default window is **7 days before yesterday to any future date**.

To change, edit `app/lib/events/normalizer.ts`:

```typescript
export function isEventInWindow(event: NormalizedEvent): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const windowStart = new Date(yesterday);
  windowStart.setDate(windowStart.getDate() - 7); // Change this number

  // ... rest of logic
}
```

## API Reference

### GET /api/events

Fetch events with optional filtering.

**Query Parameters**:
- `eventType` - Filter by event type
- `locationState` - Filter by Nigerian state
- `q` - Search query (title, location, venue, contact)
- `dateFrom` - Start date (ISO 8601)
- `dateTo` - End date (ISO 8601)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response**:
```json
{
  "events": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalCount": 150,
    "totalPages": 3
  }
}
```

**Authentication**: Required (premium subscription)

### POST /api/events/scrape

Manually trigger event scraping.

**Authentication**: Required (admin only)

**Response**:
```json
{
  "success": true,
  "result": {
    "totalAdded": 45,
    "totalUpdated": 12,
    "totalRemoved": 8,
    "sourceLogs": [ ... ],
    "errorCount": 2,
    "errors": [ ... ]
  }
}
```

### GET /api/events/export?format=csv|jsonl

Export all events.

**Query Parameters**:
- `format` - `csv` or `jsonl`

**Authentication**: Required (premium subscription)

**Response**: File download (CSV or JSONL)

### GET /api/cron/scrape-events

Daily cron job endpoint.

**Authentication**: Bearer token via `CRON_SECRET` env var

**Response**:
```json
{
  "success": true,
  "timestamp": "2025-11-22T04:00:00.000Z",
  "result": {
    "totalAdded": 45,
    "totalUpdated": 12,
    "totalRemoved": 8,
    "errorCount": 0
  }
}
```

## Performance Considerations

### Scraping Best Practices

1. **Respect robots.txt**: Scrapers use polite delays and respect site rules
2. **Rate Limiting**: Built-in retry with exponential backoff
3. **Timeouts**: Each request times out after 30 seconds
4. **Parallel Execution**: Scrapers run concurrently for efficiency

### Database Optimization

- Indexes on frequently queried fields (eventType, dateStart, locationState)
- Rolling window keeps table size manageable
- Efficient upsert logic to minimize database writes

### Scaling

For large deployments:
- Consider running scrapers in a background worker (Vercel Serverless Functions, AWS Lambda)
- Implement caching for frequently accessed queries
- Use database connection pooling

## Troubleshooting

### Issue: "Premium subscription required"

**Solution**: Grant the user a premium subscription via Prisma Studio or SQL.

### Issue: Scrapers returning no events

**Causes**:
- Website structure has changed (update selectors)
- Network/firewall blocking requests
- Website requires authentication

**Debug**:
1. Check `EventSourceLog` table for errors
2. Run manual scrape via `/api/events/scrape` and check response
3. Test individual scrapers by modifying `scraper-manager.ts`

### Issue: Cron job not running

**Vercel**:
- Check Vercel dashboard → Cron Jobs
- Verify `CRON_SECRET` is set
- Check function logs

**External Cron**:
- Verify cron service is hitting the correct URL
- Check Authorization header is set correctly

### Issue: Duplicate events

**Solution**: The deduplication logic should handle this, but if duplicates persist:
1. Check `eventId` generation in `normalizer.ts`
2. Verify unique constraints in database
3. Manually remove duplicates:
```sql
DELETE FROM "NigerianEvent" a USING "NigerianEvent" b
WHERE a.id > b.id AND a."eventId" = b."eventId";
```

## Future Enhancements

Potential improvements:
- Social media integration (Instagram, Facebook public events)
- SMS/Email notifications for new events in user's area
- AI-powered event categorization
- Sentiment analysis for event popularity
- Integration with WhatsApp for direct outreach
- Event clustering by location
- PDF parsing for parish bulletins

## Support

For issues or questions:
1. Check this README
2. Review code comments in source files
3. Check Prisma Studio for database state
4. Review API error messages

## License

Part of Very Simple Inventory - Premium Features
