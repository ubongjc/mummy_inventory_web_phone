import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional, remove if you want to preserve data)
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.item.deleteMany();

  console.log("✅ Cleared existing data");

  // Create items
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: "Table 6ft",
        unit: "pcs",
        totalQuantity: 10,
      },
    }),
    prisma.item.create({
      data: {
        name: "Chair (white)",
        unit: "pcs",
        totalQuantity: 100,
      },
    }),
    prisma.item.create({
      data: {
        name: "Canopy 10x10",
        unit: "pcs",
        totalQuantity: 5,
      },
    }),
    prisma.item.create({
      data: {
        name: "Plate",
        unit: "pcs",
        totalQuantity: 200,
      },
    }),
    prisma.item.create({
      data: {
        name: "Fork",
        unit: "pcs",
        totalQuantity: 200,
      },
    }),
    prisma.item.create({
      data: {
        name: "Spoon",
        unit: "pcs",
        totalQuantity: 200,
      },
    }),
    prisma.item.create({
      data: {
        name: "Tablecloth (white)",
        unit: "pcs",
        totalQuantity: 15,
      },
    }),
    prisma.item.create({
      data: {
        name: "Cooler (large)",
        unit: "pcs",
        totalQuantity: 8,
      },
    }),
  ]);

  console.log(`✅ Created ${items.length} items`);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Jane Doe",
        phone: "555-1234",
        email: "jane@example.com",
        notes: "Preferred customer, always on time",
      },
    }),
    prisma.customer.create({
      data: {
        name: "John Smith",
        phone: "555-5678",
        email: "john@example.com",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Alice Johnson",
        phone: "555-9012",
        email: "alice@example.com",
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create sample bookings
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setDate(nextWeek.getDate() + 3);

  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  const lastWeekEnd = new Date(lastWeek);
  lastWeekEnd.setDate(lastWeek.getDate() + 2);

  // Helper to create UTC midnight dates
  const toUTC = (date: Date) => {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  };

  // Rental 1: Starting today
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customers[0].id,
      startDate: toUTC(today),
      endDate: toUTC(tomorrow),
      status: "CONFIRMED",
      reference: "RNT-001",
      notes: "Birthday party setup",
      items: {
        create: [
          { itemId: items[0].id, quantity: 4 }, // Tables
          { itemId: items[1].id, quantity: 20 }, // Chairs
          { itemId: items[3].id, quantity: 25 }, // Plates
          { itemId: items[6].id, quantity: 4 }, // Tablecloths
        ],
      },
    },
  });

  // Rental 2: Next week
  const booking2 = await prisma.booking.create({
    data: {
      customerId: customers[1].id,
      startDate: toUTC(nextWeek),
      endDate: toUTC(nextWeekEnd),
      status: "CONFIRMED",
      reference: "RNT-002",
      notes: "Corporate event",
      items: {
        create: [
          { itemId: items[0].id, quantity: 6 }, // Tables
          { itemId: items[1].id, quantity: 40 }, // Chairs
          { itemId: items[2].id, quantity: 2 }, // Canopies
          { itemId: items[7].id, quantity: 3 }, // Coolers
        ],
      },
    },
  });

  // Rental 3: Last week (already out)
  const booking3 = await prisma.booking.create({
    data: {
      customerId: customers[2].id,
      startDate: toUTC(lastWeek),
      endDate: toUTC(lastWeekEnd),
      status: "OUT",
      reference: "RNT-003",
      notes: "Wedding reception",
      items: {
        create: [
          { itemId: items[0].id, quantity: 8 }, // Tables
          { itemId: items[1].id, quantity: 50 }, // Chairs
          { itemId: items[3].id, quantity: 75 }, // Plates
          { itemId: items[4].id, quantity: 75 }, // Forks
          { itemId: items[5].id, quantity: 75 }, // Spoons
        ],
      },
    },
  });

  console.log(`✅ Created 3 sample bookings`);
  console.log("\n🎉 Seed completed successfully!\n");
  console.log("Sample data:");
  console.log(`- ${items.length} inventory items`);
  console.log(`- ${customers.length} customers`);
  console.log(`- 3 rentals (1 today, 1 next week, 1 in progress)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
