# Supabase Authentication Implementation Guide

## Overview
This guide provides step-by-step instructions to implement complete Supabase authentication for the Restaurant POS system, including sign up, login, logout, password reset, email verification, and 2FA for managers.

## Prerequisites
- Supabase account (https://supabase.com)
- Node.js and npm installed
- Your restaurant-pos-system cloned locally

## STEP 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project name: "restaurant-pos"
4. Set password (save it)
5. Select region
6. Click "Create new project"

### 1.2 Get API Keys
1. In Supabase dashboard, go to Settings > API
2. Copy "Project URL" and "anon key"
3. Go to Settings > Database > Connection string
4. Copy "Service Role Key"
5. Add to .env.local:
```
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## STEP 2: Create Database Tables

### 2.1 SQL Setup
Run in Supabase SQL Editor:
```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'cashier', 'kitchen')) DEFAULT 'cashier',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified_at TIMESTAMP,
  phone TEXT,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password_resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create two_factor_auth table
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[] NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  enabled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
```

## STEP 3: Install Dependencies

```bash
npm install @supabase/supabase-js specta
npm install --save-dev @types/node
```

Note: `specta` is for OTP generation for 2FA

## STEP 4: Create Lib Files

Create the following files in the `lib/` directory:

### 4.1 lib/supabase.ts
File initialization and client setup

### 4.2 lib/auth-supabase.ts
Supabase authentication functions

### 4.3 lib/email.ts
Email sending utilities

### 4.4 lib/otp.ts
OTP generation for 2FA

## STEP 5: API Routes

Create API routes for auth endpoints:
- app/api/auth/signup
- app/api/auth/login
- app/api/auth/logout
- app/api/auth/reset-password
- app/api/auth/verify-email
- app/api/auth/setup-2fa
- app/api/auth/verify-2fa

## STEP 6: Pages

Update pages:
- app/auth/login/page.tsx - Supabase integration
- app/auth/signup/page.tsx - New signup page
- app/auth/password-reset/page.tsx - New reset page
- app/auth/verify-email/page.tsx - New verify page

## STEP 7: Middleware

Update middleware.ts for route protection and session validation

## STEP 8: Testing

1. Test signup flow
2. Test login flow
3. Test email verification
4. Test password reset
5. Test 2FA setup and verification
6. Test role-based access

## IMPLEMENTATION DETAILS

See the following code files for complete implementation.
