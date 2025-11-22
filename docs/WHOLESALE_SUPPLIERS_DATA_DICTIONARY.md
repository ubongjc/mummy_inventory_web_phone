# Wholesale Suppliers Data Dictionary

## Overview

This document defines all fields in the wholesale supplier dataset, their formats, validation rules, and normalization procedures.

## Core Data Schema

### WholesaleSupplier Model

| Field | Type | Required | Description | Format/Rules |
|-------|------|----------|-------------|--------------|
| **supplier_id** | string(64) | ✅ | Stable hash identifier | SHA-256 hash of `(company_name + primary_phone + state)` |
| **company_name** | string(200) | ✅ | Official business name | Title Case, trimmed, no extra spaces |
| **aka_names** | JSON array | ❌ | Alternative names/aliases | Array of strings, deduplicated |
| **categories** | JSON array | ✅ | Product categories | Enum: see Category System below |
| **product_examples** | JSON array | ❌ | Specific products sold | Array of strings (e.g., "Chiavari chairs", "Marquee tents") |

---

### Wholesale Terms

**Field**: `wholesale_terms` (JSON object)

| Sub-field | Type | Description | Example |
|-----------|------|-------------|---------|
| **bulk_available** | boolean | Wholesale/bulk sales available | `true` |
| **moq_units** | integer | Minimum Order Quantity | `50` (units) |
| **price_range_hint** | string | Human-readable price range | `"₦18,000–₦28,000 per chair (bulk)"` |
| **lead_time_days** | integer | Production/delivery lead time | `14` (days) |
| **delivery_options** | array | Delivery coverage | `["nationwide", "regional", "pickup_only"]` |
| **returns_warranty** | string | Return policy or warranty | `"7-day return policy, 1-year warranty"` |

**Normalization Rules**:
- `moq_units`: Extract numbers from text like "minimum 50 units" → `50`
- `price_range_hint`: Keep original text, normalize currency symbol to ₦
- `delivery_options`: Map keywords → enum (e.g., "we deliver nationwide" → `"nationwide"`)

---

### Location Fields

| Field | Type | Required | Description | Normalization |
|-------|------|----------|-------------|---------------|
| **coverage_regions** | JSON array | ❌ | Geographic coverage | `["Nigeria-wide", "South-West", "Lagos", "Ogun"]` |
| **address_text** | string(500) | ❌ | Full address | Trimmed, preserve original format |
| **state** | string(50) | ✅ | Nigerian state | **Normalized to official 36 states + FCT** (see State Normalization) |
| **lga_or_city** | string(100) | ❌ | Local Government Area or city | Title Case (e.g., "Ikeja", "Ojo") |
| **lat** | decimal(10,7) | ❌ | Latitude | WGS84 format, range: -90 to 90 |
| **lon** | decimal(10,7) | ❌ | Longitude | WGS84 format, range: -180 to 180 |

**State Normalization Rules**:

```typescript
Input            → Normalized Output
"lagos"          → "Lagos"
"FCT Abuja"      → "FCT"
"Akwa-Ibom"      → "Akwa Ibom"
"Cross-River"    → "Cross River"
"federal capital territory" → "FCT"
```

**Official States** (37 total):
```
Abia, Adamawa, Akwa Ibom, Anambra, Bauchi, Bayelsa, Benue, Borno,
Cross River, Delta, Ebonyi, Edo, Ekiti, Enugu, Gombe, Imo, Jigawa,
Kaduna, Kano, Katsina, Kebbi, Kogi, Kwara, Lagos, Nasarawa, Niger,
Ogun, Ondo, Osun, Oyo, Plateau, Rivers, Sokoto, Taraba, Yobe,
Zamfara, FCT
```

**Location Extraction from Address**:

If `state` is not provided, extract from `address_text` using pattern matching:

```
"123 Ikeja Road, Lagos" → state="Lagos", lga_or_city="Ikeja"
"Trade Fair Complex, Ojo, Lagos State" → state="Lagos", lga_or_city="Ojo"
"Plot 45, Victoria Island, VI, Lagos" → state="Lagos", lga_or_city="Victoria Island"
"No. 12, Port Harcourt" → state="Rivers", lga_or_city="Port Harcourt"
```

---

### Contact Fields

| Field | Type | Required | Description | Normalization |
|-------|------|----------|-------------|---------------|
| **phones** | JSON array | ❌ | Phone numbers | **E.164 format** (see Phone Normalization) |
| **whatsapp** | JSON array | ❌ | WhatsApp numbers | E.164 format, same as phones |
| **emails** | JSON array | ❌ | Email addresses | Lowercase, validated format |
| **websites** | JSON array | ❌ | Website URLs | Full URLs with protocol |
| **socials** | JSON object | ❌ | Social media links | See Socials Normalization |
| **business_hours** | string(200) | ❌ | Operating hours | Free text (e.g., "Mon-Fri 8am-6pm, Sat 9am-4pm") |

**Phone Normalization** (E.164 format):

```typescript
Input                 → Normalized Output
"08012345678"         → "+2348012345678"
"0802 345 6789"       → "+2348023456789"
"234-801-234-5678"    → "+2348012345678"
"+234 (0) 803 456 7890" → "+2348034567890"
"08012345"            → null (invalid - too short)
```

Rules:
1. Strip all non-digit characters
2. If starts with `0`, replace with `234`
3. If starts with `234`, keep as is
4. Add `+` prefix
5. Validate length = 13 digits (+234 + 10 digits)

**Email Normalization**:
```typescript
"SALES@COMPANY.COM"   → "sales@company.com"
" info@company.com "  → "info@company.com"
"invalid-email"       → null (failed validation)
```

**Socials Normalization**:

```json
{
  "instagram": "https://instagram.com/companyname",
  "facebook": "https://facebook.com/companypage",
  "tiktok": "https://www.tiktok.com/@companyname",
  "others": ["https://twitter.com/company", "https://linkedin.com/company"]
}
```

Extract handles from various formats:
```
"@companyname" → "https://instagram.com/companyname"
"facebook.com/companypage" → "https://facebook.com/companypage"
"IG: @company" → "https://instagram.com/company"
```

---

### Ratings & Reviews

**Field**: `ratings` (JSON object)

```json
{
  "google": {
    "stars": 4.2,
    "count": 18
  },
  "facebook": {
    "stars": 4.5,
    "count": 12
  }
}
```

Rules:
- `stars`: 0.0-5.0 (one decimal place)
- `count`: Integer ≥ 0
- If no ratings available, set to `null`

---

### Verification Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **verifications** | JSON object | ❌ | Wholesale verification data |
| **confidence** | decimal(3,2) | ✅ | Confidence score (0.0-1.0) |

**Verifications Object**:

```json
{
  "explicit_wholesale_language": true,
  "evidence_snippets": [
    "'we sell wholesale and retail'",
    "'minimum order 50 pieces'",
    "'bulk prices available'"
  ],
  "cac_number": "RC123456" // Corporate Affairs Commission number (if public)
}
```

**Confidence Calculation**:

Base: `0.5`

Add points:
- `+0.2`: Explicit wholesale language detected
- `+0.1`: MOQ specified in wholesale_terms
- `+0.05`: Has phone number
- `+0.05`: Has WhatsApp
- `+0.05`: Has email
- `+0.05`: Has state location
- `+0.1`: Has CAC number
- `+0.05`: Has 2+ categories

Subtract points:
- `-0.1`: No wholesale_terms or bulk_available=false
- `-0.05`: No contact info at all

Final range: `0.0 - 1.0` (clamped)

---

### Source & Metadata

| Field | Type | Required | Description | Format |
|-------|------|----------|-------------|--------|
| **source_url** | text | ✅ | Original page URL | Full URL with protocol |
| **source_platform** | string(100) | ✅ | Source type | Enum: `maps`, `directory`, `marketplace`, `social`, `official_site` |
| **extracted_at** | datetime | ✅ | First extraction timestamp | ISO 8601 in Africa/Lagos timezone |
| **last_seen_at** | datetime | ✅ | Most recent crawl timestamp | ISO 8601 |
| **notes** | text | ❌ | Free-form notes | Any additional context |

**Source Platform Mapping**:

```
Google Maps                   → "maps"
BusinessList Nigeria          → "directory"
Finelib                       → "directory"
Jiji.ng                       → "marketplace"
Instagram/Facebook            → "social"
Company website               → "official_site"
```

---

### Admin Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| **approval_status** | string(20) | `"pending"` | Admin approval state: `pending`, `approved`, `rejected` |
| **is_blacklisted** | boolean | `false` | Blacklist flag |
| **blacklist_reason** | string(500) | `null` | Reason for blacklisting |
| **created_at** | datetime | now() | Record creation timestamp |
| **updated_at** | datetime | now() | Last update timestamp |

---

## Category System

### Category Enums

```typescript
type SupplierCategory =
  | 'seating'           // Chairs
  | 'tables'            // Tables
  | 'tents'             // Canopies, Marquees
  | 'flooring_grass'    // Artificial turf
  | 'linens'            // Tablecloths, napkins
  | 'decor'             // Decorations
  | 'lighting'          // Event lighting
  | 'sound'             // Sound equipment
  | 'staging_truss'     // Stages, truss
  | 'catering'          // Catering equipment
  | 'power_generators'  // Generators
  | 'mobile_toilet'     // Portable toilets
  | 'bridal_wear';      // Wedding gowns
```

### Category Detection Keywords

| Category | Keywords (case-insensitive) |
|----------|----------------------------|
| **seating** | chair, chiavari, napoleon, ghost, folding, banquet chair, tiffany, resin |
| **tables** | table, banquet table, round table, cocktail, serpentine |
| **tents** | tent, canopy, marquee, pagoda, stretch, gazebo |
| **flooring_grass** | grass, artificial turf, carpet grass, astro turf, floor, mat |
| **linens** | linen, tablecloth, napkin, table runner, chair cover, sash |
| **decor** | decor, decoration, centerpiece, backdrop, flower, balloon |
| **lighting** | light, led, par, wash, spot, uplighting, fairy lights |
| **sound** | sound, speaker, mixer, microphone, pa system, line array, subwoofer |
| **staging_truss** | stage, truss, platform, riser, runway |
| **catering** | catering, chafing dish, buffet, warmer, serving |
| **power_generators** | generator, power, kva, gen |
| **mobile_toilet** | toilet, portable toilet, restroom, loo |
| **bridal_wear** | wedding gown, bridal, bride, gown rental, dress |

---

## Delivery Options

```typescript
type DeliveryOption =
  | 'nationwide'    // Delivers across all Nigeria states
  | 'regional'      // Limited to specific zones/states
  | 'pickup_only';  // Customer pickup only
```

**Detection Keywords**:

```
"nationwide delivery" → "nationwide"
"we deliver all over Nigeria" → "nationwide"
"Lagos, Ogun, Oyo only" → "regional"
"pickup from our warehouse" → "pickup_only"
"self-collection" → "pickup_only"
```

---

## Geopolitical Zones

Map of Nigerian states by zone:

```typescript
{
  "South-West": ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"],
  "South-East": ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
  "South-South": ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
  "North-Central": ["Benue", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau", "FCT"],
  "North-East": ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
  "North-West": ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"]
}
```

---

## Validation Rules

### Required Fields

All suppliers **MUST** have:
- ✅ `supplier_id`
- ✅ `company_name`
- ✅ `categories` (at least 1)
- ✅ `state` OR `address_text` (to extract state from)
- ✅ At least ONE contact method: `phones`, `whatsapp`, `emails`, or `websites`
- ✅ `source_url`
- ✅ `source_platform`
- ✅ `confidence` ≥ 0.3

### Field Length Limits

```typescript
company_name:       max 200 characters
address_text:       max 500 characters
state:              max 50 characters
lga_or_city:        max 100 characters
phone (E.164):      exactly 13 characters (+234 + 10 digits)
email:              max 254 characters (RFC 5322)
website URL:        max 500 characters
notes:              unlimited (text field)
```

### Format Validation

**Phone**: Must match E.164 format `^\\+234[0-9]{10}$`

**Email**: Must match regex `^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$`

**URL**: Must be valid URL with protocol (`http://` or `https://`)

**Coordinates**:
- Latitude: `-90.0` to `90.0`
- Longitude: `-180.0` to `180.0`

---

## Export Formats

### JSONL (suppliers.jsonl)

One JSON object per line, no wrapper array:

```jsonl
{"supplier_id":"abc123","company_name":"Lagos Event Supply",...}
{"supplier_id":"def456","company_name":"Abuja Tent Warehouse",...}
```

### CSV (suppliers.csv)

Standard CSV with header row. JSON fields encoded as strings:

```csv
supplier_id,company_name,categories,state,phones,confidence
abc123,"Lagos Event Supply","[""seating"",""tables""]",Lagos,"[""+2348012345678""]",0.85
def456,"Abuja Tent Warehouse","[""tents""]",FCT,"[""+2349012345678"",""+""+2349087654321""]",0.92
```

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-22 | Initial schema definition |

