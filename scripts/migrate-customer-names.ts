import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCustomerNames() {
  try {
    // Get all customers
    const customers = await prisma.customer.findMany();

    console.log(`Found ${customers.length} customers to migrate`);

    for (const customer of customers) {
      // Only migrate if firstName is not already set
      if (!customer.firstName) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            firstName: customer.name,
            lastName: ''
          }
        });
        console.log(`Migrated: ${customer.name}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCustomerNames();