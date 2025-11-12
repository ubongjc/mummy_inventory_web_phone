import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function exportData() {
  console.log("📦 Exporting current database data...\n");

  try {
    // Fetch all data
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "asc" },
    });
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "asc" },
    });
    const bookings = await prisma.booking.findMany({
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "asc" },
    });
    const settings = await prisma.settings.findMany();

    const data = {
      items,
      customers,
      bookings,
      settings,
    };

    // Write to file
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const outputPath = path.join(__dirname, "exported-data.json");
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log("✅ Data exported successfully!");
    console.log(`📍 Location: ${outputPath}\n`);
    console.log("Summary:");
    console.log(`- ${items.length} items`);
    console.log(`- ${customers.length} customers`);
    console.log(`- ${bookings.length} bookings`);
    console.log(`- ${settings.length} settings records`);
  } catch (error) {
    console.error("❌ Export failed:");
    console.error(error);
    process.exit(1);
  }
}

exportData()
  .finally(async () => {
    await prisma.$disconnect();
  });
