import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const customers = [
  { name: "John Smith", firstName: "John", lastName: "Smith", phone: "+1234567890", email: "john.smith@email.com", address: "123 Main Street" },
  { name: "Sarah Johnson", firstName: "Sarah", lastName: "Johnson", phone: "+1234567891", email: "sarah.j@email.com", address: "456 Oak Avenue" },
  { name: "Michael Brown", firstName: "Michael", lastName: "Brown", phone: "+1234567892", email: "mbrown@email.com", address: "789 Pine Road" },
  { name: "Emily Davis", firstName: "Emily", lastName: "Davis", phone: "+1234567893", email: "emily.d@email.com", address: "321 Elm Street" },
  { name: "David Wilson", firstName: "David", lastName: "Wilson", phone: "+1234567894", email: "david.w@email.com", address: "654 Maple Drive" },
  { name: "Jessica Martinez", firstName: "Jessica", lastName: "Martinez", phone: "+1234567895", email: "jess.m@email.com", address: "987 Cedar Lane" },
  { name: "James Anderson", firstName: "James", lastName: "Anderson", phone: "+1234567896", email: "james.a@email.com", address: "147 Birch Court" },
  { name: "Lisa Taylor", firstName: "Lisa", lastName: "Taylor", phone: "+1234567897", email: "lisa.t@email.com", address: "258 Spruce Way" },
  { name: "Robert Thomas", firstName: "Robert", lastName: "Thomas", phone: "+1234567898", email: "robert.t@email.com", address: "369 Willow Path" },
  { name: "Amanda Moore", firstName: "Amanda", lastName: "Moore", phone: "+1234567899", email: "amanda.m@email.com", address: "741 Ash Boulevard" }
];

const items = [
  { name: "Folding Chair", unit: "piece", totalQuantity: 100, price: 5.00 },
  { name: "Round Table", unit: "piece", totalQuantity: 20, price: 25.00 },
  { name: "Rectangular Table", unit: "piece", totalQuantity: 15, price: 30.00 },
  { name: "White Linen", unit: "piece", totalQuantity: 80, price: 8.00 },
  { name: "Black Linen", unit: "piece", totalQuantity: 60, price: 8.00 },
  { name: "Champagne Glass", unit: "piece", totalQuantity: 200, price: 2.00 },
  { name: "Wine Glass", unit: "piece", totalQuantity: 200, price: 2.00 },
  { name: "Dinner Plate", unit: "piece", totalQuantity: 150, price: 1.50 },
  { name: "Salad Plate", unit: "piece", totalQuantity: 150, price: 1.00 },
  { name: "Fork", unit: "piece", totalQuantity: 300, price: 0.50 },
  { name: "Knife", unit: "piece", totalQuantity: 300, price: 0.50 },
  { name: "Spoon", unit: "piece", totalQuantity: 300, price: 0.50 },
  { name: "Napkin", unit: "piece", totalQuantity: 500, price: 0.25 },
  { name: "Centerpiece", unit: "piece", totalQuantity: 30, price: 15.00 },
  { name: "Vase", unit: "piece", totalQuantity: 40, price: 10.00 },
  { name: "Candelabra", unit: "piece", totalQuantity: 25, price: 20.00 },
  { name: "Podium", unit: "piece", totalQuantity: 5, price: 50.00 },
  { name: "Microphone", unit: "piece", totalQuantity: 10, price: 30.00 },
  { name: "Speaker System", unit: "set", totalQuantity: 8, price: 100.00 },
  { name: "LED Uplighting", unit: "piece", totalQuantity: 40, price: 15.00 },
  { name: "String Lights", unit: "set", totalQuantity: 20, price: 25.00 },
  { name: "Dance Floor Panel", unit: "panel", totalQuantity: 50, price: 10.00 },
  { name: "Red Carpet", unit: "piece", totalQuantity: 10, price: 35.00 },
  { name: "Backdrop Stand", unit: "piece", totalQuantity: 8, price: 40.00 },
  { name: "Photo Booth", unit: "set", totalQuantity: 3, price: 200.00 },
  { name: "Chafing Dish", unit: "piece", totalQuantity: 30, price: 12.00 },
  { name: "Serving Tray", unit: "piece", totalQuantity: 50, price: 5.00 },
  { name: "Punch Bowl", unit: "piece", totalQuantity: 15, price: 20.00 },
  { name: "Coffee Urn", unit: "piece", totalQuantity: 10, price: 25.00 },
  { name: "Bar Table", unit: "piece", totalQuantity: 12, price: 30.00 },
  { name: "Bar Stool", unit: "piece", totalQuantity: 50, price: 8.00 },
  { name: "Cocktail Table", unit: "piece", totalQuantity: 25, price: 15.00 },
  { name: "Lounge Sofa", unit: "piece", totalQuantity: 10, price: 75.00 },
  { name: "Ottoman", unit: "piece", totalQuantity: 20, price: 20.00 },
  { name: "Tent Pole", unit: "piece", totalQuantity: 40, price: 15.00 },
  { name: "Tent Canopy", unit: "piece", totalQuantity: 6, price: 150.00 },
  { name: "Tent Weight", unit: "piece", totalQuantity: 60, price: 5.00 },
  { name: "Heater", unit: "piece", totalQuantity: 15, price: 40.00 },
  { name: "Fan", unit: "piece", totalQuantity: 20, price: 25.00 },
  { name: "Extension Cord", unit: "piece", totalQuantity: 50, price: 5.00 },
  { name: "Power Strip", unit: "piece", totalQuantity: 30, price: 8.00 },
  { name: "Cooler", unit: "piece", totalQuantity: 25, price: 15.00 },
  { name: "Ice Bucket", unit: "piece", totalQuantity: 40, price: 8.00 },
  { name: "Trash Can", unit: "piece", totalQuantity: 30, price: 10.00 },
  { name: "Coat Rack", unit: "piece", totalQuantity: 12, price: 15.00 },
  { name: "Easel", unit: "piece", totalQuantity: 15, price: 12.00 },
  { name: "Welcome Sign", unit: "piece", totalQuantity: 10, price: 20.00 },
  { name: "Rope Stanchion", unit: "piece", totalQuantity: 20, price: 18.00 },
  { name: "Cake Stand", unit: "piece", totalQuantity: 12, price: 15.00 },
  { name: "Gift Table", unit: "piece", totalQuantity: 15, price: 25.00 }
];

export async function POST(request: NextRequest) {
  try {
    const results = {
      customers: 0,
      items: 0,
      bookings: 0,
      errors: [] as string[]
    };

    // Add customers
    for (const customer of customers) {
      try {
        await prisma.customer.create({ data: customer });
        results.customers++;
      } catch (error: any) {
        results.errors.push(`Customer ${customer.firstName}: ${error.message}`);
      }
    }

    // Add items
    for (const item of items) {
      try {
        await prisma.item.create({ data: item });
        results.items++;
      } catch (error: any) {
        results.errors.push(`Item ${item.name}: ${error.message}`);
      }
    }

    // Get all customers and items for bookings
    const allCustomers = await prisma.customer.findMany();
    const allItems = await prisma.item.findMany();

    if (allCustomers.length > 0 && allItems.length > 0) {
      // Create 20 random bookings in November 2025
      for (let i = 0; i < 20; i++) {
        try {
          const startDay = Math.floor(Math.random() * 25) + 1;
          const duration = Math.floor(Math.random() * 5) + 1;
          const endDay = Math.min(startDay + duration, 30);
          const startDate = new Date(`2025-11-${String(startDay).padStart(2, '0')}T00:00:00.000Z`);
          const endDate = new Date(`2025-11-${String(endDay).padStart(2, '0')}T00:00:00.000Z`);

          const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
          const numItems = Math.floor(Math.random() * 4) + 1;
          const selectedItems = [];
          const usedItemIds = new Set<string>();

          for (let j = 0; j < numItems; j++) {
            let item;
            do {
              item = allItems[Math.floor(Math.random() * allItems.length)];
            } while (usedItemIds.has(item.id));

            usedItemIds.add(item.id);
            const maxQty = Math.min(item.totalQuantity, 10);
            const quantity = Math.floor(Math.random() * maxQty) + 1;

            selectedItems.push({
              itemId: item.id,
              quantity: quantity
            });
          }

          const totalPrice = Math.floor(Math.random() * 900) + 100;
          const advancePayment = Math.floor(totalPrice * (Math.random() * 0.8));
          const statuses = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "OUT", "RETURNED"];
          const status = statuses[Math.floor(Math.random() * statuses.length)] as any;

          await prisma.booking.create({
            data: {
              customerId: customer.id,
              startDate,
              endDate,
              totalPrice,
              advancePayment,
              status,
              notes: `Test booking ${i + 1}`,
              items: {
                create: selectedItems
              }
            }
          });

          results.bookings++;
        } catch (error: any) {
          results.errors.push(`Booking ${i + 1}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test data populated successfully!",
      results
    });
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error.message },
      { status: 500 }
    );
  }
}
