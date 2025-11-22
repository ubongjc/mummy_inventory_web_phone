'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';

/**
 * Hook to detect user inactivity and auto-logout after the specified timeout
 * @param timeoutMinutes - Number of minutes of inactivity before auto-logout
 */
export function useInactivityTimeout(timeoutMinutes: number = 5) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set new timer for auto-logout
    timeoutRef.current = setTimeout(() => {
      console.log('[Inactivity] Auto-logging out due to inactivity');
      signOut({ callbackUrl: '/auth/sign-in?message=You have been logged out due to inactivity' });
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Attach event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeoutMinutes]);
}
