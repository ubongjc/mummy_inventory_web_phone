import { PrismaClient } from '@prisma/client';

const RENTAL_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
  '#6366f1', '#ef4444', '#84cc16', '#f97316', '#14b8a6', '#a855f7',
  '#f43f5e', '#22c55e', '#eab308', '#0ea5e9',
];

function getRandomRentalColor(): string {
  return RENTAL_COLORS[Math.floor(Math.random() * RENTAL_COLORS.length)];
}

const prisma = new PrismaClient();

async function main() {
  // Find all rentals without a color
  const bookingsWithoutColor = await prisma.booking.findMany({
    where: {
      color: null,
    },
  });

  console.log(`Found ${bookingsWithoutColor.length} rentals without colors`);

  // Update each booking with a random color
  for (const booking of bookingsWithoutColor) {
    const color = getRandomRentalColor();
    await prisma.booking.update({
      where: { id: booking.id },
      data: { color },
    });
    console.log(`Updated booking ${booking.id} with color ${color}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
