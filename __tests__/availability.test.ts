/**
 * Availability Engine Tests
 * Tests the core logic for calculating item availability across date ranges
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Availability Engine', () => {
  let chairsId: string;
  let tablesId: string;
  let customer1Id: string;
  let customer2Id: string;

  beforeAll(async () => {
    // Setup test data
    await prisma.payment.deleteMany();
    await prisma.bookingItem.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.item.deleteMany();

    const chairs = await prisma.item.create({
      data: { name: 'Chairs', unit: 'pcs', totalQuantity: 100 },
    });
    chairsId = chairs.id;

    const tables = await prisma.item.create({
      data: { name: 'Tables', unit: 'pcs', totalQuantity: 10 },
    });
    tablesId = tables.id;

    const c1 = await prisma.customer.create({
      data: { name: 'Test Customer 1', firstName: 'Test', lastName: 'Customer 1' },
    });
    customer1Id = c1.id;

    const c2 = await prisma.customer.create({
      data: { name: 'Test Customer 2', firstName: 'Test', lastName: 'Customer 2' },
    });
    customer2Id = c2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Counts only CONFIRMED and OUT rentals', async () => {
    const nov10 = new Date(Date.UTC(2025, 10, 10, 0, 0, 0));
    const nov12 = new Date(Date.UTC(2025, 10, 12, 0, 0, 0));

    // Create rentals with different statuses
    await prisma.booking.create({
      data: {
        customerId: customer1Id,
        startDate: nov10,
        endDate: nov12,
        status: 'CONFIRMED',
        items: { create: [{ itemId: chairsId, quantity: 20 }] },
      },
    });

    await prisma.booking.create({
      data: {
        customerId: customer1Id,
        startDate: nov10,
        endDate: nov12,
        status: 'OUT',
        items: { create: [{ itemId: chairsId, quantity: 30 }] },
      },
    });

    await prisma.booking.create({
      data: {
        customerId: customer1Id,
        startDate: nov10,
        endDate: nov12,
        status: 'CANCELLED',
        items: { create: [{ itemId: chairsId, quantity: 40 }] },
      },
    });

    await prisma.booking.create({
      data: {
        customerId: customer1Id,
        startDate: nov10,
        endDate: nov12,
        status: 'RETURNED',
        items: { create: [{ itemId: chairsId, quantity: 50 }] },
      },
    });

    // Check availability - should only count CONFIRMED (20) + OUT (30) = 50
    const overlapping = await prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lte: nov12 } },
          { endDate: { gte: nov10 } },
          { status: { in: ['CONFIRMED', 'OUT'] } },
        ],
      },
      include: {
        items: {
          where: { itemId: chairsId },
        },
      },
    });

    const reserved = overlapping.reduce(
      (sum, booking) =>
        sum + booking.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    expect(reserved).toBe(50); // 20 + 30, not including CANCELLED(40) or RETURNED(50)
    expect(100 - reserved).toBe(50); // Available = 100 - 50
  });

  test('Single-day booking (start == end) works correctly', async () => {
    const nov15 = new Date(Date.UTC(2025, 10, 15, 0, 0, 0));

    const booking = await prisma.booking.create({
      data: {
        customerId: customer1Id,
        startDate: nov15,
        endDate: nov15, // Same day
        status: 'CONFIRMED',
        items: { create: [{ itemId: tablesId, quantity: 5 }] },
      },
    });

    expect(booking.startDate).toEqual(booking.endDate);

    // Check it counts in availability
    const overlapping = await prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lte: nov15 } },
          { endDate: { gte: nov15 } },
          { status: { in: ['CONFIRMED', 'OUT'] } },
        ],
      },
      include: {
        items: { where: { itemId: tablesId } },
      },
    });

    const reserved = overlapping.reduce(
      (sum, booking) =>
        sum + booking.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    expect(reserved).toBe(5);
  });

  test('Overlapping rentals accumulate correctly', async () => {
    const nov20 = new Date(Date.UTC(2025, 10, 20, 0, 0, 0));
    const nov25 = new Date(Date.UTC(2025, 10, 25, 0, 0, 0));
    const nov22 = new Date(Date.UTC(2025, 10, 22, 0, 0, 0));
    const nov27 = new Date(Date.UTC(2025, 10, 27, 0, 0, 0));

    // Rental 1: Nov 20-25, 40 chairs
    await prisma.booking.create({
      data: {
        customerId: customer1Id,
        startDate: nov20,
        endDate: nov25,
        status: 'CONFIRMED',
        items: { create: [{ itemId: chairsId, quantity: 40 }] },
      },
    });

    // Rental 2: Nov 22-27, 50 chairs (overlaps Nov 22-25)
    await prisma.booking.create({
      data: {
        customerId: customer2Id,
        startDate: nov22,
        endDate: nov27,
        status: 'CONFIRMED',
        items: { create: [{ itemId: chairsId, quantity: 50 }] },
      },
    });

    // Check Nov 23 (middle of overlap)
    const nov23 = new Date(Date.UTC(2025, 10, 23, 0, 0, 0));
    const overlapping = await prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lte: nov23 } },
          { endDate: { gte: nov23 } },
          { status: { in: ['CONFIRMED', 'OUT'] } },
        ],
      },
      include: {
        items: { where: { itemId: chairsId } },
      },
    });

    const reserved = overlapping.reduce(
      (sum, booking) =>
        sum + booking.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    expect(reserved).toBe(90); // 40 + 50 during overlap period
    expect(100 - reserved).toBe(10); // Only 10 chairs available
  });

  test('Editing booking excludes itself from availability check', async () => {
    const nov1 = new Date(Date.UTC(2025, 11, 1, 0, 0, 0));
    const nov5 = new Date(Date.UTC(2025, 11, 5, 0, 0, 0));

    const booking = await prisma.booking.create({
      data: {
        customerId: customer1Id,
        startDate: nov1,
        endDate: nov5,
        status: 'CONFIRMED',
        items: { create: [{ itemId: tablesId, quantity: 8 }] },
      },
    });

    // Check availability excluding this booking
    const overlapping = await prisma.booking.findMany({
      where: {
        AND: [
          { id: { not: booking.id } }, // Exclude self
          { startDate: { lte: nov5 } },
          { endDate: { gte: nov1 } },
          { status: { in: ['CONFIRMED', 'OUT'] } },
        ],
      },
      include: {
        items: { where: { itemId: tablesId } },
      },
    });

    const reserved = overlapping.reduce(
      (sum, booking) =>
        sum + booking.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Should not include the 8 from this booking
    expect(reserved).not.toContain(8);
  });

  test('Date boundary handling (inclusive range)', async () => {
    const dec10 = new Date(Date.UTC(2025, 11, 10, 0, 0, 0));
    const dec15 = new Date(Date.UTC(2025, 11, 15, 0, 0, 0));

    await prisma.booking.create({
      data: {
        customerId: customer1Id,
        startDate: dec10,
        endDate: dec15,
        status: 'CONFIRMED',
        items: { create: [{ itemId: tablesId, quantity: 5 }] },
      },
    });

    // Check Dec 10 (start date) - should be included
    const checkStart = await prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lte: dec10 } },
          { endDate: { gte: dec10 } },
          { status: { in: ['CONFIRMED', 'OUT'] } },
        ],
      },
      include: { items: { where: { itemId: tablesId } } },
    });

    expect(checkStart.length).toBeGreaterThan(0);

    // Check Dec 15 (end date) - should be included
    const checkEnd = await prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lte: dec15 } },
          { endDate: { gte: dec15 } },
          { status: { in: ['CONFIRMED', 'OUT'] } },
        ],
      },
      include: { items: { where: { itemId: tablesId } } },
    });

    expect(checkEnd.length).toBeGreaterThan(0);

    // Check Dec 9 (before start) - should not be included
    const dec9 = new Date(Date.UTC(2025, 11, 9, 0, 0, 0));
    const checkBefore = await prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lte: dec9 } },
          { endDate: { gte: dec9 } },
          { status: { in: ['CONFIRMED', 'OUT'] } },
        ],
      },
      include: { items: { where: { itemId: tablesId } } },
    });

    const reservedBefore = checkBefore.reduce(
      (sum, booking) =>
        sum + booking.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    expect(reservedBefore).not.toBe(5); // Should not include this booking

    // Check Dec 16 (after end) - should not be included
    const dec16 = new Date(Date.UTC(2025, 11, 16, 0, 0, 0));
    const checkAfter = await prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lte: dec16 } },
          { endDate: { gte: dec16 } },
          { status: { in: ['CONFIRMED', 'OUT'] } },
        ],
      },
      include: { items: { where: { itemId: tablesId } } },
    });

    const reservedAfter = checkAfter.reduce(
      (sum, booking) =>
        sum + booking.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    expect(reservedAfter).not.toBe(5); // Should not include this booking
  });
});
