# Wholesale Suppliers Quality Report

**Generated**: [DATE TIME]
**Report Period**: [START_DATE] to [END_DATE]
**Run ID**: [RUN_ID]

---

## Executive Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Suppliers | [N] | ≥500 | ✅/❌ |
| States Covered | [N]/37 | 37/37 | ✅/❌ |
| Median Confidence | [N]% | ≥70% | ✅/❌ |
| Duplicate Rate | [N]% | <3% | ✅/❌ |
| Contact Info Coverage | [N]% | ≥95% | ✅/❌ |

**Overall Health**: 🟢 Excellent / 🟡 Good / 🟠 Needs Improvement / 🔴 Critical

---

## 1. Geographic Coverage

### Suppliers by State

| State | Suppliers | % of Total | Avg Confidence | Top Categories |
|-------|-----------|------------|----------------|----------------|
| Lagos | [N] | [%] | [N]% | Seating, Tables, Tents |
| FCT | [N] | [%] | [N]% | Tents, Lighting, Sound |
| Rivers | [N] | [%] | [N]% | Seating, Generators |
| ... | ... | ... | ... | ... |

### States Without Coverage

**Missing**: [List states with 0 suppliers]

**Action Items**:
- [ ] Target manual searches for [STATE_NAME]
- [ ] Add local directories for [STATE_NAME]

### Geopolitical Zone Distribution

| Zone | Suppliers | % of Total | Avg Confidence |
|------|-----------|------------|----------------|
| South-West | [N] | [%] | [N]% |
| South-East | [N] | [%] | [N]% |
| South-South | [N] | [%] | [N]% |
| North-Central | [N] | [%] | [N]% |
| North-East | [N] | [%] | [N]% |
| North-West | [N] | [%] | [N]% |

---

## 2. Category Coverage

### Suppliers by Category

| Category | Suppliers | % of Total | Avg Confidence | Top States |
|----------|-----------|------------|----------------|------------|
| Seating | [N] | [%] | [N]% | Lagos, FCT, Rivers |
| Tables | [N] | [%] | [N]% | Lagos, Ogun, Anambra |
| Tents & Canopies | [N] | [%] | [N]% | Lagos, FCT, Kano |
| Flooring & Grass | [N] | [%] | [N]% | Lagos, Ogun, Delta |
| Linens | [N] | [%] | [N]% | Lagos, Kano, Anambra |
| Decor | [N] | [%] | [N]% | Lagos, FCT, Ogun |
| Lighting | [N] | [%] | [N]% | Lagos, FCT, Rivers |
| Sound Equipment | [N] | [%] | [N]% | Lagos, Ogun, FCT |
| Staging & Truss | [N] | [%] | [N]% | Lagos, FCT, Rivers |
| Catering Ware | [N] | [%] | [N]% | Lagos, Kano, Ogun |
| Generators | [N] | [%] | [N]% | Lagos, Kano, Rivers |
| Mobile Toilets | [N] | [%] | [N]% | Lagos, FCT, Rivers |
| Bridal Wear | [N] | [%] | [N]% | Lagos, Kano, Anambra |

### Category Gaps

**Under-represented categories** (< 30 suppliers):
- [CATEGORY_NAME]: [N] suppliers
- [CATEGORY_NAME]: [N] suppliers

**Action Items**:
- [ ] Target searches for [CATEGORY] suppliers
- [ ] Add specialized directories for [CATEGORY]

---

## 3. Confidence Score Distribution

### Overall Confidence Histogram

```
High (≥80%):     ███████████████████░░░░░░  [N] suppliers ([%])
Medium (60-79%): ████████░░░░░░░░░░░░░░░░░  [N] suppliers ([%])
Low (<60%):      ███░░░░░░░░░░░░░░░░░░░░░░  [N] suppliers ([%])
```

**Median**: [N]%
**Average**: [N]%
**Mode**: [N]%

### Confidence Breakdown by Source

| Source Platform | Suppliers | Avg Confidence | High Confidence (≥80%) |
|-----------------|-----------|----------------|------------------------|
| Google Maps | [N] | [N]% | [N] ([%]) |
| BusinessList | [N] | [N]% | [N] ([%]) |
| Finelib | [N] | [N]% | [N] ([%]) |
| Jiji.ng | [N] | [N]% | [N] ([%]) |
| Instagram/Facebook | [N] | [N]% | [N] ([%]) |
| Official Sites | [N] | [N]% | [N] ([%]) |

**Insight**: [Which sources yield highest confidence? Why?]

---

## 4. Data Completeness

### Contact Information Coverage

| Field | Populated | % Coverage | Target |
|-------|-----------|------------|--------|
| Phone | [N]/[TOTAL] | [%] | 95% |
| WhatsApp | [N]/[TOTAL] | [%] | 70% |
| Email | [N]/[TOTAL] | [%] | 80% |
| Website | [N]/[TOTAL] | [%] | 50% |
| Instagram | [N]/[TOTAL] | [%] | 40% |
| Facebook | [N]/[TOTAL] | [%] | 40% |

**At least one contact method**: [N]/[TOTAL] ([%])

**Suppliers with NO contact info**: [N] (flagged for removal)

### Location Data Coverage

| Field | Populated | % Coverage | Target |
|-------|-----------|------------|--------|
| State | [N]/[TOTAL] | [%] | 100% |
| LGA/City | [N]/[TOTAL] | [%] | 80% |
| Full Address | [N]/[TOTAL] | [%] | 60% |
| Coordinates (lat/lon) | [N]/[TOTAL] | [%] | 50% |

### Wholesale Terms Coverage

| Field | Populated | % Coverage | Target |
|-------|-----------|------------|--------|
| Bulk Available | [N]/[TOTAL] | [%] | 100% |
| MOQ Units | [N]/[TOTAL] | [%] | 60% |
| Price Range Hint | [N]/[TOTAL] | [%] | 40% |
| Lead Time Days | [N]/[TOTAL] | [%] | 50% |
| Delivery Options | [N]/[TOTAL] | [%] | 80% |

---

## 5. Duplicate Detection

### Deduplication Summary

**Duplicate pairs found**: [N]
**Auto-merged**: [N] (similarity ≥95%)
**Pending manual review**: [N] (similarity 70-94%)
**Unique suppliers (after merge)**: [N]

**Duplicate Rate**: [N]% (duplicates/total before merge)

### Top Duplicate Patterns

| Pattern | Occurrences | Example |
|---------|-------------|---------|
| Same phone, similar name | [N] | "Lagos Event Supply" / "Lagos Event Supplies" |
| Same email, different sources | [N] | Maps + Jiji listings |
| Same address, spelling variations | [N] | "Trade Fair Complex" variations |

### Deduplication Quality

**False positives** (incorrectly merged): [N] (requires undo)
**False negatives** (missed duplicates): [N] (estimated)

**Action Items**:
- [ ] Review pending duplicate pairs
- [ ] Adjust similarity threshold if needed
- [ ] Add manual merge rules for common patterns

---

## 6. Verification & Wholesale Evidence

### Wholesale Language Detection

**Explicit wholesale language**: [N]/[TOTAL] ([%])

**Top evidence keywords**:
- "wholesale": [N] occurrences
- "bulk": [N] occurrences
- "MOQ": [N] occurrences
- "distributor": [N] occurrences
- "manufacturer": [N] occurrences

**Suppliers without wholesale evidence**: [N] (flagged for manual review)

### CAC Number (Corporate Affairs Commission)

**Suppliers with CAC number**: [N]/[TOTAL] ([%])

**Insight**: CAC numbers increase confidence by +10%. Target suppliers with public CAC data.

---

## 7. Source Performance

### Crawl Statistics by Source

| Source | URLs Crawled | HTTP 200 | Parse Success | Records Found | New | Updated | Errors |
|--------|--------------|----------|---------------|---------------|-----|---------|--------|
| Google Maps | [N] | [N] | [N]% | [N] | [N] | [N] | [N] |
| BusinessList | [N] | [N] | [N]% | [N] | [N] | [N] | [N] |
| Finelib | [N] | [N] | [N]% | [N] | [N] | [N] | [N] |
| Jiji.ng | [N] | [N] | [N]% | [N] | [N] | [N] | [N] |
| Instagram/FB | [N] | [N] | [N]% | [N] | [N] | [N] | [N] |
| Official Sites | [N] | [N] | [N]% | [N] | [N] | [N] | [N] |

### Failed Sources

**Sources with errors** (HTTP ≠ 200 or parse failed):

1. [SOURCE_NAME] - [URL] - Error: [ERROR_MESSAGE]
2. [SOURCE_NAME] - [URL] - Error: [ERROR_MESSAGE]

**Action Items**:
- [ ] Retry failed sources with increased timeout
- [ ] Update parsers for changed page structures
- [ ] Add fallback/alternative sources

---

## 8. Freshness & Updates

### Data Age Distribution

| Last Seen | Suppliers | % of Total |
|-----------|-----------|------------|
| < 7 days | [N] | [%] |
| 7-30 days | [N] | [%] |
| 30-90 days | [N] | [%] |
| > 90 days | [N] | [%] |

**Stale suppliers** (not seen in 90+ days): [N]

**Action Items**:
- [ ] Re-verify stale suppliers
- [ ] Mark unreachable suppliers for removal

### Update Activity (This Run)

**New suppliers added**: [N]
**Existing suppliers updated**: [N]
**Suppliers merged**: [N]
**Suppliers removed/blacklisted**: [N]

**Change rate**: [N]% (changed suppliers / total)

---

## 9. Quality Issues & Flags

### Low Quality Records

**Suppliers flagged for review** (confidence < 60%):

| ID | Company Name | State | Confidence | Issue |
|----|--------------|-------|------------|-------|
| [ID] | [NAME] | [STATE] | [N]% | No wholesale language detected |
| [ID] | [NAME] | [STATE] | [N]% | Only 1 contact method |
| [ID] | [NAME] | [STATE] | [N]% | Ambiguous category |

**Total low-confidence records**: [N] ([%] of total)

**Action**: Send to approval queue for manual review.

### Data Validation Errors

**Records with validation errors**:

| Error Type | Count | Example |
|------------|-------|---------|
| Invalid phone format | [N] | "070123456789" (missing +234) |
| Invalid email format | [N] | "notanemail" |
| Invalid URL | [N] | "htp://broken-url" |
| Missing required fields | [N] | No state or contact info |

**Action**: Auto-fix where possible, flag for manual review otherwise.

---

## 10. Recommendations

### High Priority

1. **[ACTION_ITEM]**
   - Issue: [DESCRIPTION]
   - Impact: [SEVERITY]
   - Effort: Low/Medium/High

2. **[ACTION_ITEM]**
   - Issue: [DESCRIPTION]
   - Impact: [SEVERITY]
   - Effort: Low/Medium/High

### Medium Priority

1. **[ACTION_ITEM]**
2. **[ACTION_ITEM]**

### Low Priority / Future

1. **[ACTION_ITEM]**
2. **[ACTION_ITEM]**

---

## 11. Next Steps

### Automated Tasks (Next Run)

- [ ] Re-crawl failed sources
- [ ] Update stale supplier records (>60 days old)
- [ ] Auto-merge high-similarity duplicates (≥95%)
- [ ] Export updated JSONL and CSV

### Manual Tasks (Admin Action Required)

- [ ] Review [N] suppliers in approval queue
- [ ] Merge [N] duplicate pairs manually
- [ ] Verify [N] low-confidence records
- [ ] Investigate [N] data validation errors
- [ ] Add new sources for [CATEGORY_NAME] category
- [ ] Expand coverage in [STATE_NAME]

---

## Appendix: Data Samples

### High-Quality Supplier Example

```json
{
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
    "delivery_options": ["nationwide", "regional"]
  },
  "state": "Lagos",
  "phones": ["+2348012345678"],
  "emails": ["sales@lagosevent.com"],
  "confidence": 0.85,
  "verifications": {
    "explicit_wholesale_language": true,
    "evidence_snippets": ["'we sell wholesale and retail'", "'bulk orders available'"],
    "cac_number": "RC123456"
  }
}
```

### Low-Quality Supplier Example (Flagged)

```json
{
  "supplier_id": "xyz789abc123...",
  "company_name": "Possible Supplier",
  "categories": ["seating"],
  "product_examples": ["chairs"],
  "wholesale_terms": {
    "bulk_available": false // Ambiguous
  },
  "state": "Lagos",
  "phones": ["+2348034567890"],
  "emails": [],
  "confidence": 0.42, // Low!
  "verifications": {
    "explicit_wholesale_language": false, // No evidence
    "evidence_snippets": []
  },
  "notes": "Flagged for manual review - insufficient wholesale evidence"
}
```

---

**Report End**

*Generated by Wholesale Supplier Discovery System v1.0*
