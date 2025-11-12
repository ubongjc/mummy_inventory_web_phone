# Ufonime Rental Inventory - Testing Guide

This guide covers how to run and interpret tests for the Ufonime Rental Inventory application.

## Quick Start

```bash
# 1. Seed test data
npm run seed:test

# 2. Run all tests
npm test

# 3. Run tests in watch mode (during development)
npm run test:watch

# 4. Run tests with coverage
npm run test:coverage
```

## Test Structure

```
__tests__/
├── availability.test.ts     # Core availability calculation logic
├── api-validation.test.ts   # Input validation and business rules
└── manual-checklist.md      # Manual QA checklist for UI/UX
```

## Automated Tests

### 1. Availability Engine Tests (`availability.test.ts`)

Tests the core business logic for calculating item availability across date ranges.

**What it tests:**
- ✅ Only counts CONFIRMED and OUT rentals (ignores CANCELLED/RETURNED)
- ✅ Single-day rentals (start == end)
- ✅ Overlapping rentals accumulate correctly
- ✅ Editing a rental excludes itself from availability check
- ✅ Date boundary handling (inclusive ranges)

**Run specific test:**
```bash
npm test -- availability
```

### 2. API Validation Tests (`api-validation.test.ts`)

Tests input validation for rentals, customers, and payments.

**What it tests:**
- ✅ Date validation (return before start, same-day, 1-year max)
- ✅ Status validation (DRAFT rejection, valid statuses)
- ✅ Items validation (at least one item, positive quantity)
- ✅ Payment validation (no overpayment)
- ✅ Customer validation (required fields, email format)
- ✅ Required fields enforcement

**Run specific test:**
```bash
npm test -- api-validation
```

## Test Data

### Seeding Test Data

The `seed-test.ts` script creates a realistic test environment:

**Items Created:**
- Tables: 10 pcs
- Chairs: 100 pcs
- Canopy: 5 pcs
- Plates: 200 pcs
- Forks: 200 pcs
- Spoons: 200 pcs

**Customers Created:**
- John Smith
- Jane Doe
- Bob Johnson

**Rentals Created:**
- **Rental A**: Chairs ×40 (Nov 4-8, CONFIRMED) with payment
- **Rental B**: Chairs ×70 (Nov 6-11, CONFIRMED) - **OVERLAPS with A**
- **Rental C**: Tables ×5, Plates ×50 (Nov 9-29, OUT) with 2 payments
- **Rental D**: Canopy ×1 (Nov 15, RETURNED) - single day
- **Rental E**: Forks ×100, Spoons ×100 (Nov 4-8, CONFIRMED)
- **Rental F**: Tables ×3 (Nov 15-20, CANCELLED)

**Key Test Scenario:**
Nov 6-8: Both Rental A (40 chairs) and Rental B (70 chairs) are active, requiring 110 chairs total but only 100 are available → This creates a conflict scenario for testing overbooking protection!

### Resetting Test Data

```bash
# Clear all data and reseed with test data
npm run seed:test
```

## Manual Testing Checklist

For UI/UX and integration testing that requires human verification, see the comprehensive manual checklist covering:

### 0. Environment & Data
- Seed data verification
- Timezone handling
- FullCalendar CSS loading

### 1. Home / Calendar
- Multi-day event spanning
- Month navigation
- Day/event click behavior
- Item filtering (search, sort, multi-select)

### 2. Inventory Management
- Items CRUD operations
- Customers CRUD operations
- Delete guards (FK constraints)
- Bulk import

### 3. Rentals / Bookings
- Create booking flow
- Date validation (UI)
- Live availability checking
- Overbooking prevention
- Edit/delete operations

### 4. Payments
- Add payments
- Overdue detection
- Payment validation

### 5. Settings
- Business information updates
- Operational settings

### 6. Availability Engine (Integration)
- Real-world scenarios
- Edge cases (DST, leap day, month boundaries)

### 7. UI Consistency
- Responsive design
- Field alignment
- Mobile Safari compatibility

### 8. Data Integrity
- Cascade deletes
- Foreign key guards
- Error messaging

### 9. Bulk Operations
- Import success/failure reporting
- Data reset

### 10. Performance
- Large dataset handling
- Cross-browser compatibility

### 11. Regression Guards
- Previously fixed bugs verification

### 12. Nice-to-have Verifications
- Color persistence
- Status chips consistency
- CSV export

## Test Coverage Goals

| Area | Target | Current |
|------|--------|---------|
| Availability Logic | 100% | ✅ 100% |
| Validation Rules | 100% | ✅ 100% |
| API Routes | 80%+ | 🔄 In progress |
| UI Components | 60%+ | 📝 Manual only |
| E2E Workflows | Critical paths | 📝 Manual only |

## Running Tests in CI/CD

```bash
# Full test suite (for CI/CD pipelines)
npm run test:ci
```

This command:
1. Runs all automated tests
2. Generates coverage report
3. Fails if coverage drops below threshold
4. Outputs test results in CI-friendly format

## Troubleshooting

### Tests fail with database errors
```bash
# Reset the test database
npm run seed:test
```

### Tests pass locally but fail in CI
- Check timezone settings (tests assume UTC)
- Verify Node.js version matches (>=18)
- Ensure all dependencies installed (`npm ci`)

### Availability tests show wrong numbers
- Clear database: `npm run seed:test`
- Check that previous test runs didn't leave orphaned data
- Verify test isolation (each test should clean up)

## Writing New Tests

### Unit Test Template
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should do something specific', async () => {
    // Arrange
    const input = { /* test data */ };

    // Act
    const result = await someFunction(input);

    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

## Test Conventions

1. **Test file naming**: `*.test.ts` or `*.test.tsx`
2. **Describe blocks**: Group related tests
3. **Test names**: Should be descriptive sentences
4. **AAA pattern**: Arrange, Act, Assert
5. **Isolation**: Each test should be independent
6. **Cleanup**: Use beforeAll/afterAll for setup/teardown

## Next Steps

### Planned Test Additions
- [ ] API route integration tests
- [ ] Date utility function tests
- [ ] Component unit tests (React Testing Library)
- [ ] E2E tests for critical workflows (Playwright/Cypress)
- [ ] Performance benchmarks

### To Add Coverage For
- Date handling across timezones
- Leap year edge cases
- Month boundary conditions
- Status transition rules
- Payment calculation logic
- Customer name formatting

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [React Testing Library](https://testing-library.com/react)
- [QA Checklist](./manual-checklist.md)

---

**Last Updated**: 2025-11-10
**Test Framework**: Jest + ts-jest
**Coverage Tool**: Istanbul/nyc
