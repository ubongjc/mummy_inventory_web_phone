import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.item.deleteMany();

  // Create test items
  const tables = await prisma.item.create({
    data: {
      name: 'Tables',
      unit: 'pcs',
      totalQuantity: 10,
      price: 50,
    },
  });

  const chairs = await prisma.item.create({
    data: {
      name: 'Chairs',
      unit: 'pcs',
      totalQuantity: 100,
      price: 5,
    },
  });

  const canopy = await prisma.item.create({
    data: {
      name: 'Canopy',
      unit: 'pcs',
      totalQuantity: 5,
      price: 100,
    },
  });

  const plates = await prisma.item.create({
    data: {
      name: 'Plates',
      unit: 'pcs',
      totalQuantity: 200,
      price: 2,
    },
  });

  const forks = await prisma.item.create({
    data: {
      name: 'Forks',
      unit: 'pcs',
      totalQuantity: 200,
      price: 1,
    },
  });

  const spoons = await prisma.item.create({
    data: {
      name: 'Spoons',
      unit: 'pcs',
      totalQuantity: 200,
      price: 1,
    },
  });

  console.log('✅ Created 6 test items');

  // Create test customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567890',
      email: 'john@example.com',
      address: '123 Main St, City',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+0987654321',
      email: 'jane@example.com',
      address: '456 Oak Ave, Town',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Bob Johnson',
      firstName: 'Bob',
      lastName: 'Johnson',
      phone: '+1122334455',
      email: 'bob@example.com',
      address: '789 Pine Rd, Village',
    },
  });

  console.log('✅ Created 3 test customers');

  // Create test bookings with overlaps
  const nov4 = new Date(Date.UTC(2025, 10, 4, 0, 0, 0)); // Nov 4
  const nov8 = new Date(Date.UTC(2025, 10, 8, 0, 0, 0)); // Nov 8
  const nov6 = new Date(Date.UTC(2025, 10, 6, 0, 0, 0)); // Nov 6
  const nov11 = new Date(Date.UTC(2025, 10, 11, 0, 0, 0)); // Nov 11
  const nov9 = new Date(Date.UTC(2025, 10, 9, 0, 0, 0)); // Nov 9
  const nov29 = new Date(Date.UTC(2025, 10, 29, 0, 0, 0)); // Nov 29
  const nov15 = new Date(Date.UTC(2025, 10, 15, 0, 0, 0)); // Nov 15
  const nov3 = new Date(Date.UTC(2025, 10, 3, 0, 0, 0)); // Nov 3

  // Rental A: Chairs x40 (Nov 4-8, CONFIRMED)
  const bookingA = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      startDate: nov4,
      endDate: nov8,
      status: 'CONFIRMED',
      color: '#3b82f6',
      totalPrice: 200,
      advancePayment: 100,
      items: {
        create: [
          {
            itemId: chairs.id,
            quantity: 40,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 100,
            paymentDate: nov3,
            notes: 'Advance payment',
          },
        ],
      },
    },
  });

  // Rental B: Chairs x70 (Nov 6-11, CONFIRMED) - triggers overlap
  const bookingB = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      startDate: nov6,
      endDate: nov11,
      status: 'CONFIRMED',
      color: '#ef4444',
      totalPrice: 350,
      items: {
        create: [
          {
            itemId: chairs.id,
            quantity: 70,
          },
        ],
      },
    },
  });

  // Rental C: Tables x5, Plates x50 (Nov 9-29, OUT)
  const bookingC = await prisma.booking.create({
    data: {
      customerId: customer3.id,
      startDate: nov9,
      endDate: nov29,
      status: 'OUT',
      color: '#10b981',
      totalPrice: 350,
      advancePayment: 50,
      paymentDueDate: nov29,
      items: {
        create: [
          {
            itemId: tables.id,
            quantity: 5,
          },
          {
            itemId: plates.id,
            quantity: 50,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 50,
            paymentDate: new Date(Date.UTC(2025, 10, 8, 0, 0, 0)),
            notes: 'Advance payment',
          },
          {
            amount: 100,
            paymentDate: new Date(Date.UTC(2025, 10, 15, 0, 0, 0)),
            notes: 'Additional payment',
          },
        ],
      },
    },
  });

  // Rental D: Canopy x1 (Nov 15, RETURNED)
  const bookingD = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      startDate: nov15,
      endDate: nov15,
      status: 'RETURNED',
      color: '#8b5cf6',
      totalPrice: 100,
      items: {
        create: [
          {
            itemId: canopy.id,
            quantity: 1,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 100,
            paymentDate: nov15,
            notes: 'Full payment',
          },
        ],
      },
    },
  });

  // Rental E: Forks x100, Spoons x100 (Nov 4-8, CONFIRMED)
  const bookingE = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      startDate: nov4,
      endDate: nov8,
      status: 'CONFIRMED',
      color: '#f59e0b',
      totalPrice: 200,
      items: {
        create: [
          {
            itemId: forks.id,
            quantity: 100,
          },
          {
            itemId: spoons.id,
            quantity: 100,
          },
        ],
      },
    },
  });

  // Rental F: Tables x3 (Nov 15-20, CANCELLED)
  const bookingF = await prisma.booking.create({
    data: {
      customerId: customer3.id,
      startDate: nov15,
      endDate: new Date(Date.UTC(2025, 10, 20, 0, 0, 0)),
      status: 'CANCELLED',
      color: '#6b7280',
      totalPrice: 150,
      notes: 'Customer cancelled due to weather',
      items: {
        create: [
          {
            itemId: tables.id,
            quantity: 3,
          },
        ],
      },
    },
  });

  console.log('✅ Created 6 test bookings with overlaps and various statuses');
  console.log('');
  console.log('📊 Test Data Summary:');
  console.log('   - Rental A: Chairs x40 (Nov 4-8, CONFIRMED) with payment');
  console.log('   - Rental B: Chairs x70 (Nov 6-11, CONFIRMED) - OVERLAPS with A');
  console.log('   - Rental C: Tables x5, Plates x50 (Nov 9-29, OUT) with 2 payments');
  console.log('   - Rental D: Canopy x1 (Nov 15, RETURNED) - single day');
  console.log('   - Rental E: Forks x100, Spoons x100 (Nov 4-8, CONFIRMED)');
  console.log('   - Rental F: Tables x3 (Nov 15-20, CANCELLED)');
  console.log('');
  console.log('🔥 Overlap scenario:');
  console.log('   - Nov 6-8: Both Rental A (40 chairs) and Rental B (70 chairs) active');
  console.log('   - Total needed: 110 chairs, Available: 100 chairs → Conflict!');
  console.log('');
  console.log('✅ Test data seeding complete!');
}

seedTestData()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
