"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, X } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  label,
  required = false,
  minDate,
  maxDate,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the date value or use current date
  useEffect(() => {
    if (value) {
      const parsedDate = new Date(value + "T00:00:00");
      if (!isNaN(parsedDate.getTime())) {
        setCurrentMonth(parsedDate);
      }
    } else {
      setCurrentMonth(new Date());
    }
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) {
      return "";
    }
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) {
      return "";
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selectedDate = new Date(year, month, day);

    // Format as YYYY-MM-DD
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Check if date is within min/max range
    if (minDate && dateString < minDate) {
      return;
    }
    if (maxDate && dateString > maxDate) {
      return;
    }

    onChange(dateString);
    setIsOpen(false); // Close immediately after selection
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (minDate && dateString < minDate) {
      return true;
    }
    if (maxDate && dateString > maxDate) {
      return true;
    }
    return false;
  };

  const isSelectedDate = (day: number) => {
    if (!value) {
      return false;
    }
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateString === value;
  };

  const isToday = (day: number) => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold mb-1 text-black">
          {label} {required && "*"}
        </label>
      )}

      {/* Input Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium text-sm cursor-pointer bg-white flex items-center justify-between"
      >
        <span className={value ? "text-black text-sm" : "text-gray-400 text-sm"}>
          {value ? formatDisplayDate(value) : "Select date"}
        </span>
        <Calendar className="w-4 h-4 text-gray-600" />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsOpen(false)} />
          {/* Calendar Modal - centered on screen */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-gray-400 rounded-lg shadow-xl z-50 w-[90vw] max-w-[320px]">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <span className="text-lg font-bold">←</span>
            </button>
            <span className="font-bold text-black">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <span className="text-lg font-bold">→</span>
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 p-2 text-center text-xs font-bold text-gray-600">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const disabled = isDateDisabled(day);
              const selected = isSelectedDate(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !disabled && handleDateClick(day)}
                  disabled={disabled}
                  className={`
                    p-2 text-sm font-semibold rounded
                    ${disabled ? "text-gray-300 cursor-not-allowed" : "text-black hover:bg-blue-100 cursor-pointer"}
                    ${selected ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                    ${today && !selected ? "border-2 border-blue-600" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
