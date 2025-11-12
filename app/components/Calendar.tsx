"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState, useRef } from "react";
import { textColorFor } from "@/app/lib/contrast";

interface CalendarProps {
  onDateClick: (date: Date) => void;
  selectedItemIds: string[];
  onDateRangeChange?: (start: string, end: string) => void;
}

export default function Calendar({ onDateClick, selectedItemIds, onDateRangeChange }: CalendarProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef("");

  const fetchEvents = async (start: Date, end: Date) => {
    const fetchKey = `${start.toISOString()}-${end.toISOString()}-${selectedItemIds.join(',')}`;

    // Prevent duplicate/concurrent fetches
    if (isFetchingRef.current || lastFetchRef.current === fetchKey) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = fetchKey;
    try {
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];

      // Notify parent about date range change
      if (onDateRangeChange) {
        onDateRangeChange(startStr, endStr);
      }

      const response = await fetch(
        `/api/rentals?start=${startStr}&end=${endStr}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      let data = await response.json();

      // Filter events by selected items
      // If no items selected, show empty calendar
      if (selectedItemIds.length === 0) {
        data = [];
      } else {
        data = data.filter((event: any) => {
          // Check if the rental has any of the selected items
          return event.rentalItemIds && event.rentalItemIds.some((itemId: string) =>
            selectedItemIds.includes(itemId)
          );
        });
      }

      console.log('[Calendar Component] Received events:', data);
      if (data.length > 0) {
        console.log('[Calendar Component] Event date details:');
        data.forEach((event: any) => {
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`  - "${event.title.substring(0, 30)}...": ${event.start} to ${event.end} (${daysDiff} days) [allDay=${event.allDay}]`);
        });
      }

      // Apply appropriate text color based on background
      const eventsWithTextColor = data.map((event: any) => ({
        ...event,
        textColor: textColorFor(event.backgroundColor || "#3b82f6"),
      }));

      setEvents(eventsWithTextColor);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // Fetch events for the current month on mount and when selectedItemIds changes
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    fetchEvents(start, end);
  }, [selectedItemIds]);

  return (
    <div className="h-full bg-white rounded-2xl shadow-2xl p-4 md:p-6 md:pr-8 border border-gray-200">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-black text-lg font-bold">Loading calendar...</div>
          </div>
        </div>
      ) : (
        <div className="h-full">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            editable={false}
            eventStartEditable={false}
            eventResizableFromStart={false}
            eventDurationEditable={false}
            dayMaxEvents={5}
            dateClick={(info) => {
              // Only trigger if clicking directly on the day cell, not on an event
              const target = info.jsEvent.target as HTMLElement;
              if (!target.closest('.fc-event')) {
                onDateClick(info.date);
              }
            }}
            eventClick={(info) => {
              // Stop propagation to prevent dateClick from firing
              info.jsEvent.stopPropagation();
              info.jsEvent.preventDefault();
              const eventDate = new Date(info.event.start!);
              onDateClick(eventDate);
            }}
            moreLinkClick={(info) => {
              // When "+X more" link is clicked, open the day drawer for that date
              onDateClick(info.date);
              return "popover"; // Can also return "week", "day", or custom function
            }}
            eventDidMount={(info) => {
              // Debug: Log when events are mounted
              console.log('[FullCalendar eventDidMount]', {
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                allDay: info.event.allDay,
                display: info.event.display,
                element: info.el,
                isStart: info.isStart,
                isEnd: info.isEnd
              });
            }}
            datesSet={(dateInfo) => {
              // Refetch events when the view changes (month/week/day navigation)
              fetchEvents(dateInfo.start, dateInfo.end);
            }}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek,dayGridDay",
            }}
            height="100%"
            displayEventTime={false}
            displayEventEnd={false}
            nowIndicator={true}
            eventOrder="start,-duration,title"
            fixedWeekCount={false}
            weekends={true}
            hiddenDays={[]}
            contentHeight="auto"
          />
        </div>
      )}
    </div>
  );
}
