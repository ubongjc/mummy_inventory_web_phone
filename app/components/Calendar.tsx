'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState, useRef } from 'react';
import { textColorFor } from '@/app/lib/contrast';

interface CalendarProps {
  onDateClick: (date: Date) => void;
  selectedItemIds: string[];
  onDateRangeChange?: (start: string, end: string) => void;
}

export default function Calendar({
  onDateClick,
  selectedItemIds,
  onDateRangeChange,
}: CalendarProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef('');
  const calendarRef = useRef<any>(null);
  const hasLoadedOnce = useRef(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchEvents = async (start: Date, end: Date) => {
    const fetchKey = `${start.toISOString()}-${end.toISOString()}-${selectedItemIds.join(',')}`;

    // Prevent duplicate/concurrent fetches
    if (isFetchingRef.current || lastFetchRef.current === fetchKey) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = fetchKey;
    try {
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      // Notify parent about date range change
      if (onDateRangeChange) {
        onDateRangeChange(startStr, endStr);
      }

      const response = await fetch(`/api/bookings?start=${startStr}&end=${endStr}`);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      let data = await response.json();

      // Filter events by selected items
      // If no items selected, show empty calendar
      if (selectedItemIds.length === 0) {
        data = [];
      } else {
        data = data.filter((event: any) => {
          // Check if the booking has any of the selected items
          return (
            event.bookingItemIds &&
            event.bookingItemIds.some((itemId: string) => selectedItemIds.includes(itemId))
          );
        });
      }

      console.log('[Calendar Component] Received events:', data);
      if (data.length > 0) {
        console.log('[Calendar Component] Event date details:');
        data.forEach((event: any) => {
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          const daysDiff = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          console.log(
            `  - "${event.title.substring(0, 30)}...": ${event.start} to ${event.end} (${daysDiff} days) [allDay=${event.allDay}]`
          );
        });
      }

      // Apply appropriate text color based on background
      const eventsWithTextColor = data.map((event: any) => ({
        ...event,
        textColor: textColorFor(event.backgroundColor || '#3b82f6'),
      }));

      setEvents(eventsWithTextColor);
      hasLoadedOnce.current = true;
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      if (initialLoading) {
        setInitialLoading(false);
      }
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // Fetch events for the currently displayed date range when selectedItemIds changes
    if (hasLoadedOnce.current && calendarRef.current) {
      // If calendar has loaded, refetch for the currently visible date range
      const calendarApi = calendarRef.current.getApi();
      const currentView = calendarApi.view;
      fetchEvents(currentView.activeStart, currentView.activeEnd);
    } else {
      // On initial mount, fetch for the current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fetchEvents(start, end);
    }
  }, [selectedItemIds]);

  return (
    <div
      className="calendar-root h-full bg-white rounded-2xl shadow-2xl p-4 md:p-6 md:pr-8 border border-gray-200"
      role="region"
      aria-label="Rental booking calendar"
    >
      {initialLoading ? (
        <div
          className="flex items-center justify-center h-full"
          role="status"
          aria-live="polite"
          aria-label="Loading calendar data"
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
              aria-hidden="true"
            ></div>
            <div className="text-black text-lg font-bold">Loading calendar...</div>
          </div>
        </div>
      ) : (
        <div className="h-full">
          {/* Screen reader announcement for calendar updates */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {events.length} booking{events.length !== 1 ? 's' : ''} displayed on calendar
          </div>

          <FullCalendar
            ref={calendarRef}
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

              // Find which day cell was clicked by looking at the clicked element's parent
              const target = info.jsEvent.target as HTMLElement;
              const dayCell = target.closest('.fc-daygrid-day');

              if (dayCell) {
                // Get the date from the day cell's data attribute
                const dateStr = dayCell.getAttribute('data-date');
                if (dateStr) {
                  // Parse the date string (YYYY-MM-DD) and create a date for that day
                  const [year, month, day] = dateStr.split('-').map(Number);
                  const clickedDate = new Date(year, month - 1, day);
                  onDateClick(clickedDate);
                  return;
                }
              }

              // Fallback to event start date if we can't determine the clicked day
              const eventDate = new Date(info.event.start!);
              onDateClick(eventDate);
            }}
            moreLinkClick={(info) => {
              // When "+X more" link is clicked, open the day drawer for that date
              onDateClick(info.date);
              return 'popover'; // Can also return "week", "day", or custom function
            }}
            eventDidMount={(info) => {
              // Add accessibility attributes to event elements
              const eventEl = info.el;
              eventEl.setAttribute('role', 'button');
              eventEl.setAttribute('tabindex', '0');

              // Format accessible label for the event
              const startDate = info.event.start
                ? new Date(info.event.start).toLocaleDateString()
                : '';
              const endDate = info.event.end ? new Date(info.event.end).toLocaleDateString() : '';
              const ariaLabel = `${info.event.title}. From ${startDate}${endDate ? ` to ${endDate}` : ''}. Press Enter or Space to view details.`;
              eventEl.setAttribute('aria-label', ariaLabel);

              // Add keyboard support for events
              eventEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const eventDate = new Date(info.event.start!);
                  onDateClick(eventDate);
                }
              });

              // Debug: Log when events are mounted
              console.log('[FullCalendar eventDidMount]', {
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                allDay: info.event.allDay,
                display: info.event.display,
                element: info.el,
                isStart: info.isStart,
                isEnd: info.isEnd,
              });
            }}
            datesSet={(dateInfo) => {
              // Refetch events when the view changes (month/week/day navigation)
              fetchEvents(dateInfo.start, dateInfo.end);

              // Add ARIA labels to calendar navigation buttons after render
              setTimeout(() => {
                const calendar = calendarRef.current;
                if (calendar) {
                  const calendarApi = calendar.getApi();
                  const calendarEl = calendarApi.el;

                  // Add labels to navigation buttons
                  const prevButton = calendarEl.querySelector('.fc-prev-button') as HTMLElement;
                  const nextButton = calendarEl.querySelector('.fc-next-button') as HTMLElement;
                  const todayButton = calendarEl.querySelector('.fc-today-button') as HTMLElement;
                  const monthButton = calendarEl.querySelector(
                    '.fc-dayGridMonth-button'
                  ) as HTMLElement;
                  const weekButton = calendarEl.querySelector(
                    '.fc-dayGridWeek-button'
                  ) as HTMLElement;
                  const dayButton = calendarEl.querySelector(
                    '.fc-dayGridDay-button'
                  ) as HTMLElement;

                  if (prevButton) {
                    prevButton.setAttribute('aria-label', 'Previous period');
                  }
                  if (nextButton) {
                    nextButton.setAttribute('aria-label', 'Next period');
                  }
                  if (todayButton) {
                    todayButton.setAttribute('aria-label', 'Go to today');
                  }
                  if (monthButton) {
                    monthButton.setAttribute('aria-label', 'Switch to month view');
                  }
                  if (weekButton) {
                    weekButton.setAttribute('aria-label', 'Switch to week view');
                  }
                  if (dayButton) {
                    dayButton.setAttribute('aria-label', 'Switch to day view');
                  }

                  // Add label to calendar title
                  const titleEl = calendarEl.querySelector('.fc-toolbar-title') as HTMLElement;
                  if (titleEl) {
                    titleEl.setAttribute('aria-live', 'polite');
                    titleEl.setAttribute('aria-atomic', 'true');
                  }

                  // Add labels to day cells
                  const dayCells = calendarEl.querySelectorAll('.fc-daygrid-day');
                  dayCells.forEach((cell: Element) => {
                    const htmlCell = cell as HTMLElement;
                    const dateAttr = htmlCell.getAttribute('data-date');
                    if (dateAttr) {
                      const date = new Date(dateAttr);
                      const formattedDate = date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                      htmlCell.setAttribute(
                        'aria-label',
                        `${formattedDate}. Click to create booking.`
                      );
                    }
                  });
                }
              }, 100);
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay',
            }}
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week',
              day: 'Day',
            }}
            titleFormat={{
              year: 'numeric',
              month: 'long',
            }}
            // Mobile-optimized settings
            views={{
              dayGridMonth: {
                buttonText: 'Month',
              },
              dayGridWeek: {
                buttonText: 'Week',
              },
              dayGridDay: {
                buttonText: 'Day',
              },
            }}
            // Better mobile experience
            windowResize={(arg) => {
              // Keep current view on resize
            }}
            height="100%"
            // Touch optimization
            longPressDelay={500}
            selectLongPressDelay={500}
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
