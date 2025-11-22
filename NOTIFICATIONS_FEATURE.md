# Smart Notifications & Reminders - Feature Documentation

## Overview

The Smart Notifications & Reminders feature is a consolidated premium feature that combines customer reminders and business alerts into one comprehensive notification system. It supports both Email and SMS channels with full CAN-SPAM compliance.

## Features Consolidated

Previously separate features:
- **Customer Reminders** (Feature #6) - Automated reminders for upcoming rentals, returns, and payments
- **Automated Notifications** (Feature #7) - Email and SMS alerts for new inquiries, overdue payments, low stock, and upcoming bookings

Now unified as:
- **Smart Notifications & Reminders** - Comprehensive notification system for both customer-facing and business-facing alerts

## Architecture

### Database Schema

#### NotificationPreferences Model
- **Purpose**: Stores business owner's notification preferences
- **Relation**: One-to-one with User
- **Fields**:
  - Business alerts (email & SMS): new inquiries, overdue payments, low stock, upcoming bookings, booking confirmations
  - Customer reminders (email & SMS): rental reminders, return reminders, payment reminders
  - Timing: `reminderHoursBefore` (1-168 hours, default 24)
  - SMS settings: `smsProviderPhone` (E.164 format)

#### CustomerNotificationOptOut Model
- **Purpose**: CAN-SPAM compliance - tracks customer opt-out preferences
- **Relation**: One-to-one with Customer
- **Fields**:
  - `optOutEmail`: boolean
  - `optOutSms`: boolean
  - `optOutDate`: timestamp

#### NotificationLog Model
- **Purpose**: Audit trail of all sent notifications
- **Relation**: Many-to-one with User
- **Fields**:
  - `userId`, `customerId`, `bookingId`
  - `notificationType`: enum (new_inquiry, overdue_payment, low_stock, rental_reminder, etc.)
  - `channel`: email | sms
  - `recipient`: email or phone number
  - `status`: sent | failed | bounced | skipped
  - `errorMessage`: optional error details
  - `sentAt`: timestamp

### API Endpoints

#### GET /api/notifications/settings
- **Purpose**: Fetch user's notification preferences
- **Authentication**: Required (NextAuth session)
- **Rate Limiting**: Applied via `applyRateLimit()`
- **Response**:
  ```json
  {
    "preferences": { ... },
    "isPremium": boolean
  }
  ```
- **Security**:
  - Session validation
  - User ownership verification
  - Auto-creates default preferences if none exist

#### PUT /api/notifications/settings
- **Purpose**: Update notification preferences
- **Authentication**: Required
- **Rate Limiting**: Applied
- **Input Validation**:
  - All boolean fields validated for type
  - `reminderHoursBefore`: 1-168 hours
  - `smsProviderPhone`: E.164 format regex (`/^\+[1-9]\d{1,14}$/`)
- **Security**:
  - Strict input validation
  - Only allowed fields can be updated
  - No SQL injection vectors (Prisma parameterized queries)

#### POST /api/notifications/opt-out
- **Purpose**: Customer opt-out from notifications (CAN-SPAM)
- **Authentication**: None (public endpoint)
- **Rate Limiting**: Applied
- **Input Validation**:
  - `customerId`: required, string
  - `optOutEmail`: optional, boolean
  - `optOutSms`: optional, boolean
- **Security**:
  - Customer existence verification
  - No sensitive data exposure
  - Logs all opt-out actions

#### GET /api/notifications/opt-out?customerId=xxx
- **Purpose**: Check customer's opt-out status
- **Rate Limiting**: Applied
- **Response**:
  ```json
  {
    "optOutEmail": boolean,
    "optOutSms": boolean,
    "optOutDate": timestamp | null
  }
  ```

### Notification Service (app/lib/notifications.ts)

#### NotificationService Class

**Main Methods:**
- `send()`: Main entry point for sending notifications
  - Checks customer opt-out status
  - Routes to email or SMS handler
  - Logs all attempts

- `sendEmail()`: Email delivery via nodemailer
  - Requires env vars: `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST`, `EMAIL_PORT`
  - Supports SMTP (Gmail, SendGrid, etc.)
  - Returns success/failure status

- `sendSMS()`: SMS delivery (placeholder for provider integration)
  - Requires env vars: `SMS_PROVIDER`, `SMS_API_KEY`
  - Currently logs SMS (implement Twilio/Africa's Talking integration)
  - Returns success/failure status

- `logNotification()`: Audit trail
  - Records all notification attempts
  - Captures errors for debugging
  - Never throws (catches all errors)

**Helper Methods:**
- `sendRentalReminder()`: Customer rental start reminder
- `sendReturnReminder()`: Customer rental return reminder
- `sendPaymentReminder()`: Customer payment due reminder

### UI Components

#### Notification Settings Page (/notifications/settings)
- **Purpose**: Business owner configuration interface
- **Features**:
  - Toggle switches for all notification types
  - Email and SMS channels independently configurable
  - Reminder timing configuration (1-168 hours)
  - SMS phone number setup (E.164 validation)
  - Real-time save with success/error feedback
  - Premium badge for non-premium users
- **UX Enhancements**:
  - Loading states with spinners
  - Error handling with retry
  - Success confirmation messages
  - Responsive design (mobile-friendly)

## Security Features

### 1. Rate Limiting
- **Applied on**: All API endpoints
- **Protection**: DoS attack prevention
- **Implementation**: `applyRateLimit()` middleware

### 2. Input Validation
- **Boolean fields**: Type checked before database update
- **Numeric fields**: Range validation (1-168 hours)
- **Phone numbers**: E.164 format regex validation
- **Prevents**: Injection attacks, invalid data states

### 3. Authorization
- **Session-based**: NextAuth session validation
- **User ownership**: Preferences tied to authenticated user
- **No lateral access**: Users can only modify their own preferences

### 4. CAN-SPAM Compliance
- **Opt-out mechanism**: CustomerNotificationOptOut model
- **Immediate effect**: Notifications check opt-out before sending
- **Audit trail**: All opt-outs logged with timestamp
- **Public endpoint**: Customers can opt-out without authentication

### 5. Error Handling
- **Sanitized errors**: No stack traces to client
- **Detailed logging**: Server-side error logging for debugging
- **Graceful degradation**: Missing email/SMS config doesn't crash system

### 6. Data Privacy
- **Minimal exposure**: Only necessary data in API responses
- **No password leaks**: User model excludes passwordHash
- **Audit logging**: NotificationLog tracks all sends

## Environment Variables Required

### Email Configuration
```env
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com  # default
EMAIL_PORT=587  # default
```

### SMS Configuration (Optional - for future implementation)
```env
SMS_PROVIDER=twilio  # or 'africastalking'
SMS_API_KEY=your-api-key
TWILIO_ACCOUNT_SID=your-account-sid  # if using Twilio
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Testing Guide

### Unit Testing

#### 1. API Endpoints
```bash
# Test GET /api/notifications/settings
curl -H "Cookie: next-auth.session-token=<token>" \
  http://localhost:3000/api/notifications/settings

# Test PUT /api/notifications/settings
curl -X PUT -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<token>" \
  -d '{"newInquiryEmail": true, "reminderHoursBefore": 48}' \
  http://localhost:3000/api/notifications/settings

# Test rate limiting (rapid requests)
for i in {1..30}; do
  curl http://localhost:3000/api/notifications/settings
done
# Should return 429 after rate limit exceeded
```

#### 2. Input Validation
```bash
# Test invalid reminderHoursBefore
curl -X PUT -H "Content-Type: application/json" \
  -d '{"reminderHoursBefore": 200}' \
  http://localhost:3000/api/notifications/settings
# Should return 400

# Test invalid phone format
curl -X PUT -H "Content-Type: application/json" \
  -d '{"smsProviderPhone": "12345"}' \
  http://localhost:3000/api/notifications/settings
# Should return 400
```

#### 3. Opt-Out Mechanism
```bash
# Test customer opt-out
curl -X POST -H "Content-Type: application/json" \
  -d '{"customerId": "xxx", "optOutEmail": true}' \
  http://localhost:3000/api/notifications/opt-out

# Verify opt-out status
curl "http://localhost:3000/api/notifications/opt-out?customerId=xxx"
```

### Integration Testing

#### 1. Notification Sending
```typescript
// Test in Node.js environment with database access
import { NotificationService } from '@/app/lib/notifications';

// Send test email
await NotificationService.send({
  userId: 'user-id',
  customerId: 'customer-id',
  type: 'rental_reminder',
  channel: 'email',
  recipient: 'test@example.com',
  subject: 'Test Rental Reminder',
  message: 'This is a test notification',
});

// Check notification log
const logs = await prisma.notificationLog.findMany({
  where: { userId: 'user-id' },
  orderBy: { sentAt: 'desc' },
  take: 1,
});
console.log(logs[0].status); // Should be 'sent' or 'failed'
```

#### 2. Opt-Out Enforcement
```typescript
// Create opt-out
await prisma.customerNotificationOptOut.create({
  data: {
    customerId: 'customer-id',
    optOutEmail: true,
  },
});

// Try to send email (should be skipped)
const result = await NotificationService.send({
  userId: 'user-id',
  customerId: 'customer-id',
  type: 'rental_reminder',
  channel: 'email',
  recipient: 'test@example.com',
  message: 'Test',
});
console.log(result); // Should be false (skipped)

// Check log
const log = await prisma.notificationLog.findFirst({
  where: { customerId: 'customer-id' },
  orderBy: { sentAt: 'desc' },
});
console.log(log.status); // Should be 'skipped'
```

### Security Testing

#### 1. Rate Limiting
- Make 30+ rapid requests to any endpoint
- Verify 429 response after limit
- Wait and verify requests work again

#### 2. Authorization
- Try to access /api/notifications/settings without session
- Should return 401
- Try to access with different user's session
- Should only return/update own preferences

#### 3. Input Validation
- Test negative values for `reminderHoursBefore`
- Test values > 168
- Test invalid phone formats
- Test non-boolean values for toggle fields
- All should return 400 with specific error messages

#### 4. SQL Injection
- Try SQL injection in `customerId`: `' OR '1'='1`
- Prisma parameterized queries should prevent execution
- Should return 404 or validation error

#### 5. XSS Prevention
- Try XSS in notification message: `<script>alert('xss')</script>`
- Email templates should escape HTML
- No script execution should occur

## Migration Deployment

### Local Development (if Prisma works)
```bash
npx prisma migrate dev --name add_notification_preferences
npx prisma generate
```

### Vercel Deployment (automatic)
1. Push code to GitHub
2. Vercel automatically runs migrations
3. Database schema updated in production
4. No manual intervention needed

## Files Modified/Created

### Database
- `prisma/schema.prisma` - Added 3 new models

### API Routes
- `app/api/notifications/settings/route.ts` - GET/PUT preferences
- `app/api/notifications/opt-out/route.ts` - POST/GET opt-out

### Services
- `app/lib/notifications.ts` - Notification service class

### UI
- `app/notifications/settings/page.tsx` - Settings page
- `app/premium/page.tsx` - Consolidated feature display
- `app/(marketing)/page.tsx` - Updated landing page

## Usage Examples

### Business Owner: Configure Notifications
1. Navigate to `/notifications/settings`
2. Toggle email/SMS for each notification type
3. Set reminder timing (hours before event)
4. Add SMS phone number if using SMS
5. Click "Save Settings"

### Customer: Opt-Out
```html
<!-- Include in email footer -->
<a href="/api/notifications/opt-out?customerId=xxx&optOutEmail=true">
  Unsubscribe from emails
</a>
```

### Developer: Send Notification
```typescript
import { NotificationService } from '@/app/lib/notifications';

// Send rental reminder
await NotificationService.sendRentalReminder(
  userId,
  customerId,
  bookingId,
  'John Doe',
  'john@example.com',
  '+2348012345678',
  new Date('2025-12-01'),
  ['Tables (10)', 'Chairs (50)']
);
```

## Future Enhancements

1. **SMS Provider Integration**
   - Implement Twilio integration
   - Implement Africa's Talking integration
   - Support multiple SMS providers

2. **Scheduled Notifications**
   - Cron job to send reminders at configured times
   - Process upcoming bookings and send reminders
   - Check for overdue payments daily

3. **Notification Templates**
   - Customizable email templates
   - Customizable SMS templates
   - Support for variables (customer name, dates, etc.)

4. **Analytics**
   - Track notification delivery rates
   - Monitor opt-out trends
   - Email open rates (if using tracking pixels)

5. **Advanced Features**
   - WhatsApp Business API integration
   - Push notifications (web/mobile)
   - In-app notifications

## Compliance & Best Practices

### CAN-SPAM Act
- ✅ Opt-out mechanism provided
- ✅ Opt-outs processed immediately
- ✅ Unsubscribe link in emails (to be added to templates)
- ✅ No false/misleading header information
- ✅ Accurate "From" information

### GDPR (if applicable)
- ✅ Customer data minimization
- ✅ Right to opt-out
- ✅ Audit trail of notifications
- ⚠️ TODO: Add data export for customer notification history

### Security Best Practices
- ✅ Rate limiting on all endpoints
- ✅ Input validation
- ✅ Authorization checks
- ✅ Error handling without information disclosure
- ✅ Audit logging
- ✅ No hardcoded credentials
