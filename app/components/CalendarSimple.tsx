"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

interface CalendarSimpleProps {
  onDateClick: (date: Date) => void;
}

export default function CalendarSimple({ onDateClick }: CalendarSimpleProps) {
  // Hardcoded test events to verify spanning works
  const testEvents = [
    {
      title: "Nov 4-22 Test",
      start: "2025-11-04",
      end: "2025-11-23", // Exclusive - actually ends Nov 22
      color: "#0ea5e9",
    },
    {
      title: "Nov 6-11 Test",
      start: "2025-11-06",
      end: "2025-11-12", // Exclusive - actually ends Nov 11
      color: "#f43f5e",
    },
  ];

  return (
    <div className="h-full bg-white rounded-lg p-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        initialDate="2025-11-01"
        events={testEvents}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        height="100%"
      />
    </div>
  );
}
