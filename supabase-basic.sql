-- Just create users and test data - no enums
-- Run this in your Supabase SQL Editor

-- Drop existing users table 
DROP TABLE IF EXISTS "users" CASCADE;

-- Users table without enum (use text instead)
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT ('user_' || substr(md5(random()::text), 1, 8)),
    "username" TEXT NOT NULL,
    "email" TEXT,
    "type" TEXT NOT NULL CHECK (type IN ('DONOR', 'DONEE')),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_username_key" UNIQUE ("username"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- Insert test users
INSERT INTO "users" ("id", "username", "email", "type") VALUES
    ('user_donor_001', 'testdonor', 'donor@test.com', 'DONOR'),
    ('user_donee_001', 'testdonee', 'donee@test.com', 'DONEE'),
    ('user_admin_001', 'admin', 'admin@test.com', 'DONOR');

-- Verify
SELECT * FROM "users";