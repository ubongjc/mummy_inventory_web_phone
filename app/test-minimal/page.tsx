"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function TestMinimal() {
  return (
    <div style={{ padding: "20px", height: "100vh", background: "white" }}>
      <h1 style={{ color: "black" }}>ABSOLUTE MINIMUM TEST</h1>
      <div style={{ height: "600px" }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate="2025-11-01"
          events={[
            {
              title: "Event 1 - Nov 4-22",
              start: "2025-11-04",
              end: "2025-11-23",
            },
            {
              title: "Event 2 - Nov 6-11",
              start: "2025-11-06",
              end: "2025-11-12",
            },
          ]}
        />
      </div>
    </div>
  );
}
