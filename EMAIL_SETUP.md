# Email Setup for Very Simple Inventory

This guide explains how to set up Resend for password reset emails.

## Quick Start

### 1. Create Resend Account
- Go to https://resend.com and sign up
- Verify your email

### 2. Get API Key
- Dashboard → API Keys → Create API Key
- Copy the key (starts with `re_`)

### 3. Add Domain
- Dashboard → Domains → Add Domain
- Enter: `verysimpleinventory.com`
- Add DNS records provided by Resend:
  - TXT for verification
  - MX for sending
  - TXT for DKIM
  - TXT for SPF
  - TXT for DMARC

### 4. Configure Environment Variables

**Vercel:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM_ADDRESS=support@verysimpleinventory.com
EMAIL_FROM_NAME=VerySimple Inventory Support
NEXTAUTH_URL=https://verysimpleinventory.com
```

**Local:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM_ADDRESS=onboarding@resend.dev  # Or your verified domain
EMAIL_FROM_NAME=VerySimple Inventory
NEXTAUTH_URL=http://localhost:3000
```

### 5. Test
1. Go to `/auth/forgot-password`
2. Enter your email
3. Check inbox (and spam)
4. Click reset link
5. Set new password

## DNS Records Example

For `verysimpleinventory.com`:

```
# Verification
TXT @ "resend-verification-code-here"

# DKIM
TXT resend._domainkey "p=MIGfMA0GCS..."

# SPF
TXT @ "v=spf1 include:amazonses.com ~all"

# DMARC
TXT _dmarc "v=DMARC1; p=none;"

# MX for sending
MX @ feedback-smtp.us-east-1.amazonses.com (Priority: 10)
```

## Troubleshooting

- **Email not sending**: Check API key and domain verification status
- **Goes to spam**: Verify SPF/DMARC records are correct
- **404 on reset link**: Ensure code is deployed to production
- **Token expired**: Tokens expire after 1 hour, request new reset

## Security Features

- Tokens expire in 1 hour
- Single-use tokens
- Rate limited (5 requests per 15 min)
- Secure random generation
- SHA-256 hashed storage

---

**Provider**: Resend
**Free Tier**: 100 emails/day
**Docs**: https://resend.com/docs
