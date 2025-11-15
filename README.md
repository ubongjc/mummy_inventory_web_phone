# Very Simple Inventory 📦

A modern, intuitive web application for rental businesses to manage inventory, bookings, customers, and payments. Built with Next.js 15, PostgreSQL, and a beautiful calendar interface.

**Live Demo**: [verysimpleinventory.com](https://verysimpleinventory.com)

---

## ✨ Features

### 📅 **Visual Calendar Management**
- Interactive monthly calendar with FullCalendar
- Color-coded bookings for easy identification
- Click any date to view detailed booking information
- Filter calendar by specific items
- Day drawer showing all bookings and availability

### 📦 **Inventory Management**
- Unlimited inventory items
- Track quantities, units, and pricing
- Real-time availability checking
- Search and sort capabilities
- Low stock threshold alerts
- Item-level notes and descriptions

### 👥 **Customer Management**
- Store customer contact information
- Track booking history per customer
- Email and phone validation
- Search and filter customers
- Quick customer creation during booking

### 📋 **Booking Management**
- Multi-item bookings with quantities
- Date range selection with validation
- Status tracking (Confirmed, Out, Returned, Cancelled)
- Reference numbers (BKG-######)
- Payment tracking with balance calculation
- Overdue payment identification
- Color coding for visual organization
- Booking notes and custom fields

### 💰 **Payment Tracking**
- Total price and advance payment
- Multiple payment records per booking
- Payment due dates
- Balance calculation
- 13+ currency support
- Payment history with notes

### 🔐 **Authentication & Security**
- Secure email/password sign up and sign in
- Password strength requirements
- Forgot password with email recovery
- Bcrypt password hashing (12 rounds)
- Rate limiting (5 attempts/hour for sign-up)
- XSS protection and input sanitization
- CSRF protection
- HTTP-only secure cookies
- Role-based access (User, Admin)

### 🎨 **Modern UI/UX**
- Responsive design (mobile, tablet, desktop)
- Gradient color scheme
- Toast notifications
- Loading states
- Form validation with clear error messages
- Character counters
- Touch-friendly controls
- Mobile hamburger menu

### ⚙️ **Settings & Configuration**
- Business information
- Currency selection (USD, EUR, GBP, NGN, INR, JPY, CNY, KRW, CAD, AUD, ZAR, BRL, MXN)
- Date format preferences (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.)
- Timezone support (50+ timezones)
- Tax rate configuration
- Low stock threshold
- Default rental duration

### 🔍 **Advanced Features**
- Global search across bookings
- Multi-criteria filtering
- Custom date ranges
- Default filter preferences
- Availability conflict detection
- Pagination for large datasets
- Sort by multiple fields
- Export-ready data structure

---

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **FullCalendar** - Interactive calendar
- **Lucide Icons** - Modern icon library
- **date-fns** - Date manipulation
- **date-fns-tz** - Timezone support

### Backend
- **Next.js API Routes** - RESTful endpoints
- **NextAuth.js** - Authentication
- **PostgreSQL** - Primary database
- **Prisma ORM** - Type-safe database access
- **Zod** - Runtime validation
- **Bcrypt** - Password hashing

### Email
- **Resend** - Email delivery service
- **Custom email templates** - Password reset emails

### Deployment
- **Vercel** - Hosting and CI/CD
- **Neon/Supabase** - Managed PostgreSQL

---

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Resend account (for password reset emails)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/very-simple-inventory.git
cd very-simple-inventory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rental_inventory?schema=public"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM_ADDRESS="support@verysimpleinventory.com"
EMAIL_FROM_NAME="VerySimple Inventory Support"
```

**Get a free database:**
- **Neon**: https://neon.tech (recommended)
- **Supabase**: https://supabase.com

**Get Resend API key:**
- Sign up at https://resend.com
- Verify your domain or use `onboarding@resend.dev` for testing

### 4. Set Up Database

Run migrations to create tables:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:

```bash
npx prisma generate
```

(Optional) Seed with sample data:

```bash
npx ts-node prisma/seed.ts
```

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 📖 Usage

### Getting Started

1. **Sign Up**: Create your account at `/auth/sign-up`
2. **Add Inventory**: Go to Inventory page and add your rental items
3. **Add Customers**: Create customer profiles
4. **Create Bookings**: Use the calendar or All Bookings page
5. **Track Payments**: Record payments and track balances
6. **Check Availability**: Use the availability checker before confirming bookings

### Password Reset

If you forget your password:
1. Go to `/auth/forgot-password`
2. Enter your email
3. Check your inbox (and spam folder)
4. Click the reset link
5. Set a new password

### Calendar Interface

- **Click dates** to view bookings
- **Filter items** to focus on specific inventory
- **Color coding** helps identify different bookings
- **Day drawer** shows detailed booking information

### All Bookings Page

- **Search** by customer, item, or reference
- **Filter** by date range and status
- **Sort** by various criteria
- **Save default filters** for your preferred view
- **Edit/Delete** bookings directly

### Availability Checker

1. Click "Check Availability"
2. Select date range
3. See item-by-item availability
4. Color-coded results (green/orange/red)

---

## 🗂️ Project Structure

```
very-simple-inventory/
├── app/
│   ├── (marketing)/          # Marketing pages
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── bookings/         # Booking CRUD
│   │   ├── customers/        # Customer CRUD
│   │   ├── items/            # Inventory CRUD
│   │   ├── payment/          # Payment tracking
│   │   └── user/             # User profile
│   ├── auth/                 # Auth pages (sign-in, sign-up, forgot password)
│   ├── bookings/             # All bookings page
│   ├── components/           # React components
│   ├── customers/            # Customers page
│   ├── dashboard/            # Main calendar dashboard
│   ├── inventory/            # Inventory management
│   ├── lib/                  # Utilities
│   │   ├── auth.ts           # Auth configuration
│   │   ├── email.ts          # Email sending (Resend)
│   │   ├── prisma.ts         # Database client
│   │   ├── ratelimit.ts      # Rate limiting
│   │   └── security.ts       # Security utilities
│   ├── premium/              # Premium features page
│   ├── settings/             # Settings page
│   ├── styles/               # Global CSS
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Marketing homepage
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Seed script
│   └── migrations/           # Database migrations
├── public/                   # Static assets
│   ├── favicon.svg           # Box emoji favicon
│   ├── icon-192x192.png      # PWA icon
│   └── manifest.json         # PWA manifest
├── middleware.ts             # Next.js middleware (auth)
└── package.json
```

---

## 🔒 Security Features

- **Password Requirements**: 8+ characters, uppercase, lowercase, number
- **Rate Limiting**: 5 sign-up attempts per hour per IP
- **Password Hashing**: Bcrypt with 12 rounds
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Via NextAuth
- **SQL Injection Prevention**: Via Prisma ORM
- **Secure Sessions**: HTTP-only cookies, 30-day expiry
- **Password Reset**: Secure token-based with 1-hour expiration
- **Email Verification**: Coming soon

---

## 📊 Database Schema

### Core Models

**User**
- Email, password (hashed), role
- Business settings (name, currency, timezone)

**Item**
- Name, unit, quantity, price
- Notes, timestamps

**Customer**
- First name, last name
- Phone, email, address, notes

**Booking**
- Customer reference
- Start/end dates
- Status, reference number, notes
- Color coding
- Payment information

**BookingItem**
- Links bookings to items
- Quantity per item

**Payment**
- Amount, date, notes
- Links to booking

**PasswordResetToken**
- Token, expiry, used status
- Links to user

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git push origin main
```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add all variables from `.env`
   - Update `NEXTAUTH_URL` to your production URL

4. **Deploy**
   - Vercel will automatically build and deploy

5. **Run Database Migrations**

```bash
npx prisma migrate deploy
```

### Custom Domain

1. Go to Vercel project settings
2. Navigate to Domains
3. Add your domain (e.g., `verysimpleinventory.com`)
4. Update DNS records as instructed
5. SSL certificate will be auto-configured

---

## 📧 Email Setup (Resend)

### 1. Sign Up for Resend
- Go to https://resend.com
- Create a free account

### 2. Add Your Domain
- Go to Domains section
- Add your domain (e.g., `verysimpleinventory.com`)
- Add DNS records provided by Resend

### 3. Configure Environment Variables

```env
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM_ADDRESS="support@yourdomain.com"
EMAIL_FROM_NAME="Your Business Name"
NEXTAUTH_URL="https://yourdomain.com"
```

### 4. Test Password Reset
1. Go to `/auth/forgot-password`
2. Enter your email
3. Check inbox for reset email
4. Click link and set new password

---

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma Client
npx ts-node prisma/seed.ts  # Seed database

# Testing
npm test                 # Run tests (when available)
```

### Database Reset

To clear and reseed the database:

```bash
npx prisma migrate reset
npx ts-node prisma/seed.ts
```

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Email/SMS notifications
- [ ] PDF invoice generation
- [ ] WhatsApp integration
- [ ] Multi-location support
- [ ] Team member accounts
- [ ] API access & webhooks
- [ ] Mobile apps (iOS, Android)
- [ ] Barcode/QR scanning
- [ ] Advanced analytics
- [ ] Dark mode
- [ ] Offline mode
- [ ] Bulk import/export

---

## 📚 Documentation

- **FEATURES.md** - Complete feature list
- **HOW_TO_USE_VSI.md** - User guide
- **EMAIL_SETUP.md** - Email configuration guide
- **SECURITY_FIXES.md** - Security audit and fixes
- **SETUP_PREMIUM.md** - Premium features setup

---

## 🐛 Troubleshooting

### Database Connection Errors
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check network/firewall settings

### Prisma Client Not Found
```bash
npx prisma generate
```

### Email Not Sending
- Verify Resend API key
- Check domain verification in Resend
- Look for errors in server logs
- Test with `onboarding@resend.dev` first

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

Proprietary - All rights reserved

---

## 💬 Support

- **Documentation**: See docs in this repository
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@verysimpleinventory.com

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Calendar by [FullCalendar](https://fullcalendar.io)
- Icons by [Lucide](https://lucide.dev)
- Email by [Resend](https://resend.com)

---

**Very Simple Inventory** - Making rental management simple 📦

Version 2.0.0 | Last Updated: November 2024
