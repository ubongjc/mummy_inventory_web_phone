import { NextResponse } from "next/server";

export async function GET() {
  // Test event that should span from Nov 4 to Nov 22
  const testEvents = [
    {
      id: "test-1",
      title: "Test Rental - Should span 19 days",
      start: "2025-11-04",
      end: "2025-11-23", // Exclusive, so actually Nov 4-22
      allDay: true,
      display: 'block',
      backgroundColor: "#0ea5e9",
      borderColor: "#0ea5e9",
    },
    {
      id: "test-2",
      title: "Test Rental 2 - Should span 6 days",
      start: "2025-11-06",
      end: "2025-11-12", // Exclusive, so actually Nov 6-11
      allDay: true,
      display: 'block',
      backgroundColor: "#f43f5e",
      borderColor: "#f43f5e",
    },
  ];

  console.log("Test events:", JSON.stringify(testEvents, null, 2));
  return NextResponse.json(testEvents);
}
