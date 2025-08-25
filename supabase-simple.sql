-- Simple schema that matches Prisma exactly
-- Run this in your Supabase SQL Editor

-- Create ENUM types
CREATE TYPE "UserType" AS ENUM ('DONOR', 'DONEE');
CREATE TYPE "PledgeStatus" AS ENUM ('PENDING', 'TASK1_COMPLETE', 'TASK2_COMPLETE', 'COMPLETED');

-- Drop existing tables (this deletes data - be careful!)
DROP TABLE IF EXISTS "social_impact_points" CASCADE;
DROP TABLE IF EXISTS "donations" CASCADE; 
DROP TABLE IF EXISTS "pledges" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Users table (using TEXT id to match Prisma)
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT ('user_' || substr(md5(random()::text), 1, 8)),
    "username" TEXT NOT NULL,
    "email" TEXT,
    "type" "UserType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_username_key" UNIQUE ("username"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- Insert test users with simple IDs
INSERT INTO "users" ("id", "username", "email", "type") VALUES
    ('user_donor_001', 'testdonor', 'donor@test.com', 'DONOR'),
    ('user_donee_001', 'testdonee', 'donee@test.com', 'DONEE'),
    ('user_admin_001', 'admin', 'admin@test.com', 'DONOR');

-- Verify the data
SELECT * FROM "users";