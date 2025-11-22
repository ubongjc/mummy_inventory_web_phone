# Wholesale Supplier Discovery System

## Overview

The Wholesale Supplier Discovery system helps rental business owners in Nigeria find wholesale suppliers for event equipment. This feature automatically discovers, validates, and catalogs suppliers of chairs, tables, tents, linens, sound equipment, generators, and other event rental inventory.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Collection Layer                     │
├─────────────────────────────────────────────────────────────┤
│  • Web Scrapers (Maps, Directories, Marketplaces, Social)   │
│  • Normalization Engine                                      │
│  • Deduplication & Merging                                   │
│  • Confidence Scoring                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Storage Layer (PostgreSQL)               │
├─────────────────────────────────────────────────────────────┤
│  • WholesaleSupplier (main records)                         │
│  • WholesaleSupplierSourceLog (crawl logs)                  │
│  • WholesaleSupplierApproval (admin queue)                  │
│  • WholesaleSupplierBlacklist (filters)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  • GET /api/wholesale/suppliers (search & filter)           │
│  • GET /api/wholesale/suppliers/:id (detail)                │
│  • POST /api/wholesale/admin/refresh (manual trigger)       │
│  • PATCH /api/wholesale/admin/approve (admin approval)      │
│  • POST /api/wholesale/admin/merge (merge duplicates)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  • Customer Search UI (/wholesale-suppliers)                │
│  • Admin Dashboard (/wholesale-suppliers/admin)             │
│  • Map View with Clustering                                 │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Automated Discovery
- **Twice-monthly refresh**: Runs on 1st and 15th at 04:00 Africa/Lagos
- **Multi-source scraping**: Maps, directories, marketplaces, social media
- **Smart filtering**: Only captures wholesale/bulk sellers
- **Continuous updates**: Tracks changes and new suppliers

### 2. Data Quality
- **Normalization**: Phone numbers (E.164), states (official 36 + FCT), addresses
- **Deduplication**: Intelligent merging based on name/phone/location similarity
- **Confidence scoring**: 0.0-1.0 based on wholesale evidence, contact quality, verification
- **Validation**: Email, phone, URL format checking

### 3. Geographic Coverage
- **All Nigerian states**: 36 states + FCT (Federal Capital Territory)
- **Geopolitical zones**: South-West, South-East, South-South, North-Central, North-East, North-West
- **Location extraction**: From addresses, area mentions, landmarks

### 4. Category System
```
seating           → Chairs (Chiavari, Napoleon, Ghost, Folding, Resin)
tables            → Banquet tables (Round, Serpentine, Cocktail)
tents             → Marquee, Canopy, Pagoda, Stretch tents
flooring_grass    → Artificial turf, Carpet grass (20mm, 25mm, 35mm)
linens            → Tablecloths, Napkins, Chair covers, Sashes
decor             → Centerpieces, Backdrops, Balloons, Flowers
lighting          → LED, PAR, Wash, Uplighting
sound             → Speakers, Mixers, Line arrays, PA systems
staging_truss     → Platforms, Runways, Truss systems
catering          → Chafing dishes, Buffet ware, Serving equipment
power_generators  → 5kVA, 10kVA, 20kVA generators
mobile_toilet     → Portable toilets, VIP restrooms
bridal_wear       → Wedding gowns (wholesale for rental businesses)
```

## Installation

### Prerequisites
```bash
Node.js >= 18.x
PostgreSQL >= 14.x
npm or yarn
```

### Setup

1. **Install dependencies**
```bash
npm install
# or
yarn install
```

2. **Environment variables**
Add to `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# Geocoding (optional - for lat/lon)
GEOCODING_API_KEY="your_geocoding_api_key"

# Scraping (optional - for anti-bot measures)
SCRAPING_API_KEY="your_scraping_proxy_key"

# Cron secret for automated refresh
CRON_SECRET="your_secret_key_here"
```

3. **Database migration**
```bash
npx prisma migrate dev
# or for production
npx prisma migrate deploy
```

4. **Initial seed (optional)**
```bash
npm run wholesale:seed
```

## Usage

### Manual Refresh
Trigger a full crawl manually:
```bash
# CLI
npm run wholesale:refresh

# API endpoint (admin only)
POST /api/wholesale/admin/refresh
Headers: Authorization: Bearer <admin_token>
Body: { "manual_refresh": true }
```

### Export Data
```bash
# Export to JSONL
npm run wholesale:export jsonl

# Export to CSV
npm run wholesale:export csv

# Export source logs
npm run wholesale:export-logs
```

### Admin Tasks
```bash
# Find duplicates
npm run wholesale:find-duplicates

# Merge specific suppliers
npm run wholesale:merge --ids=<id1>,<id2>

# Blacklist domain/phone
npm run wholesale:blacklist --type=domain --value=spam.com

# Approve low-confidence entries
npm run wholesale:approve-queue
```

## Automated Refresh Schedule

The system runs twice per month via cron:

```
0 4 1,15 * *  (04:00 Africa/Lagos on 1st and 15th)
```

### Refresh Process

1. **Fetch** sources (maps, directories, marketplaces, social)
2. **Parse** and extract supplier data
3. **Normalize** phones, states, names, categories
4. **Detect** wholesale language and calculate confidence
5. **Deduplicate** using similarity matching
6. **Merge** duplicate records
7. **Geocode** new/changed addresses (if enabled)
8. **Update** database (upsert changed records)
9. **Export** suppliers.jsonl and suppliers.csv
10. **Log** run statistics to WholesaleSupplierSourceLog

### Retry Logic
- **Network failures**: Retry up to 3 times with exponential backoff
- **Rate limits**: Wait and retry after delay
- **Failed sources**: Continue with other sources, log errors

## Data Quality Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Total suppliers | ≥ 500 | TBD |
| State coverage | All 37 (36 + FCT) | TBD |
| Median confidence | ≥ 0.7 | TBD |
| Duplicates | < 3% | TBD |
| Contact info (phone/email) | ≥ 95% | TBD |
| Location (state) | 100% | TBD |

## Data Outputs

### suppliers.jsonl
One JSON object per line:
```json
{"supplier_id":"abc123","company_name":"Lagos Event Supply","categories":["seating","tables"],"wholesale_terms":{"bulk_available":true,"moq_units":50},"state":"Lagos","phones":["+2348012345678"],...}
{"supplier_id":"def456","company_name":"Abuja Tent Warehouse","categories":["tents"],"state":"FCT",...}
```

### suppliers.csv
Standard CSV with all fields (some as JSON-encoded):
```csv
supplier_id,company_name,categories,state,phones,confidence,...
abc123,"Lagos Event Supply","[""seating"",""tables""]",Lagos,"[""+2348012345678""]",0.85,...
```

### sources_log.jsonl
Crawl attempt logs:
```json
{"run_id":"run_20250122_040000","source_platform":"maps","source_url":"https://maps.google.com/...","http_status":200,"parse_success":true,"records_found":45,"records_new":12,"records_updated":8,"duration_ms":5420,...}
```

## Scraping Strategy

### Source Priority
1. **Google Maps** (highest coverage, public business data)
2. **BusinessList Nigeria** (B2B directory)
3. **Finelib** (Nigeria business directory)
4. **Jiji.ng** (marketplace with wholesale sellers)
5. **Instagram/Facebook** (wholesale accounts)
6. **Direct supplier sites** (manufacturer/importer websites)

### Search Queries (per state)
```
"wholesale chairs {state}"
"event equipment distributor {state}"
"Chiavari chairs bulk Nigeria"
"marquee tent supplier wholesale {state}"
"artificial grass roll wholesale Nigeria"
"sound equipment wholesale {state}"
"generator wholesale 20kVA Nigeria"
```

### Inclusion Criteria
✅ Page mentions "wholesale", "bulk", "distributor", "manufacturer", "MOQ", "carton"
✅ Product catalog shows bulk units (cartons, pallets)
✅ B2B/trade pricing visible
✅ Multiple contact methods (phone, WhatsApp, email)
✅ Physical location or state mentioned

### Exclusion Criteria
❌ Pure rental service (no stock sales)
❌ Consumer retail only ("1 piece", no wholesale language)
❌ No verifiable contact or location
❌ Spam/affiliate sites
❌ Blacklisted domains/phones

## Compliance & Ethics

### Robots.txt
- Respect `robots.txt` directives
- Add delays between requests (2-5 seconds)
- Use polite user-agent headers

### Data Collection
- **Only public data**: Business names, phones, addresses already published online
- **No login-gated content**: No scraping of private/protected data
- **No PII**: Collect business contacts only, not personal data

### Rate Limiting
- Max 60 requests/minute per domain
- Add random jitter (1-3 seconds)
- Rotate user agents
- Use scraping proxy if needed (optional)

## Troubleshooting

### Common Issues

**1. Geocoding failures**
```
Error: "Address not found"
Solution: Ensure address_text is detailed enough. Fallback to state-level location.
```

**2. Duplicate detection misses**
```
Error: Same supplier appearing multiple times
Solution: Check normalization (phone format, company name). Run manual merge.
```

**3. Low confidence scores**
```
Error: Too many suppliers with confidence < 0.6
Solution: Review wholesale language detection. Add evidence snippets to verifications.
```

**4. Scraping blocked**
```
Error: HTTP 403/429
Solution: Add delays, rotate IPs, use scraping API (e.g., ScraperAPI, Bright Data).
```

## Development

### Run tests
```bash
npm test app/lib/wholesale
```

### Linting
```bash
npm run lint
```

### Database seeding (dev)
```bash
npm run wholesale:seed-dev
```

## Support

For issues or questions:
- **Documentation**: `/docs/WHOLESALE_SUPPLIERS_*.md`
- **GitHub Issues**: https://github.com/your-repo/issues
- **Email**: support@yourapp.com

## License

Same as parent project.
