"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function TestCalendarClean() {
  const events = [
    {
      id: '1',
      title: "Nov 4-22 (19 days)",
      start: "2025-11-04",
      end: "2025-11-23",
      color: "#0ea5e9",
    },
    {
      id: '2',
      title: "Nov 6-11 (6 days)",
      start: "2025-11-06",
      end: "2025-11-12",
      color: "#f43f5e",
    },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ marginBottom: "20px", color: "black" }}>
        Clean Test - No Custom CSS
      </h1>
      <div style={{ height: "600px", background: "white" }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate="2025-11-01"
          events={events}
          height="100%"
        />
      </div>
      <style jsx global>{`
        /* Reset any global CSS that might interfere */
        .fc * {
          box-sizing: border-box !important;
        }
      `}</style>
    </div>
  );
}
