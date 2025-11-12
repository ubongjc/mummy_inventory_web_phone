# FullCalendar Multi-Day Event Debug

## Current Setup
- **FullCalendar Version**: 6.1.10
- **View**: dayGridMonth
- **Event Format**:
```json
{
  "id": "test-1",
  "title": "Test Rental",
  "start": "2025-11-04",
  "end": "2025-11-23",
  "allDay": true,
  "display": "block",
  "backgroundColor": "#0ea5e9",
  "borderColor": "#0ea5e9"
}
```

## Expected Behavior
Event should span from Nov 4 to Nov 22 (end is exclusive, so 2025-11-23 means through Nov 22)

## Actual Behavior (as reported by user)
- Events appear only on start date
- Events appear on first day of week

## Debugging Steps

### 1. Check Browser Console
Open browser dev tools (F12) and look for:
- `[Calendar Component] All event colors` log
- Any JavaScript errors
- Network tab: verify `/api/rentals` returns correct data

### 2. Inspect Event Element
Right-click on an event in the calendar and "Inspect Element". Check:
- Does the element have class `fc-event`?
- Does it have inline styles for width or positioning?
- What is the parent element structure?

### 3. Test Pages
- `/test-calendar` - Minimal setup with hardcoded events
- `/test-calendar-clean` - Zero custom CSS

### 4. Known FullCalendar v6 Requirements
According to docs, multi-day events need:
- `start` and `end` dates in ISO format (YYYY-MM-DD) ✅
- `end` is EXCLUSIVE (so add 1 day) ✅
- For all-day events spanning multiple days, NO time component ✅

## Possible Issues

### Issue #1: FullCalendar v6 Changed Event Rendering
**Solution**: May need to use `eventContent` custom render function

### Issue #2: CSS Conflicts
**Check**: Our custom CSS in `globals.css` might be overriding FullCalendar positioning
**Test**: Visit `/test-calendar-clean` which has minimal CSS

### Issue #3: Date Interpretation
**Check**: FullCalendar might be using local timezone instead of UTC
**Solution**: Try adding 'T00:00:00' to dates

## Next Steps if Still Broken

1. Try explicit time format:
```json
{
  "start": "2025-11-04T00:00:00",
  "end": "2025-11-23T00:00:00"
}
```

2. Remove `allDay` and `display` properties to use defaults

3. Check if we need `eventClassNames` or `eventDidMount` callback

4. Try `duration` instead of `end`:
```json
{
  "start": "2025-11-04",
  "duration": { "days": 19 }
}
```
