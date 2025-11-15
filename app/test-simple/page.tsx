"use client";

import CalendarSimple from "../components/CalendarSimple";

export default function TestSimple() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">SIMPLE TEST - Minimal FullCalendar</h1>
      <p className="mb-4 text-gray-700">
        This uses the absolute MINIMUM FullCalendar config with hardcoded events.
        <br />
        If this doesn&apos;t work, the issue is with the FullCalendar package itself.
      </p>
      <div style={{ height: "600px" }}>
        <CalendarSimple onDateClick={(date) => console.log("Clicked:", date)} />
      </div>
    </div>
  );
}
