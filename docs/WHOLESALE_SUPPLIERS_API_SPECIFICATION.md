# Wholesale Suppliers API Specification

## Base URL

```
/api/wholesale
```

## Authentication

Most endpoints require authentication via NextAuth session.

Admin endpoints require `role: "admin"` or special permissions.

---

## Endpoints

### 1. Search & List Suppliers

**GET** `/api/wholesale/suppliers`

Search and filter suppliers with pagination.

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `query` | string | ❌ | Search in company name, products, notes | `"chiavari chairs"` |
| `states` | string[] | ❌ | Filter by states (comma-separated) | `"Lagos,Ogun,FCT"` |
| `categories` | string[] | ❌ | Filter by categories (comma-separated) | `"seating,tables"` |
| `delivery_options` | string[] | ❌ | Filter by delivery options | `"nationwide"` |
| `moq_min` | number | ❌ | Min MOQ units | `50` |
| `moq_max` | number | ❌ | Max MOQ units | `500` |
| `lead_time_max` | number | ❌ | Max lead time in days | `30` |
| `min_rating` | number | ❌ | Minimum Google rating | `4.0` |
| `explicit_wholesale_only` | boolean | ❌ | Only verified wholesale | `true` |
| `min_confidence` | number | ❌ | Minimum confidence score | `0.7` |
| `page` | number | ❌ | Page number (1-indexed) | `1` |
| `limit` | number | ❌ | Results per page (max 100) | `20` |
| `sort` | string | ❌ | Sort field | `"confidence"`, `"company_name"`, `"updated_at"` |
| `order` | string | ❌ | Sort order | `"asc"`, `"desc"` |

#### Response

```json
{
  "suppliers": [
    {
      "id": "clxyz123",
      "supplier_id": "abc123def456...",
      "company_name": "Lagos Event Supply Ltd",
      "aka_names": ["LES", "Lagos Events"],
      "categories": ["seating", "tables", "tents"],
      "product_examples": ["Chiavari chairs", "Resin folding chairs", "Round banquet tables"],
      "wholesale_terms": {
        "bulk_available": true,
        "moq_units": 50,
        "price_range_hint": "₦18,000–₦28,000 per chair (bulk)",
        "lead_time_days": 14,
        "delivery_options": ["nationwide", "regional"],
        "returns_warranty": "7-day return, 1-year warranty"
      },
      "coverage_regions": ["South-West", "Lagos", "Ogun", "Oyo"],
      "address_text": "Plot 45, Trade Fair Complex, Ojo, Lagos",
      "state": "Lagos",
      "lga_or_city": "Ojo",
      "lat": 6.4541,
      "lon": 3.1836,
      "phones": ["+2348012345678", "+2348023456789"],
      "whatsapp": ["+2348012345678"],
      "emails": ["sales@lagosevent.com", "info@lagosevent.com"],
      "websites": ["https://lagosevent.com"],
      "socials": {
        "instagram": "https://instagram.com/lagosevent",
        "facebook": "https://facebook.com/lagoseventltd",
        "tiktok": null,
        "others": []
      },
      "business_hours": "Mon-Fri 8am-6pm, Sat 9am-4pm",
      "ratings": {
        "google": { "stars": 4.2, "count": 18 },
        "facebook": { "stars": 4.5, "count": 12 }
      },
      "verifications": {
        "explicit_wholesale_language": true,
        "evidence_snippets": ["'we sell wholesale and retail'", "'bulk orders available'"],
        "cac_number": "RC123456"
      },
      "confidence": 0.85,
      "notes": "Verified supplier, good reviews",
      "source_url": "https://maps.google.com/place/...",
      "source_platform": "maps",
      "last_seen_at": "2025-01-15T04:30:00Z",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-15T04:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_results": 245,
    "total_pages": 13,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "query": "chairs",
    "states": ["Lagos"],
    "categories": ["seating"],
    "min_confidence": 0.7
  }
}
```

#### Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Not authenticated
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### 2. Get Supplier Details

**GET** `/api/wholesale/suppliers/:id`

Get full details of a single supplier.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Supplier database ID or supplier_id hash |

#### Response

```json
{
  "supplier": {
    "id": "clxyz123",
    "supplier_id": "abc123def456...",
    "company_name": "Lagos Event Supply Ltd",
    // ... (full supplier object as in list endpoint)
  },
  "similar_suppliers": [
    {
      "id": "clxyz456",
      "company_name": "Ikeja Party Rentals",
      "categories": ["seating", "tables"],
      "state": "Lagos",
      "confidence": 0.80,
      "similarity_reason": "Same categories and nearby location"
    }
  ],
  "related_by_category": [
    {
      "id": "clxyz789",
      "company_name": "Abuja Event Warehouse",
      "categories": ["seating", "tents"],
      "state": "FCT",
      "confidence": 0.75
    }
  ]
}
```

#### Status Codes

- `200 OK`: Success
- `404 Not Found`: Supplier not found
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### 3. Get States & Coverage

**GET** `/api/wholesale/states`

Get list of all Nigerian states with supplier counts.

#### Response

```json
{
  "states": [
    {
      "name": "Lagos",
      "supplier_count": 128,
      "avg_confidence": 0.82,
      "top_categories": ["seating", "tables", "tents"]
    },
    {
      "name": "FCT",
      "supplier_count": 45,
      "avg_confidence": 0.75,
      "top_categories": ["tents", "lighting", "sound"]
    },
    // ... all 37 states
  ],
  "geopolitical_zones": {
    "South-West": {
      "states": ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"],
      "supplier_count": 215
    },
    // ... other zones
  },
  "total_suppliers": 532,
  "states_with_coverage": 35,
  "states_without_coverage": ["Yobe", "Zamfara"]
}
```

---

### 4. Get Categories

**GET** `/api/wholesale/categories`

Get all product categories with supplier counts.

#### Response

```json
{
  "categories": [
    {
      "id": "seating",
      "label": "Seating",
      "supplier_count": 187,
      "top_products": ["Chiavari chairs", "Napoleon chairs", "Ghost chairs"],
      "avg_confidence": 0.78
    },
    {
      "id": "tables",
      "label": "Tables",
      "supplier_count": 142,
      "top_products": ["Round banquet tables", "Cocktail tables"],
      "avg_confidence": 0.75
    },
    // ... all categories
  ],
  "total_categories": 13
}
```

---

## Admin Endpoints

### 5. Manual Refresh

**POST** `/api/wholesale/admin/refresh`

Trigger a manual crawl/refresh.

**Auth**: Admin only

#### Request Body

```json
{
  "manual_refresh": true,
  "sources": ["maps", "directory"], // Optional: specific sources only
  "states": ["Lagos", "FCT"],      // Optional: specific states only
  "full_crawl": false               // Optional: full vs incremental
}
```

#### Response

```json
{
  "run_id": "run_20250122_120000",
  "status": "started",
  "estimated_duration_minutes": 45,
  "sources_queued": ["maps", "directory", "marketplace"],
  "states_queued": ["Lagos", "FCT"],
  "progress_url": "/api/wholesale/admin/refresh/run_20250122_120000"
}
```

---

### 6. Get Refresh Status

**GET** `/api/wholesale/admin/refresh/:run_id`

Get status of a running or completed refresh.

**Auth**: Admin only

#### Response

```json
{
  "run_id": "run_20250122_120000",
  "status": "running", // "started", "running", "completed", "failed"
  "progress": {
    "sources_completed": 2,
    "sources_total": 5,
    "sources_failed": 0,
    "records_found": 145,
    "records_new": 32,
    "records_updated": 18,
    "records_merged": 5,
    "current_source": "marketplace",
    "current_source_progress": "45%"
  },
  "started_at": "2025-01-22T12:00:00Z",
  "completed_at": null,
  "duration_seconds": 1234,
  "errors": []
}
```

---

### 7. Approval Queue

**GET** `/api/wholesale/admin/approvals`

Get list of suppliers awaiting approval (confidence < 0.6).

**Auth**: Admin only

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | ❌ | Filter by approval status: `pending`, `approved`, `rejected` |
| `page` | number | ❌ | Page number |
| `limit` | number | ❌ | Results per page |

#### Response

```json
{
  "pending_approvals": [
    {
      "id": "clxyz123",
      "supplier_id": "abc123...",
      "company_name": "Possible Supplier Ltd",
      "confidence": 0.55,
      "verifications": {
        "explicit_wholesale_language": false,
        "evidence_snippets": [],
        "cac_number": null
      },
      "needs_review_reason": "Low confidence - no explicit wholesale language",
      "submitted_at": "2025-01-15T04:30:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### 8. Approve/Reject Supplier

**PATCH** `/api/wholesale/admin/approvals/:id`

Approve or reject a supplier.

**Auth**: Admin only

#### Request Body

```json
{
  "action": "approved", // "approved" | "rejected"
  "notes": "Verified via phone call - confirmed wholesale operations",
  "override_confidence": 0.85 // Optional: manually set confidence
}
```

#### Response

```json
{
  "success": true,
  "supplier": {
    "id": "clxyz123",
    "approval_status": "approved",
    "confidence": 0.85,
    "approved_by": "admin_user_id",
    "approved_at": "2025-01-22T14:30:00Z"
  }
}
```

---

### 9. Find Duplicates

**GET** `/api/wholesale/admin/duplicates`

Find potential duplicate suppliers.

**Auth**: Admin only

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `min_similarity` | number | ❌ | Minimum similarity score (0-1) | Default: `0.7` |
| `limit` | number | ❌ | Max duplicate pairs to return | Default: `50` |

#### Response

```json
{
  "duplicate_pairs": [
    {
      "supplier1": {
        "id": "clxyz123",
        "company_name": "Lagos Event Supply",
        "phones": ["+2348012345678"]
      },
      "supplier2": {
        "id": "clxyz456",
        "company_name": "Lagos Event Supplies",
        "phones": ["+2348012345678"]
      },
      "similarity": 0.92,
      "reason": "Same phone number, similar names (92% match)"
    }
  ],
  "total_duplicates_found": 12
}
```

---

### 10. Merge Suppliers

**POST** `/api/wholesale/admin/merge`

Merge two supplier records.

**Auth**: Admin only

#### Request Body

```json
{
  "primary_id": "clxyz123",    // Keep this one
  "secondary_id": "clxyz456",  // Merge into primary
  "notes": "Confirmed same supplier via manual verification"
}
```

#### Response

```json
{
  "success": true,
  "merged_supplier": {
    "id": "clxyz123",
    "supplier_id": "abc123...",
    "company_name": "Lagos Event Supply",
    "aka_names": ["Lagos Event Supplies"], // Added secondary name
    "phones": ["+2348012345678", "+2348023456789"], // Union of both
    "source_url": "https://maps.google.com/... | merged: https://jiji.ng/...",
    "merged_from": ["clxyz456"],
    "merged_at": "2025-01-22T15:00:00Z"
  },
  "deleted_supplier_id": "clxyz456"
}
```

---

### 11. Blacklist Entry

**POST** `/api/wholesale/admin/blacklist`

Add a blacklist entry.

**Auth**: Admin only

#### Request Body

```json
{
  "type": "domain", // "domain" | "phone" | "email" | "instagram_handle" | "facebook_page"
  "value": "spam-site.com",
  "reason": "Known spam domain, not a real business"
}
```

#### Response

```json
{
  "success": true,
  "blacklist_entry": {
    "id": "clxyz789",
    "type": "domain",
    "value": "spam-site.com",
    "reason": "Known spam domain, not a real business",
    "added_by": "admin_user_id",
    "added_at": "2025-01-22T16:00:00Z"
  },
  "affected_suppliers": 3 // Number of suppliers now marked as blacklisted
}
```

---

### 12. Get Blacklist

**GET** `/api/wholesale/admin/blacklist`

Get all blacklist entries.

**Auth**: Admin only

#### Response

```json
{
  "blacklist": [
    {
      "id": "clxyz789",
      "type": "domain",
      "value": "spam-site.com",
      "reason": "Known spam domain",
      "added_by": "admin_user_id",
      "added_at": "2025-01-22T16:00:00Z"
    }
  ],
  "total_entries": 15
}
```

---

### 13. Remove Blacklist Entry

**DELETE** `/api/wholesale/admin/blacklist/:id`

Remove a blacklist entry.

**Auth**: Admin only

#### Response

```json
{
  "success": true,
  "removed_entry": {
    "id": "clxyz789",
    "type": "domain",
    "value": "spam-site.com"
  },
  "unblocked_suppliers": 3
}
```

---

### 14. Get Logs

**GET** `/api/wholesale/admin/logs`

Get crawl run logs.

**Auth**: Admin only

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | ❌ | Filter by specific run |
| `source_platform` | string | ❌ | Filter by source |
| `success_only` | boolean | ❌ | Only successful parses |
| `errors_only` | boolean | ❌ | Only failed parses |
| `page` | number | ❌ | Page number |
| `limit` | number | ❌ | Results per page |

#### Response

```json
{
  "logs": [
    {
      "id": "clxyz890",
      "run_id": "run_20250122_040000",
      "run_at_utc": "2025-01-22T04:00:00Z",
      "source_platform": "maps",
      "source_url": "https://maps.google.com/search?q=chairs+Lagos",
      "http_status": 200,
      "parse_success": true,
      "records_found": 45,
      "records_new": 12,
      "records_updated": 8,
      "records_merged": 3,
      "error_message": null,
      "duration_ms": 5420,
      "manual": false,
      "created_at": "2025-01-22T04:05:00Z"
    }
  ],
  "pagination": { /* ... */ },
  "summary": {
    "total_runs": 24,
    "successful_runs": 22,
    "failed_runs": 2,
    "total_records_added": 532,
    "last_successful_run": "2025-01-22T04:00:00Z"
  }
}
```

---

### 15. Update Supplier (Admin Edit)

**PATCH** `/api/wholesale/admin/suppliers/:id`

Manually edit supplier data.

**Auth**: Admin only

#### Request Body

Any editable fields from the supplier schema:

```json
{
  "company_name": "Updated Company Name",
  "phones": ["+2348012345678"],
  "confidence": 0.90,
  "approval_status": "approved",
  "notes": "Manually verified via phone call"
}
```

#### Response

```json
{
  "success": true,
  "supplier": {
    "id": "clxyz123",
    // ... updated supplier object
    "updated_by": "admin_user_id",
    "updated_at": "2025-01-22T17:00:00Z"
  },
  "audit_log_id": "clxyz999" // ActivityLog record ID
}
```

---

## Rate Limiting

All endpoints are rate-limited:

- **Anonymous/unauthenticated**: 20 requests/minute
- **Authenticated users**: 60 requests/minute
- **Admin users**: 120 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1643000000
```

When exceeded:
```json
{
  "error": "Too many requests. Please try again later.",
  "retry_after_seconds": 30
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Validation error details"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Webhooks (Future)

Future support for webhooks on events:

- `supplier.created`
- `supplier.updated`
- `supplier.approved`
- `supplier.merged`
- `refresh.completed`

---

## Versioning

API version: `v1`

Version will be included in future endpoint paths if breaking changes are needed:

```
/api/v2/wholesale/suppliers
```

