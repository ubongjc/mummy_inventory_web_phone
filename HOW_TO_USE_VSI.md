# VSI Very Simple Inventory - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Home Page - Calendar View](#home-page---calendar-view)
3. [All Bookings Page](#all-bookings-page)
4. [Inventory Page](#inventory-page)
5. [Settings Page](#settings-page)
6. [Common Features](#common-features)

---

## Getting Started

### Accessing the Application
Open your web browser and navigate to your VSI application URL. You will see the Home page with a calendar view displaying your rental bookings.

**[Screenshot: Application homepage with calendar view]**

### Navigation Menu
The application has a navigation bar at the top with the following sections:
- **Home** - Calendar view of all bookings
- **All Bookings** - List view of all rental bookings
- **Inventory** - Manage your rental items
- **Settings** - Configure application preferences

**Mobile Navigation:** On mobile devices, tap the menu icon (☰) in the top-right corner to access navigation links.

**[Screenshot: Navigation bar on desktop and mobile]**

---

## Home Page - Calendar View

The Home page provides a visual calendar interface for managing your rental bookings.

### Calendar Features

#### Viewing Bookings
- The calendar displays all bookings with color-coded bars
- Each booking shows the customer name
- Bookings spanning multiple days appear as connected bars across dates
- Different colors help distinguish between different bookings

**[Screenshot: Calendar with multiple bookings displayed]**

#### Filtering Calendar Items
At the top of the calendar, you can filter which items are displayed:

1. **Item Filter Button**: Click the filter icon next to "Select Items to Display"
2. A dropdown will show all your inventory items with checkboxes
3. Check/uncheck items to show/hide their bookings on the calendar
4. Use "Select All" to show all items
5. Use "Deselect All" to hide all items
6. Use the search box to quickly find specific items
7. Sort items by name, quantity, or unit using the "Sort by" dropdown

**[Screenshot: Item filter dropdown open with checkboxes]**

#### Viewing Daily Details
To see all bookings and availability for a specific day:

1. Click on any date in the calendar
2. A drawer will slide in from the right showing:
   - The selected date
   - All bookings for that day with status badges (CONFIRMED, OUT, RETURNED)
   - Customer names and notes
   - Color indicators matching the calendar
3. Click "Close" or tap outside the drawer to dismiss it

**[Screenshot: Day drawer open showing booking details]**

### Quick Actions from Home Page

#### Add New Item
1. Click the "Add Item" button at the top of the page
2. Fill in the following information:
   - **Item Name*** (required): Enter the name of the rental item
   - **Unit*** (required): Enter the unit type (e.g., "piece", "set", "each") - letters only
   - **Total Quantity*** (required): Enter a numeric value for total stock
   - **Default Price per Unit** (optional): Enter price with up to 2 decimals
   - **Notes** (optional): Add any additional notes (max 50 characters)
3. **Form Validation**: If you click "Add Item" without filling required fields:
   - Empty/invalid fields will show a red border
   - Red error messages will appear below each field:
     - "*Enter a valid Item Name"
     - "*Enter letters only (no numbers)" (for unit)
     - "*Enter a numeric quantity"
     - "*Enter a valid price (max 2 decimals)"
4. Correct any errors indicated by red borders and messages
5. Click "Add Item" to save (button will show "Adding..." while processing)
6. The modal will close and your calendar will refresh

**[Screenshot: Add Item modal with all fields]**
**[Screenshot: Add Item modal showing validation errors with red borders]**

#### Add New Booking
1. Click the "Add Booking" button at the top of the page
2. **Select or Create Customer**:
   - Choose an existing customer from the dropdown, OR
   - Click "Create New Customer" to add a new one
   - If creating new customer, enter:
     - **First Name*** (required)
     - Last Name (optional)
     - Phone (optional)
     - Email (optional)
     - Address (optional)
3. **Form Validation for Customer**:
   - If no customer is selected and no new customer data entered, the dropdown will show a red border
   - Error message: "*Please select a customer or create a new one"
   - If creating new customer without first name: "*Enter customer first name"
4. **Select Rental Dates**:
   - **Start Date***: Click to open date picker and select rental start date
   - **Return Date***: Click to open date picker and select return date (must be on or after start date)
5. **Select Items**:
   - Click "+ Add Item" to add an item row
   - For each item:
     - Select the item from the dropdown
     - Enter the quantity to rent
   - Click "Remove" to delete an item row
6. **Form Validation for Items**:
   - If no items are selected with quantities, an error will appear
   - Error message: "*Please select at least one item with quantity"
7. **Payment Information** (optional):
   - Total Price: Enter the total booking price
   - Advance Payment: Enter any upfront payment received
   - Payment Due Date: Select when full payment is due
8. **Additional Information** (optional):
   - Status: Select CONFIRMED (default), OUT, or RETURNED
   - Notes: Add any notes (max 50 characters)
9. Click "Create Booking" to save
10. The modal will close and your calendar will refresh with the new booking

**[Screenshot: Add Booking modal - customer section]**
**[Screenshot: Add Booking modal - items section]**
**[Screenshot: Add Booking modal showing validation errors]**

#### Check Item Availability
1. Click the "Check Availability" button at the top of the page
2. **Select Date Range**:
   - **Start Date***: Select the beginning of the period to check
   - **Return Date***: Select the end of the period to check
   - **Qty**: Enter the quantity you need (default: 1)
3. Click "Check Availability" button
4. The system will show:
   - Each item in your inventory
   - Total quantity in stock
   - Maximum quantity available for the selected date range
   - Color coding:
     - Green: Fully available (all stock available)
     - Orange: Partially available (some stock available)
     - Red: Not available (no stock available)
5. Use the search box at the top to filter items by name
6. Click "Close" to exit

**[Screenshot: Check Availability modal showing availability results]**

---

## All Bookings Page

The All Bookings page provides a comprehensive list view of all your rental bookings with powerful filtering, sorting, and search capabilities.

**[Screenshot: All Bookings page overview]**

### Viewing Bookings

Each booking is displayed as a card showing:
- **Reference number** (e.g., BKG-000123)
- **Customer name**
- **Start Date** and **Return Date**
- **Status badge**: CONFIRMED (blue), OUT (orange), RETURNED (green), CANCELLED (gray)
- **Items rented**: List of item names with quantities
- **Pricing**: Total price and advance payment
- **Color indicator**: Colored strip matching calendar view
- **Notes**: Any booking notes

**[Screenshot: Individual booking card with all details]**

### Filtering Bookings

#### Date Range Filter
Use the "Filter by Date" dropdown to show bookings within specific time periods:
- **All Time**: Show all bookings (no date filter)
- **Today**: Only today's bookings
- **This Week**: Bookings in the current week
- **This Month**: Bookings in the current month
- **Next 7 Days**: Upcoming week
- **Next 30 Days**: Upcoming month
- **Custom Range**: Select specific start and end dates

When "Custom Range" is selected, two date pickers will appear to specify your date range.

**[Screenshot: Date range filter dropdown expanded]**

#### Status Filter
Use the "Status" dropdown to filter bookings by their status:
- **All Statuses**: Show all bookings regardless of status
- **CONFIRMED**: Show only confirmed bookings
- **OUT**: Show only bookings currently out
- **RETURNED**: Show only returned bookings
- **CANCELLED**: Show only cancelled bookings

**[Screenshot: Status filter dropdown]**

#### Search
Use the search box to find bookings by:
- Customer name
- Booking reference number
- Item names
- Notes

Type in the search box and the results will filter automatically as you type.

**[Screenshot: Search in action with filtered results]**

### Sorting Bookings

Use the "Sort by" dropdown to organize bookings:
- **Start Date (Newest First)**: Most recent start dates first
- **Start Date (Oldest First)**: Earliest start dates first
- **Customer Name (A-Z)**: Alphabetically by customer name
- **Customer Name (Z-A)**: Reverse alphabetically
- **Total Price (High to Low)**: Highest prices first
- **Total Price (Low to High)**: Lowest prices first

**[Screenshot: Sort dropdown options]**

### Default Filters Feature

Save your preferred filter settings to be automatically applied when you open the All Bookings page.

**[Screenshot: DEFAULT FILTERS button location]**

#### Setting Default Filters
1. Click the "DEFAULT FILTERS" button in the top-right corner (shows two lines: "DEFAULT" and "FILTERS")
2. A dropdown will open with three sections:
   - **Date Range**: Select your preferred default date range filter
   - **Sort By**: Select your preferred default sorting option
   - **Status Filter**: Select your preferred default status filter
3. Adjust each dropdown to your preferences
4. Click "Save as Default"
5. Your selections will be saved and immediately applied
6. Next time you visit the All Bookings page, these filters will be automatically applied

**[Screenshot: Default Filters dropdown open with all three selectors]**

#### Clearing Default Filters
1. Click the "DEFAULT FILTERS" button
2. Click "Clear Defaults" at the bottom of the dropdown
3. All saved defaults will be removed
4. The page will reset to show all bookings with default sorting

### Managing Individual Bookings

Each booking card has three action buttons:

#### View/Edit Booking
1. Click the **Edit** button (pencil icon)
2. The Edit Booking modal will open with all current booking details
3. You can modify:
   - Customer (select different customer or update customer info)
   - Dates (start and return dates)
   - Items (add, remove, or change quantities)
   - Payment information (total price, advance payment, due date)
   - Status (CONFIRMED, OUT, RETURNED, CANCELLED)
   - Notes
4. **Form Validation**: Same validation rules as Add Booking apply
5. Click "Update Booking" to save changes
6. The booking list will refresh with updated information

**[Screenshot: Edit Booking modal]**

#### Delete Booking
1. Click the **Delete** button (trash icon)
2. A confirmation modal will appear asking "Are you sure you want to delete this booking?"
3. Details of the booking will be shown for verification
4. Click "Delete" to confirm, or "Cancel" to keep the booking
5. If confirmed, the booking will be permanently removed

**[Screenshot: Delete confirmation modal]**

### Booking Statistics

At the top of the page, you'll see statistics showing:
- Total number of bookings displayed (based on current filters)
- Breakdown by status (e.g., "12 CONFIRMED, 5 OUT, 8 RETURNED")

**[Screenshot: Booking statistics display]**

---

## Inventory Page

The Inventory Page allows you to manage all your rental items and view their availability.

**[Screenshot: Inventory page overview]**

### Viewing Inventory Items

Each item is displayed in a card showing:
- **Item Name**
- **Unit** (e.g., "piece", "set")
- **Total Quantity in Stock**
- **Default Price per Unit**
- **Notes** (if any)

**[Screenshot: Individual item card]**

### Inventory Statistics

At the top of the page, you'll see:
- **Total Items**: Total number of inventory items
- **Total Quantity**: Sum of all item quantities across your inventory

**[Screenshot: Inventory statistics]**

### Adding New Items

1. Click the "Add Item" button at the top-right
2. Fill out the item details in the modal (see "Add New Item" section under Home Page)
3. The new item will appear in your inventory list

### Editing Items

1. Click the **Edit** button (pencil icon) on any item card
2. The Edit Item modal will open with current item details
3. Modify any fields:
   - Item Name
   - Unit
   - Total Quantity
   - Default Price
   - Notes (max 50 characters)
4. **Form Validation**: Same validation rules as Add Item apply:
   - Empty name: "*Enter a valid Item Name"
   - Invalid unit: "*Enter letters only (no numbers)"
   - Invalid quantity: "*Enter a numeric quantity"
   - Invalid price: "*Enter a valid price (max 2 decimals)"
5. Click "Update Item" to save changes

**[Screenshot: Edit Item modal]**

### Deleting Items

1. Click the **Delete** button (trash icon) on any item card
2. A confirmation modal will appear
3. **Important**: If the item is used in any existing bookings, you'll see a warning:
   - "This item is used in X booking(s)"
   - List of bookings using this item
   - Deleting will remove the item from all these bookings
4. Click "Delete" to confirm, or "Cancel" to keep the item
5. If confirmed, the item will be permanently removed

**[Screenshot: Delete item confirmation modal with booking warning]**

### Searching Inventory

Use the search box at the top to filter items by:
- Item name
- Unit type
- Notes

Results filter automatically as you type.

**[Screenshot: Search in inventory]**

### Sorting Inventory

Use the "Sort by" dropdown to organize items:
- **Name (A-Z)**: Alphabetically by item name
- **Name (Z-A)**: Reverse alphabetically
- **Quantity (High to Low)**: Items with most stock first
- **Quantity (Low to High)**: Items with least stock first
- **Unit**: Grouped by unit type

**[Screenshot: Inventory sort options]**

---

## Settings Page

The Settings page allows you to configure application-wide preferences for your rental business.

**[Screenshot: Settings page overview]**

### Business Information

Configure your business details that appear on invoices and reports:

- **Business Name**: Your company or business name
- **Business Phone**: Contact phone number
- **Business Email**: Contact email address
- **Business Address**: Full business address

**[Screenshot: Business information section]**

### Currency Settings

Configure how prices are displayed:

- **Currency**: Select your currency (USD, EUR, GBP, etc.)
- **Currency Symbol**: The symbol displayed with prices ($, €, £, etc.)

**[Screenshot: Currency settings section]**

### Tax Configuration

- **Tax Rate**: Enter tax percentage (e.g., enter "10" for 10% tax)
- This will be used for calculating taxes on bookings

**[Screenshot: Tax configuration]**

### Inventory Settings

- **Low Stock Threshold**: Set the quantity at which items are considered "low stock"
- Items below this threshold will be highlighted for reordering

**[Screenshot: Inventory settings]**

### Rental Settings

- **Default Rental Days**: Set the default duration for new bookings
- This will pre-fill the return date when creating bookings

**[Screenshot: Rental settings]**

### Date & Time Settings

Configure how dates are displayed throughout the application:

- **Date Format**: Choose format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- **Timezone**: Select your timezone for accurate date/time displays

**[Screenshot: Date and time settings]**

### Saving Settings

1. Modify any settings as needed
2. Click the "Save Settings" button at the bottom
3. A confirmation message will appear
4. Changes will be applied immediately throughout the application

**[Screenshot: Save settings button and confirmation]**

---

## Common Features

### Form Validation

Throughout the application, forms have built-in validation to ensure data quality:

**Visual Indicators:**
- **Red borders**: Appear around fields with errors or missing required data
- **Error messages**: Red text below fields explaining what needs to be corrected
- **Required field marker (*)**: Indicates mandatory fields

**Common Validation Messages:**
- "*Enter a valid Item Name" - Item name is required
- "*Enter letters only (no numbers)" - Unit field should only contain letters
- "*Enter a numeric quantity" - Quantity must be a valid number
- "*Enter a valid price (max 2 decimals)" - Price format is incorrect
- "*Please select a customer or create a new one" - Customer selection required
- "*Enter customer first name" - First name required for new customers
- "*Please select at least one item with quantity" - At least one item needed for bookings

**How to Fix Validation Errors:**
1. Look for red-bordered fields
2. Read the error message below the field
3. Correct the input according to the message
4. The red border will disappear once the field is valid
5. Try submitting again

**[Screenshot: Form with validation errors showing red borders and messages]**

### Character Limits

Several fields have character limits to maintain clean data:

- **Notes fields**: 50 characters maximum
- A character counter appears below the field showing remaining characters
- Example: "12/50 characters remaining"

**[Screenshot: Notes field with character counter]**

### Date Pickers

When selecting dates throughout the application:

1. Click on any date field
2. A calendar popup will appear
3. Use the month/year selectors at the top to navigate
4. Click on a date to select it
5. The selected date will be highlighted
6. Click outside to close the picker

**[Screenshot: Date picker popup]**

### Status Badges

Bookings use color-coded status badges for quick identification:

- **CONFIRMED** (Blue): Booking confirmed, not yet picked up
- **OUT** (Orange): Items currently out with customer
- **RETURNED** (Green): Items returned, booking complete
- **CANCELLED** (Gray): Booking cancelled

**[Screenshot: All four status badges]**

### Responsive Design

The application works on all device sizes:

- **Desktop**: Full navigation bar, larger cards, more details visible
- **Tablet**: Adjusted layouts, scrollable sections
- **Mobile**:
  - Hamburger menu (☰) for navigation
  - Stacked layouts
  - Touch-friendly buttons
  - Swipe-friendly drawers

**[Screenshot: Application on desktop, tablet, and mobile]**

### Loading States

When data is being loaded or processed:

- Buttons show "Loading...", "Adding...", "Updating...", etc.
- Buttons are disabled during processing
- Spinners may appear for longer operations

**[Screenshot: Button in loading state]**

### Error Handling

If an error occurs:

- Error messages appear in red at the top of forms or modals
- Descriptive text explains what went wrong
- Examples:
  - "Failed to create booking. Please try again."
  - "An error occurred while fetching items."
  - "Cannot delete item: it is used in active bookings"

**[Screenshot: Error message display]**

---

## Tips & Best Practices

### Organizing Bookings
1. Use consistent naming for customers (First Name, Last Name format)
2. Add notes to bookings for special requirements or reminders
3. Use the color coding feature to visually organize different types of events
4. Set default filters to match your most common view

### Managing Inventory
1. Keep total quantities accurate as you acquire or retire items
2. Use descriptive item names that are easy to search
3. Set realistic default prices
4. Add notes for special handling or storage requirements
5. Regularly check availability before confirming bookings

### Efficient Workflow
1. **Save Default Filters**: Set up your preferred view in All Bookings page
2. **Use Check Availability**: Always verify stock before creating bookings
3. **Update Status Regularly**: Keep booking statuses current (CONFIRMED → OUT → RETURNED)
4. **Add Payment Info**: Track advance payments and payment due dates
5. **Mobile Access**: Use the mobile version for quick updates on the go

### Data Entry
1. Fill out all available fields for better record-keeping
2. Use the notes field for important details
3. Double-check quantities before confirming bookings
4. Keep customer contact information up to date

---

## Troubleshooting

### "Form won't submit"
- Check for red-bordered fields indicating validation errors
- Read error messages below each field
- Ensure all required fields (marked with *) are filled
- Verify that dates are in correct order (return date ≥ start date)

### "Can't find a booking"
- Check your filter settings (date range, status)
- Clear search box if you're searching
- Try "All Time" date filter to see all bookings
- Verify status filter is not hiding the booking

### "Calendar looks empty"
- Check item filter - you may have items deselected
- Click "Select All" in the item filter
- Verify you have bookings in the selected date range
- Try scrolling the calendar to different months

### "Can't delete an item"
- Items used in bookings cannot be deleted
- The confirmation modal will show which bookings use the item
- Either remove the item from those bookings first, or cancel the deletion

### "Changes aren't saving"
- Ensure you click the Save/Update button
- Check for validation errors preventing submission
- Verify you have internet connection
- Try refreshing the page and attempting again

---

## Getting Help

For additional assistance:
1. Review this guide for step-by-step instructions
2. Check the troubleshooting section above
3. Contact your system administrator
4. Report bugs or request features through your support channel

---


**Very Simple Inventory (VSI)** 📦
Version 2.0.0
Last Updated: November 2024
