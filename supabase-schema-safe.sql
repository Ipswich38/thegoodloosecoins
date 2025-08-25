-- The Good Loose Coins - Supabase Database Schema (Safe Version)
-- Run this in your Supabase SQL Editor - handles existing objects

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserType') THEN
        CREATE TYPE "UserType" AS ENUM ('DONOR', 'DONEE');
    END IF;
END
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PledgeStatus') THEN
        CREATE TYPE "PledgeStatus" AS ENUM ('PENDING', 'TASK1_COMPLETE', 'TASK2_COMPLETE', 'COMPLETED');
    END IF;
END
$$;

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "type" "UserType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Pledges table
CREATE TABLE IF NOT EXISTS "pledges" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "donor_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_sent" DOUBLE PRECISION DEFAULT 0,
    "completion_percentage" DOUBLE PRECISION DEFAULT 0,
    "status" "PledgeStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pledges_pkey" PRIMARY KEY ("id")
);

-- Donations table
CREATE TABLE IF NOT EXISTS "donations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "pledge_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- Social Impact Points table
CREATE TABLE IF NOT EXISTS "social_impact_points" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_impact_points_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes (only if they don't exist)
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "social_impact_points_user_id_key" ON "social_impact_points"("user_id");

-- Add foreign key constraints (skip if they exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pledges_donor_id_fkey'
    ) THEN
        ALTER TABLE "pledges" ADD CONSTRAINT "pledges_donor_id_fkey" 
        FOREIGN KEY ("donor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'donations_pledge_id_fkey'
    ) THEN
        ALTER TABLE "donations" ADD CONSTRAINT "donations_pledge_id_fkey" 
        FOREIGN KEY ("pledge_id") REFERENCES "pledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'donations_beneficiary_id_fkey'
    ) THEN
        ALTER TABLE "donations" ADD CONSTRAINT "donations_beneficiary_id_fkey" 
        FOREIGN KEY ("beneficiary_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'social_impact_points_user_id_fkey'
    ) THEN
        ALTER TABLE "social_impact_points" ADD CONSTRAINT "social_impact_points_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pledges_updated_at ON "pledges";
CREATE TRIGGER update_pledges_updated_at BEFORE UPDATE ON "pledges"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_donations_updated_at ON "donations";
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON "donations"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_impact_points_updated_at ON "social_impact_points";
CREATE TRIGGER update_social_impact_points_updated_at BEFORE UPDATE ON "social_impact_points"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert test users (ignore conflicts)
INSERT INTO "users" ("username", "email", "type") VALUES
    ('testdonor', 'donor@test.com', 'DONOR'),
    ('testdonee', 'donee@test.com', 'DONEE'),
    ('admin', 'admin@test.com', 'DONOR')
ON CONFLICT ("username") DO NOTHING;

-- Create initial social impact points records for users
INSERT INTO "social_impact_points" ("user_id", "points")
SELECT "id", 0 FROM "users"
WHERE NOT EXISTS (
    SELECT 1 FROM "social_impact_points" 
    WHERE "social_impact_points"."user_id" = "users"."id"
);