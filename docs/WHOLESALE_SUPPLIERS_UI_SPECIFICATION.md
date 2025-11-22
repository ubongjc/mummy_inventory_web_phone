# Wholesale Suppliers UI Specification

## Overview

This document specifies the user interface for the Wholesale Supplier Discovery feature, including both customer-facing search/browse experience and admin management dashboard.

---

## Customer-Facing UI

### Page: `/wholesale-suppliers`

Main supplier discovery and search interface.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Header/Nav                           │
├─────────────────────────────────────────────────────────────┤
│                      Hero Section                            │
│  "Find Wholesale Suppliers for Your Rental Business"        │
│  [ Large Search Bar ]                                        │
├─────────────────────────────────────────────────────────────┤
│  Filters Sidebar  │          Main Content Area               │
│  (collapsible)    │                                          │
│  ┌──────────────┐ │  ┌────────────────────────────────────┐│
│  │ Categories   │ │  │  Results Header                    ││
│  │ ☐ Seating    │ │  │  245 suppliers • Sort by: Relevance││
│  │ ☐ Tables     │ │  ├────────────────────────────────────┤│
│  │ ☐ Tents      │ │  │                                    ││
│  ├──────────────┤ │  │  [ Supplier Card ]                 ││
│  │ Location     │ │  │  [ Supplier Card ]                 ││
│  │ 🔍 State     │ │  │  [ Supplier Card ]                 ││
│  │ ☐ Lagos      │ │  │  [ Supplier Card ]                 ││
│  │ ☐ FCT        │ │  │  [ Supplier Card ]                 ││
│  ├──────────────┤ │  │                                    ││
│  │ Delivery     │ │  │  [ Load More / Pagination ]        ││
│  │ ☐ Nationwide │ │  │                                    ││
│  ├──────────────┤ │  └────────────────────────────────────┘│
│  │ Other Filters│ │                                          │
│  └──────────────┘ │  [ Map Toggle ]                          │
└───────────────────┴──────────────────────────────────────────┘
│                        Footer                                │
└─────────────────────────────────────────────────────────────┘
```

---

### Hero Section

**Title**:
```
Find Wholesale Suppliers for Your Rental Business
```

**Subtitle**:
```
Discover verified suppliers of chairs, tables, tents, and event equipment
across Nigeria. Buy in bulk to stock your inventory.
```

**Search Bar**:
- Large input field with search icon
- Placeholder: "Search for Chiavari chairs, marquee tents, generators..."
- Auto-complete suggestions as user types
- Search button: "Search Suppliers"

**Quick Category Chips** (below search):
```
[ 🪑 Chairs ]  [ 🏓 Tables ]  [ ⛺ Tents ]  [ 💡 Lighting ]
[ 🔊 Sound ]   [ ⚡ Generators ]  [ 👗 Bridal Wear ]
```
Click to filter by category instantly.

---

### Filters Sidebar

**Collapsible on mobile**. "Filters" button with count of active filters.

#### 1. Categories
Multi-select checkboxes with icons:
```
☐ 🪑 Seating (187 suppliers)
☐ 🏓 Tables (142 suppliers)
☐ ⛺ Tents & Canopies (98 suppliers)
☐ 🌿 Flooring & Grass (56 suppliers)
☐ 🧺 Linens (73 suppliers)
☐ 🎨 Decor (64 suppliers)
☐ 💡 Lighting (89 suppliers)
☐ 🔊 Sound Equipment (71 suppliers)
☐ 🎭 Staging & Truss (42 suppliers)
☐ 🍽️ Catering Ware (38 suppliers)
☐ ⚡ Generators (91 suppliers)
☐ 🚻 Mobile Toilets (27 suppliers)
☐ 👗 Bridal Wear (45 suppliers)
```

#### 2. Location
**State Search Input**: Type to filter states

**Geopolitical Zones** (collapsible):
```
▼ South-West (215 suppliers)
  ☐ Lagos (128)
  ☐ Ogun (42)
  ☐ Oyo (25)
  ☐ Osun (10)
  ☐ Ondo (7)
  ☐ Ekiti (3)

▼ South-East (87 suppliers)
  ☐ Anambra (31)
  ☐ Abia (22)
  ...

(show all zones)
```

**Or select all states alphabetically**:
```
☐ Abia (22)
☐ Adamawa (5)
☐ Akwa Ibom (18)
...
☐ FCT (45)
```

#### 3. Delivery Options
```
☐ Nationwide Delivery (142 suppliers)
☐ Regional Delivery (189 suppliers)
☐ Pickup Only (114 suppliers)
```

#### 4. Wholesale Verified
```
☑️ Only show verified wholesale suppliers
```
Toggle to filter `explicit_wholesale_language: true`

#### 5. Minimum Order Quantity (MOQ)
Range slider:
```
Min:  [0]─────●─────[1000] units
```
Shows suppliers with MOQ in range or no MOQ specified.

#### 6. Lead Time
Range slider:
```
Max:  [0]─────●─────[60] days
```
Filter by maximum acceptable lead time.

#### 7. Rating
Star rating filter:
```
☐ 4+ stars (89 suppliers)
☐ 3+ stars (156 suppliers)
☐ Any rating (245 suppliers)
```

#### 8. Confidence Score
```
☐ High confidence (≥80%) - 187 suppliers
☐ Medium confidence (60-79%) - 45 suppliers
☐ All suppliers - 245 suppliers
```

**Clear All Filters** button at bottom.

---

### Results Header

```
┌─────────────────────────────────────────────────────────────┐
│  245 suppliers found                                         │
│                                                    Sort by:  │
│  Active filters: Seating × Lagos × Nationwide ×   [Dropdown]│
│                                                    • Relevance│
│  [ View: Grid | List | Map ]                      • Name (A-Z)│
│                                                    • Confidence│
│                                                    • Rating   │
└─────────────────────────────────────────────────────────────┘
```

Active filters shown as removable chips.

View toggles:
- **Grid**: Cards in 2-3 column grid
- **List**: Full-width cards with more detail
- **Map**: Google Maps with clustered pins

---

### Supplier Card (Grid View)

```
┌───────────────────────────────────────────────┐
│ 🏢 Lagos Event Supply Ltd                    │
│ ★★★★☆ 4.2 (18 reviews)                       │
├───────────────────────────────────────────────┤
│ Categories:                                   │
│ [ Seating ] [ Tables ] [ Tents ]              │
│                                               │
│ Key Products:                                 │
│ • Chiavari chairs (bulk: ₦18k-28k)           │
│ • Round banquet tables                        │
│ • Marquee tents                               │
│                                               │
│ 📍 Ojo, Lagos • 🚚 Nationwide delivery        │
│ ⏱️ Lead time: 14 days • MOQ: 50 units        │
│                                               │
│ ✅ Wholesale Verified                         │
│ 🏆 85% Confidence                             │
│                                               │
│ [ 📞 Call ] [ 💬 WhatsApp ] [ 📧 Email ]     │
│ [ View Details → ]                            │
└───────────────────────────────────────────────┘
```

**Badges**:
- ✅ Wholesale Verified (green badge)
- 🚚 Nationwide Delivery (blue badge)
- 🏆 High Confidence ≥80% (gold badge)
- ⭐ Top Rated ≥4.5 stars (yellow badge)

**Call-to-Action Buttons**:
- **Call**: Opens phone dialer on mobile, shows number on desktop
- **WhatsApp**: Opens WhatsApp chat (web or app)
- **Email**: Opens email client or shows email
- **View Details**: Opens supplier detail page

---

### Supplier Card (List View)

More expanded horizontal layout:

```
┌────────────────────────────────────────────────────────────────────┐
│ [Image]  🏢 Lagos Event Supply Ltd                    ★★★★☆ 4.2   │
│  (logo)  [ Seating ] [ Tables ] [ Tents ]              (18 reviews)│
│          📍 Plot 45, Trade Fair Complex, Ojo, Lagos                │
│          🚚 Nationwide • ⏱️ 14 days • MOQ: 50 units               │
│                                                                     │
│          Key Products: Chiavari chairs (₦18k-28k bulk), Round     │
│          banquet tables, Marquee tents, Resin folding chairs       │
│                                                                     │
│          ✅ Wholesale Verified • 🏆 85% Confidence                 │
│                                                                     │
│          [ 📞 +2348012345678 ] [ 💬 WhatsApp ] [ 📧 Email ]       │
│          [ View Details → ]                                        │
└────────────────────────────────────────────────────────────────────┘
```

---

### Map View

Google Maps integration with:

- **Clustered pins**: Show supplier count in each cluster
- **Pin colors**: Green (high confidence), Yellow (medium), Red (low)
- **Info window** on pin click: Mini card with supplier name, categories, and "View Details" link
- **List sync**: Map bounds filter list results
- **Search this area** button appears when map is moved

---

### Pagination

Bottom of results:

```
┌─────────────────────────────────────────────────────────────┐
│  Showing 1-20 of 245 suppliers                               │
│                                                               │
│  [ ← Previous ]  [ 1 ] [2] [3] ... [13]  [ Next → ]        │
│                                                               │
│  Or: [ Load More (20 more) ]                                 │
└─────────────────────────────────────────────────────────────┘
```

Options:
- **Pagination**: Traditional page numbers
- **Load More**: Infinite scroll style

---

## Supplier Detail Page

### Page: `/wholesale-suppliers/:id`

Full details of a single supplier.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [ ← Back to Search ]                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🏢 Lagos Event Supply Ltd                  ★★★★☆ 4.2 (18)  │
│  ✅ Wholesale Verified • 🏆 85% Confidence                   │
│                                                               │
│  Categories: [ Seating ] [ Tables ] [ Tents ]                │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📍 Location                                                  │
│  Plot 45, Trade Fair Complex, Ojo, Lagos, Nigeria            │
│  [ View on Map ]                                              │
│                                                               │
│  🚚 Coverage Areas                                            │
│  Nationwide delivery available                                │
│  Primary regions: South-West (Lagos, Ogun, Oyo, Osun)        │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📦 Wholesale Terms                                           │
│  • Bulk orders available: ✅ Yes                             │
│  • Minimum order quantity: 50 units                           │
│  • Lead time: 14 days                                         │
│  • Returns policy: 7-day return, 1-year warranty             │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🛍️ Products & Pricing                                       │
│  • Chiavari chairs: ₦18,000 - ₦28,000 per unit (bulk)       │
│  • Napoleon chairs                                            │
│  • Round banquet tables (6ft, 8ft)                           │
│  • Marquee tents (various sizes)                             │
│  • Resin folding chairs                                       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📞 Contact Information                                       │
│  Phone: +234-801-234-5678                    [ Call Now ]    │
│  WhatsApp: +234-801-234-5678            [ Chat on WhatsApp ] │
│  Email: sales@lagosevent.com                 [ Send Email ]  │
│  Website: lagosevent.com                     [ Visit Site ]  │
│                                                               │
│  🕒 Business Hours                                            │
│  Monday - Friday: 8:00 AM - 6:00 PM                          │
│  Saturday: 9:00 AM - 4:00 PM                                 │
│  Sunday: Closed                                               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📱 Social Media                                              │
│  Instagram: @lagosevent                      [ Follow ]       │
│  Facebook: Lagos Event Supply Ltd            [ Follow ]       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ Verification Details                                      │
│  • Explicit wholesale language: ✅ Confirmed                 │
│  • Evidence: "We sell wholesale and retail", "Bulk orders   │
│    available", "MOQ: 50 pieces"                              │
│  • CAC Number: RC123456 (Corporate Affairs Commission)       │
│  • Confidence Score: 85% (High)                              │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📝 Additional Notes                                          │
│  Verified supplier with good customer reviews. Specializes   │
│  in event furniture. Located at Trade Fair Complex, easy     │
│  access for bulk pickups.                                    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🔗 Similar Suppliers                                         │
│                                                               │
│  [ Supplier Card ] [ Supplier Card ] [ Supplier Card ]       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🗂️ Related Suppliers by Category                            │
│                                                               │
│  Seating Suppliers in Lagos:                                 │
│  [ Supplier Card ] [ Supplier Card ] [ Supplier Card ]       │
│                                                               │
│  Tent Suppliers Nationwide:                                  │
│  [ Supplier Card ] [ Supplier Card ] [ Supplier Card ]       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Large contact buttons (mobile-optimized)
- Embedded map showing location
- Similar/related suppliers at bottom
- Social proof (ratings, verification badges)
- Clear wholesale terms and MOQ
- Direct action buttons (call, WhatsApp, email)

---

## Mobile Responsive Design

### Mobile Layout Adjustments

1. **Filters**: Collapsible modal/drawer on mobile
   - Bottom sheet that slides up
   - "Filters (3)" button shows active filter count

2. **Search Bar**: Full-width, sticky at top

3. **Cards**: Single column, full-width

4. **Map Toggle**: Floating button in bottom-right corner

5. **Contact Buttons**: Large, thumb-friendly (min 44px height)

### Mobile Navigation

Bottom navigation bar:
```
┌─────────────────────────────────────────────────────────────┐
│  [ 🏠 Home ] [ 🔍 Search ] [ ⭐ Saved ] [ 👤 Account ]      │
└─────────────────────────────────────────────────────────────┘
```

---

## Empty States

### No Results Found

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                   🔍                                          │
│                                                               │
│          No suppliers found matching your search              │
│                                                               │
│  Try:                                                         │
│  • Removing some filters                                     │
│  • Searching for different keywords                          │
│  • Expanding to nearby states                                │
│                                                               │
│  [ Clear All Filters ]  [ View All Suppliers ]              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### No Suppliers in State

```
┌─────────────────────────────────────────────────────────────┐
│                   📍                                          │
│                                                               │
│    No suppliers found in Yobe State yet                      │
│                                                               │
│  We're working on expanding our coverage. Try nearby states: │
│  • Borno                                                      │
│  • Gombe                                                      │
│                                                               │
│  Or search nationwide suppliers that deliver to your area.   │
│                                                               │
│  [ View Nationwide Suppliers ]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Loading States

### Initial Load (Skeleton)

Show skeleton cards while loading:

```
┌───────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                    │
│ ▓▓▓▓▓ ▓▓▓▓▓▓▓▓                               │
├───────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓:                                  │
│ ▓ ▓▓▓▓▓▓▓▓ ▓ ▓▓▓▓▓▓▓ ▓ ▓▓▓▓▓▓                │
│                                               │
│ ▓▓▓ ▓▓▓▓▓▓▓▓:                                 │
│ • ▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓              │
│ • ▓▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓▓                      │
│                                               │
│ ▓ ▓▓▓▓▓ ▓▓▓▓▓ • ▓ ▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓      │
└───────────────────────────────────────────────┘
```

### Infinite Scroll Loading

At bottom of results:
```
┌─────────────────────────────────────────────────────────────┐
│                   🔄 Loading more suppliers...                │
└─────────────────────────────────────────────────────────────┘
```

---

## Accessibility

### ARIA Labels

- Search input: `aria-label="Search for wholesale suppliers"`
- Filter checkboxes: `aria-label="Filter by {category} category"`
- Supplier cards: `aria-label="Supplier: {company_name}"`

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons/links
- Escape to close modals/filters
- Arrow keys for map navigation

### Screen Reader Support

- Announce filter changes: "Filtered by Seating category, showing 187 results"
- Announce pagination: "Page 2 of 13"
- Describe supplier cards with all key info

### Color Contrast

- WCAG AA compliant (4.5:1 minimum contrast)
- Don't rely on color alone (use icons + text)

---

## Performance Optimizations

1. **Lazy load images**: Load supplier logos only when in viewport
2. **Virtual scrolling**: For long lists (>100 items)
3. **Debounced search**: Wait 300ms after last keystroke
4. **Cached filters**: Store filter state in URL params
5. **Prefetch details**: Hover to prefetch supplier detail page

---

## Analytics Events

Track user interactions:

```javascript
// Search
trackEvent('supplier_search', { query, filters_applied });

// Filter applied
trackEvent('filter_applied', { filter_type, filter_value });

// Supplier card clicked
trackEvent('supplier_card_clicked', { supplier_id, source: 'search_results' });

// Contact button clicked
trackEvent('supplier_contact_clicked', { supplier_id, method: 'whatsapp' });

// Call-to-action
trackEvent('supplier_cta', { action: 'call', supplier_id });
```

---

## Future Enhancements

### Phase 2 Features

1. **Saved Suppliers**: Bookmark/favorite suppliers
2. **Comparison Tool**: Compare up to 3 suppliers side-by-side
3. **RFQ (Request for Quote)**: Send quote request to multiple suppliers
4. **Supplier Ratings**: Allow users to rate/review suppliers
5. **Price Alerts**: Notify when supplier updates pricing
6. **Supplier Profiles**: Allow suppliers to claim and manage their listings

---

This completes the Customer-Facing UI specification. See `WHOLESALE_SUPPLIERS_ADMIN_UI_SPECIFICATION.md` for the admin dashboard design.
