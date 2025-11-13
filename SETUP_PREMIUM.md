# Premium Features Setup Guide

This guide will help you set up and test the Premium features in your Rental Inventory Management system.

## Prerequisites

- PostgreSQL database running
- Node.js and npm installed
- Environment variables configured

## Step 1: Install Dependencies

Dependencies have already been installed, including:
- `next-auth` - Authentication
- `bcrypt` - Password hashing
- `nodemailer` - Email sending
- `@types/bcrypt` and `@types/nodemailer` - TypeScript types

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### Required Variables

```env
# Database - Your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/rental_inventory?schema=public"

# NextAuth - Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional Variables (for full features)

```env
# Email (for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_BUSINESS_PRICE_ID="price_..."
```

## Step 3: Run Database Migration

Apply the new schema changes for authentication and premium features:

```bash
npx prisma migrate dev --name add_premium_features
```

This will create tables for:
- `User` - User accounts with email/password
- `Subscription` - User subscription plans
- `PublicPage` - Public booking pages
- `PublicInquiry` - Inquiries from public pages
- `PasswordReset` - Password reset tokens

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

## Step 5: Create Admin User (Optional)

You can create an admin user manually through sign-up and then update the database:

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/sign-up`
3. Create an account
4. Update the user role in the database:

```sql
UPDATE "User"
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

Or use Prisma Studio:

```bash
npx prisma studio
```

Then edit the user and change `role` to `admin`.

## Step 6: Test Authentication Flow

### Sign Up
1. Go to `http://localhost:3000/auth/sign-up`
2. Create a new account
3. You'll be automatically signed in and redirected to the home page

### Sign In
1. Go to `http://localhost:3000/auth/sign-in`
2. Enter your email and password
3. Click "Sign In"

### Forgot Password
1. Go to `http://localhost:3000/auth/forgot-password`
2. Enter your email
3. (Note: Email functionality requires SMTP configuration)

## Step 7: Access Premium Page

1. Sign in to your account
2. Open the hamburger menu
3. Click on "Premium Features"
4. View the feature list and pricing

## Step 8: Access Admin Dashboard

1. Make sure your user has `role = 'admin'` in the database
2. Go to `http://localhost:3000/admin`
3. View user statistics, subscription breakdown, and MRR

## Features Implemented

### ✅ Authentication
- [x] Email/password sign up
- [x] Email/password sign in
- [x] Password hashing with bcrypt
- [x] JWT sessions with NextAuth
- [x] Forgot password page (UI ready, email sending requires SMTP)

### ✅ User Management
- [x] User model with roles (user/admin)
- [x] Subscription model (free/pro/business)
- [x] Email verification flag
- [x] Password reset tokens

### ✅ Premium Page
- [x] Feature showcase
- [x] Pricing tiers (Free, Pro, Business)
- [x] Benefits and comparisons
- [x] Call-to-action buttons

### ✅ Admin Dashboard
- [x] Total users count
- [x] Premium users count
- [x] New users this month
- [x] Plan distribution chart
- [x] MRR calculation
- [x] Public pages and inquiries stats

### ⏳ Coming Next (Phase 2)
- [ ] Public booking pages
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Events Near You feature
- [ ] Custom analytics dashboard
- [ ] SMS notifications

## Database Schema Overview

### User Table
```typescript
{
  id: string
  email: string (unique)
  passwordHash: string
  role: 'user' | 'admin'
  firstName?: string
  lastName?: string
  emailVerified: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Subscription Table
```typescript
{
  id: string
  userId: string (unique, FK to User)
  plan: 'free' | 'pro' | 'business'
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
  currentPeriodEnd?: DateTime
  stripeCustomerId?: string
  stripeSubId?: string
}
```

### PublicPage Table (for Premium users)
```typescript
{
  id: string
  userId: string (unique, FK to User)
  slug: string (unique)
  title: string
  phonePublic?: string
  emailPublic?: string
  itemsJson: Json // Array of items to show
  isActive: boolean
}
```

## Navigation Structure

The app now has the following navigation:

**Main Menu** (Hamburger Menu):
1. Add Item
2. New Booking
3. All Bookings
4. Inventory
5. Settings
6. **Premium Features** ⭐ NEW

**Auth Pages**:
- `/auth/sign-in` - Sign in page
- `/auth/sign-up` - Sign up page
- `/auth/forgot-password` - Password reset page

**Premium Pages**:
- `/premium` - Premium features showcase

**Admin Pages**:
- `/admin` - Admin dashboard (requires admin role)

## Helper Functions

The following helper functions are available in `app/lib/auth.ts`:

- `hashPassword(password: string)` - Hash a password
- `verifyPassword(password: string, hash: string)` - Verify a password
- `generateResetToken()` - Generate password reset token
- `hasFeature(userId: string, feature: string)` - Check if user has premium feature
- `isAdmin(userId: string)` - Check if user is admin
- `getUserWithSubscription(userId: string)` - Get user with subscription data

## Security Best Practices

1. **Never commit `.env.local` to git** - It contains secrets
2. **Use strong NEXTAUTH_SECRET** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS in production** - Set `NEXTAUTH_URL` to your https domain
4. **Rotate secrets regularly** - Especially after team changes
5. **Use environment-specific Stripe keys** - Test keys for dev, live keys for production

## Testing Checklist

- [ ] Create a new user account via sign-up
- [ ] Sign in with the created account
- [ ] Access the premium page while signed in
- [ ] Create an admin user and access `/admin`
- [ ] Verify admin dashboard shows user statistics
- [ ] Try signing out and signing back in
- [ ] Test forgot password flow (UI)

## Troubleshooting

### Issue: "NEXTAUTH_SECRET is not defined"
**Solution**: Make sure you've set `NEXTAUTH_SECRET` in your `.env.local` file

### Issue: "Database migration failed"
**Solution**: Make sure PostgreSQL is running and DATABASE_URL is correct

### Issue: "Cannot access /admin"
**Solution**: Make sure your user has `role = 'admin'` in the database

### Issue: "Session not persisting"
**Solution**: Clear browser cookies and try again. Make sure NEXTAUTH_URL matches your current domain.

## Next Steps

1. Test the authentication flow
2. Create an admin account
3. Explore the admin dashboard
4. View the premium features page
5. Start implementing Phase 2 features (Stripe, public pages, etc.)

## Support

For questions or issues, refer to the documentation:
- NextAuth.js: https://next-auth.js.org/
- Prisma: https://www.prisma.io/docs
- Stripe: https://stripe.com/docs
