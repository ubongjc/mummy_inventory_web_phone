"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface CalendarVanillaProps {
  onDateClick: (date: Date) => void;
}

export default function CalendarVanilla({ onDateClick }: CalendarVanillaProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarInstanceRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (start: Date, end: Date) => {
    try {
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];

      const response = await fetch(
        `/api/bookings?start=${startStr}&end=${endStr}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      console.log('[CalendarVanilla] Received events:', data);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch events for the current month on mount
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    fetchEvents(start, end);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !calendarRef.current || loading) {
      return;
    }

    // @ts-expect-error - FullCalendar loaded via CDN
    if (typeof FullCalendar === 'undefined') {
      console.error('FullCalendar not loaded');
      return;
    }

    // @ts-expect-error - FullCalendar loaded via CDN
    const calendar = new FullCalendar.Calendar(calendarRef.current, {
      initialView: 'dayGridMonth',
      events: events,
      allDayDefault: true,
      editable: false,
      dateClick: (info: any) => {
        const target = info.jsEvent.target as HTMLElement;
        if (!target.closest('.fc-event')) {
          onDateClick(info.date);
        }
      },
      eventClick: (info: any) => {
        info.jsEvent.stopPropagation();
        info.jsEvent.preventDefault();
        const eventDate = new Date(info.event.start!);
        onDateClick(eventDate);
      },
      datesSet: (dateInfo: any) => {
        fetchEvents(dateInfo.start, dateInfo.end);
      },
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridWeek,dayGridDay",
      },
      height: "100%",
      eventDisplay: "block",
      displayEventTime: false,
      dayMaxEvents: false,
      nowIndicator: true,
      nextDayThreshold: "00:00:00",
      eventOrder: "start,-duration,title",
      fixedWeekCount: false,
    });

    calendar.render();
    calendarInstanceRef.current = calendar;

    return () => {
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.destroy();
      }
    };
  }, [scriptLoaded, events, loading, onDateClick]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.19/index.global.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('FullCalendar script loaded');
          setScriptLoaded(true);
        }}
      />
      <div className="h-full bg-white rounded-2xl shadow-2xl p-6 overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-black text-lg font-bold">Loading calendar...</div>
            </div>
          </div>
        ) : (
          <div ref={calendarRef} className="h-full"></div>
        )}
      </div>
    </>
  );
}
