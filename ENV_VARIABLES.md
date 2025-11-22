# Environment Variables Required

This document lists all environment variables needed for the application to function properly.

## Core Database & Authentication

```bash
# PostgreSQL Database (Vercel Postgres)
DATABASE_URL="postgres://..."
DATABASE_URL_UNPOOLED="postgres://..."

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000" # Production: https://yourdomain.com
```

## Cloudinary (Image Upload)

Required for item image uploads on public booking pages.

```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**How to get Cloudinary credentials:**
1. Sign up at https://cloudinary.com (Free tier available)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

## Email Providers (Notifications)

### Option 1: SendGrid (Recommended)
```bash
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

### Option 2: Gmail SMTP
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password" # Use App Password, not regular password
SMTP_FROM="your-email@gmail.com"
```

### Option 3: Custom SMTP
```bash
SMTP_HOST="smtp.yourprovider.com"
SMTP_PORT="587"
SMTP_USER="your-username"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@yourdomain.com"
```

## SMS Providers (Notifications)

### Option 1: Twilio
```bash
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### Option 2: Africa's Talking
```bash
AFRICAS_TALKING_API_KEY="your-api-key"
AFRICAS_TALKING_USERNAME="your-username"
AFRICAS_TALKING_SHORT_CODE="your-short-code"
```

## Payment Integration (Paystack) - Optional

```bash
# Paystack (for payment links)
PAYSTACK_SECRET_KEY="sk_test_..." # Test key
# PAYSTACK_SECRET_KEY="sk_live_..." # Production key
PAYSTACK_PUBLIC_KEY="pk_test_..." # Test key
# PAYSTACK_PUBLIC_KEY="pk_live_..." # Production key
```

**Note:** Payment integration is currently greyed out in the UI. Activate it by:
1. Sign up at https://paystack.com
2. Get API keys from Dashboard > Settings > API Keys & Webhooks
3. Add the keys to your environment variables
4. Update the rental requests API to generate payment links

## Cron Job Security

```bash
# Cron job authentication (auto-cancellation, reminders)
CRON_SECRET="your-random-secret-string"
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

## Base URL

```bash
# Base URL for your application
NEXT_PUBLIC_BASE_URL="http://localhost:3000" # Development
# NEXT_PUBLIC_BASE_URL="https://yourdomain.com" # Production
```

## Complete .env.local Example

```bash
# Database
DATABASE_URL="postgres://..."
DATABASE_URL_UNPOOLED="postgres://..."

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (SendGrid)
SENDGRID_API_KEY="SG.xxxxx"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="ACxxxx"
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Cron Jobs
CRON_SECRET="your-random-secret"

# App URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Payment (Optional - Currently Greyed Out)
# PAYSTACK_SECRET_KEY="sk_test_..."
# PAYSTACK_PUBLIC_KEY="pk_test_..."
```

## Deployment to Vercel

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add all required variables
4. Redeploy your application

## Testing

After adding environment variables:

1. **Test Cloudinary**: Upload an item image in Inventory
2. **Test Public Page**: Create a public booking page with slug
3. **Test Availability**: Check availability on public page
4. **Test Requests**: Submit a rental request
5. **Test Management**: Approve/deny requests in dashboard

## Troubleshooting

### Cloudinary Upload Fails
- Verify API credentials are correct
- Check image size (must be < 5MB)
- Ensure proper base64 format

### Email Notifications Not Working
- Check SENDGRID_API_KEY is valid
- Verify FROM email is verified in SendGrid
- Check spam folder

### SMS Not Sending
- Verify Twilio credentials
- Check phone number format (E.164: +1234567890)
- Ensure account has credits

### Database Connection Issues
- Check DATABASE_URL format
- Verify database is accessible
- Run `npx prisma migrate deploy` after schema changes
