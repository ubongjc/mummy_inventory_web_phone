"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useEffect, useState } from "react";

export default function TestCalendar() {
  // Hardcode events directly - no API fetch
  const events = [
    {
      title: "Test Booking - Should span 19 days",
      start: "2025-11-04",
      end: "2025-11-23", // Exclusive, so actually Nov 4-22
      backgroundColor: "#0ea5e9",
      borderColor: "#0ea5e9",
    },
    {
      title: "Test Booking 2 - Should span 6 days",
      start: "2025-11-06",
      end: "2025-11-12", // Exclusive, so actually Nov 6-11
      backgroundColor: "#f43f5e",
      borderColor: "#f43f5e",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Test Calendar - Multi-Day Events</h1>
      <div className="bg-white rounded-lg p-4" style={{ height: "600px" }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate="2025-11-01"
          events={events}
          height="100%"
        />
      </div>
      <div className="mt-4 bg-gray-100 p-4 rounded text-black">
        <h2 className="font-bold mb-2">Expected Results:</h2>
        <ul className="list-disc list-inside text-sm">
          <li>Cyan bar should span from Nov 4 to Nov 22 (19 days)</li>
          <li>Rose bar should span from Nov 6 to Nov 11 (6 days)</li>
        </ul>
        <div className="mt-4">
          <h3 className="font-bold">Event Data:</h3>
          <pre className="text-xs overflow-auto">{JSON.stringify(events, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
